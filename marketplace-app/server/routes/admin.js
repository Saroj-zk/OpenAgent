const express = require('express');
const router = express.Router();
const Agent = require('../models/Agent');

router.get('/stats', async (req, res) => {
    try {
        const count = await Agent.countDocuments();
        res.json({ totalAgents: count, totalVolume: '142.5 ETH', activeUsers: '1,240', platformFees: '3.56 ETH' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch stats' });
    }
});

module.exports = router;
