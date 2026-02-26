const express = require('express');
const router = express.Router();
const User = require('../models/User');
const authenticateToken = require('../middleware/authMiddleware');
const trustEngine = require('../utils/trustEngine');

// STAKING
router.post('/stake', authenticateToken, async (req, res) => {
    const { username, amount, lockDays } = req.body;
    try {
        const user = await User.findOne({ username });
        if (!user) return res.status(404).json({ error: 'User not found' });

        user.staked_amount = (user.staked_amount || 0) + parseFloat(amount);
        user.stake_started_at = new Date();
        user.stake_lock_days_remaining = lockDays || 0;

        await user.save();
        res.json({ success: true, staked_amount: user.staked_amount });
    } catch (err) {
        res.status(500).json({ error: 'Staking failed' });
    }
});

router.post('/unstake', authenticateToken, async (req, res) => {
    const { username, amount } = req.body;
    try {
        const user = await User.findOne({ username });
        if (!user) return res.status(404).json({ error: 'User not found' });

        if ((user.staked_amount || 0) < amount) return res.status(400).json({ error: 'Insufficient stake' });

        user.staked_amount -= amount;
        user.hidden_rating = (user.hidden_rating || 10) * 0.92;

        await user.save();
        res.json({ success: true, staked_amount: user.staked_amount });
    } catch (err) {
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
