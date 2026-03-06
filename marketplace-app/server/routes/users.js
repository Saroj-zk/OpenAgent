const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Subscription = require('../models/Subscription');
const authenticateToken = require('../middleware/authMiddleware');
const trustEngine = require('../utils/trustEngine');

// STAKING
router.post('/stake', authenticateToken, async (req, res) => {
    const { username, amount, lockDays } = req.body;
    const identifier = username?.toLowerCase();
    try {
        const user = await User.findOne({
            $or: [{ username: identifier }, { address: identifier }]
        });
        if (!user) return res.status(404).json({ error: 'User profile not found in database' });

        user.staked_amount = (user.staked_amount || 0) + parseFloat(amount);
        user.stake_started_at = new Date();
        user.stake_lock_days_remaining = lockDays || 0;

        await user.save();

        // Recalculate trust score immediately after staking
        const newScore = await trustEngine.computeUserTrust(user.username || user.address);

        res.json({
            success: true,
            staked_amount: user.staked_amount,
            newTrustScore: newScore
        });
    } catch (err) {
        console.error("Staking Error:", err);
        res.status(500).json({ error: 'Staking failed' });
    }
});

router.post('/unstake', authenticateToken, async (req, res) => {
    const { username, amount } = req.body;
    const identifier = username?.toLowerCase();
    try {
        const user = await User.findOne({
            $or: [{ username: identifier }, { address: identifier }]
        });
        if (!user) return res.status(404).json({ error: 'User profile not found in database' });

        if ((user.staked_amount || 0) < amount) return res.status(400).json({ error: 'Insufficient stake' });

        user.staked_amount -= amount;
        // The "Withdrawal Slash" 8% penalty to hidden rating
        user.hidden_rating = (user.hidden_rating || 10) * 0.92;

        await user.save();

        // Recalculate trust score immediately after unstaking
        const newScore = await trustEngine.computeUserTrust(user.username || user.address);

        res.json({
            success: true,
            staked_amount: user.staked_amount,
            newTrustScore: newScore
        });
    } catch (err) {
        console.error("Unstaking Error:", err);
        res.status(500).json({ error: 'Unstaking failed' });
    }
});

// CONTRIBUTIONS
router.post('/contributions', authenticateToken, async (req, res) => {
    const { username, type, points } = req.body;
    try {
        const user = await User.findOne({ username });
        if (!user) return res.status(404).json({ error: 'User not found' });

        user.contribution_points_lifetime = (user.contribution_points_lifetime || 0) + points;
        user.contribution_points_rolling_30d = (user.contribution_points_rolling_30d || 0) + points;

        await user.save();
        await trustEngine.updateTrustScore(username, points * 0.1, `contribution_${type}`);

        res.json({ success: true, lifetime: user.contribution_points_lifetime });
    } catch (err) {
        res.status(500).json({ error: 'Contribution update failed' });
    }
});

// USERS / IDENTITY
router.get('/usernames', async (req, res) => {
    try {
        const users = await User.find({ username: { $exists: true, $ne: null } });
        res.json(users.map(u => u.username));
    } catch (err) {
        res.status(500).json([]);
    }
});

router.get('/:identifier', async (req, res) => {
    try {
        const identifier = req.params.identifier.toLowerCase();
        const user = await User.findOne({
            $or: [{ address: identifier }, { username: identifier }]
        });
        if (user && user.username) {
            const visible_trust = await trustEngine.computeUserTrust(user.username);
            return res.json({ ...user.toObject(), visible_trust });
        }
        res.json(user);
    } catch (err) {
        res.status(500).json(null);
    }
});

router.get('/:address/subscriptions', async (req, res) => {
    try {
        const subscriptions = await Subscription.find({
            userAddress: req.params.address.toLowerCase(),
            status: 'ACTIVE',
            expiresAt: { $gt: new Date() }
        });
        res.json(subscriptions);
    } catch (err) {
        res.status(500).json([]);
    }
});

router.get('/:address/subscriptions/:agentId', async (req, res) => {
    try {
        const sub = await Subscription.findOne({
            userAddress: req.params.address.toLowerCase(),
            agentId: req.params.agentId
        });
        if (!sub) return res.status(404).json({ error: 'Not found' });
        res.json(sub);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

router.post('/', authenticateToken, async (req, res) => {
    const { address, email, username, avatar, authType } = req.body;
    try {
        const identifier = (address || email).toLowerCase();
        const update = {
            address: address?.toLowerCase(),
            email, username, avatar, authType,
            last_activity_at: new Date()
        };
        const user = await User.findOneAndUpdate({ address: identifier }, update, { upsert: true, new: true });
        res.json({ success: true, user });
    } catch (err) {
        res.status(500).json({ error: 'Failed' });
    }
});

module.exports = router;
