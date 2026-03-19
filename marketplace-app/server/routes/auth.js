const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const ethers = require('ethers');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const TrustEngine = require('../trust-engine/TrustEngine');
const { getRequiredEnv } = require('../config/env');
const trustEngine = new TrustEngine();

const nonces = {};

function getJwtSecret() {
    return getRequiredEnv('JWT_SECRET');
}

router.get('/nonce', (req, res) => {
    const { address } = req.query;
    if (!address) return res.status(400).json({ error: 'Address required' });

    const formattedAddress = address.toLowerCase();
    const nonce = crypto.randomBytes(16).toString('hex');

    // Memory protection - cap active addresses to prevent unbounded growth.
    if (Object.keys(nonces).length > 10000) {
        const oldestKey = Object.keys(nonces)[0];
        delete nonces[oldestKey];
    }

    if (!nonces[formattedAddress]) nonces[formattedAddress] = [];
    nonces[formattedAddress].push(nonce);

    if (nonces[formattedAddress].length > 3) nonces[formattedAddress].shift();

    res.json({ nonce });
});

router.post('/verify', async (req, res) => {
    const { address, signature } = req.body;
    if (!address || !signature) return res.status(400).json({ error: 'Missing data' });

    const formattedAddress = address.toLowerCase();
    const activeNonces = nonces[formattedAddress] || [];

    if (activeNonces.length === 0) {
        return res.status(400).json({ error: 'Nonce not found or expired. Please initialize connection again.' });
    }

    try {
        let validNonce = null;
        console.log(`--- Signature Verification for ${formattedAddress} ---`);
        console.log(`Checking against ${activeNonces.length} recent nonces.`);

        for (const nonce of activeNonces) {
            const message = `Login to SAW with Nonce: ${nonce}`;
            const recoveredAddress = ethers.verifyMessage(message, signature);

            if (recoveredAddress.toLowerCase() === formattedAddress) {
                validNonce = nonce;
                break;
            }
        }

        if (validNonce) {
            console.log('Identity match. Authorizing access.');
            nonces[formattedAddress] = [];

            let user = await User.findOne({ address: formattedAddress });
            if (!user) {
                user = await User.create({
                    address: formattedAddress,
                    authType: 'web3',
                    lastLogin: new Date()
                });
            } else {
                user.lastLogin = new Date();
                await user.save();
            }

            const currentScore = await trustEngine.computeUserTrust(formattedAddress);
            console.log(`Trust score for ${formattedAddress} on login: ${currentScore}`);

            const token = jwt.sign(
                { address: formattedAddress, username: user.username },
                getJwtSecret(),
                { expiresIn: '24h' }
            );

            res.json({ success: true, token, user });
        } else {
            console.log('Signature mismatch.');
            console.log('- Expected:', formattedAddress);
            res.status(401).json({ error: 'Signature verification failed', expected: formattedAddress });
        }
    } catch (error) {
        console.error('Signature verify error:', error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});

const authenticateToken = require('../middleware/authMiddleware');

router.get('/resume', authenticateToken, async (req, res) => {
    try {
        const user = await User.findOne({ address: req.user.address.toLowerCase() });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json({ success: true, user });
    } catch (err) {
        console.error('Resume session error:', err);
        res.status(500).json({ error: 'Failed to resume session' });
    }
});

module.exports = router;
