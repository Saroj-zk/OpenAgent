const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const { verifyMessage } = require('ethers');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const nonces = {};
const JWT_SECRET = process.env.JWT_SECRET || 'openagent_secure_secret_fallback_123';

router.get('/nonce', (req, res) => {
    const { address } = req.query;
    if (!address) return res.status(400).json({ error: 'Address required' });
    const nonce = crypto.randomBytes(16).toString('hex');
    nonces[address.toLowerCase()] = nonce;
    res.json({ nonce });
});

router.post('/verify', async (req, res) => {
    const { address, signature } = req.body;
    if (!address || !signature) return res.status(400).json({ error: 'Missing data' });

    const formattedAddress = address.toLowerCase();
    const nonce = nonces[formattedAddress];
    if (!nonce) return res.status(400).json({ error: 'Nonce not found or expired' });

    try {
        const message = `Sign this message to prove you own this wallet and to log in to OpenAgent.\n\nNonce: ${nonce}`;
        const recoveredAddress = verifyMessage(message, signature);

        if (recoveredAddress.toLowerCase() === formattedAddress) {
            delete nonces[formattedAddress];

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

            const token = jwt.sign(
                { address: formattedAddress, username: user.username },
                JWT_SECRET,
                { expiresIn: '24h' }
            );

            res.json({ success: true, token, user });
        } else {
            res.status(401).json({ error: 'Signature verification failed' });
        }
    } catch (error) {
        console.error("Signature verify error:", error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
