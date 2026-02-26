const express = require('express');
const router = express.Router();
const Purchase = require('../models/Purchase');
const authenticateToken = require('../middleware/authMiddleware');

router.post('/', authenticateToken, async (req, res) => {
    const { agentId, buyer, txHash } = req.body;
    if (!agentId || !buyer) return res.status(400).json({ error: 'Missing data' });
    try {
        const buyerLower = buyer.toLowerCase();

        let updateData = { timestamp: new Date() };
        if (txHash) {
            updateData.txHash = txHash;
        }

        await Purchase.findOneAndUpdate(
            { agentId: agentId.toString(), buyer: buyerLower },
            updateData,
            { upsert: true }
        );
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to record purchase' });
    }
});

router.get('/:buyer', async (req, res) => {
    try {
        const buyer = req.params.buyer.toLowerCase();
        const userPurchases = await Purchase.find({ buyer });
        res.json(userPurchases);
    } catch (error) {
        res.status(500).json({ error: 'Failed' });
    }
});

router.get('/sales/:seller', async (req, res) => {
    try {
        const seller = req.params.seller.toLowerCase();
        const Agent = require('../models/Agent');
        const userAgents = await Agent.find({ owner: seller });
        const agentIds = userAgents.map(a => a.id.toString());

        const sales = await Purchase.find({ agentId: { $in: agentIds } });
        res.json(sales);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch sales' });
    }
});

module.exports = router;
