const express = require('express');
const router = express.Router();
const Purchase = require('../models/Purchase');
const authenticateToken = require('../middleware/authMiddleware');
const { PURCHASE_STATUS } = require('../utils/purchaseStatus');

const Agent = require('../models/Agent');
const trustEngine = require('../utils/trustEngine');

router.post('/', authenticateToken, async (req, res) => {
    const { agentId, txHash } = req.body;
    const buyer = req.user.address;
    if (!agentId || !buyer) return res.status(400).json({ error: 'Missing data' });
    try {
        const buyerLower = buyer.toLowerCase();

        const buyerScore = await trustEngine.computeUserTrust(buyerLower);
        const buyerTier = trustEngine.getTrustTier(buyerScore);

        if (buyerTier === 'RESTRICTED') {
            return res.status(403).json({ error: 'Buyer account restricted due to trust score.' });
        }

        const agent = await Agent.findOne({ id: agentId.toString() });
        if (!agent) return res.status(404).json({ error: 'Agent not found' });

        const creatorScore = await trustEngine.computeUserTrust(agent.owner || agent.creator);
        const creatorTier = trustEngine.getTrustTier(creatorScore);

        if (creatorTier === 'RESTRICTED' || agent.trustTier === 'RESTRICTED') {
            return res.status(403).json({ error: 'Agent creator restricted due to trust score.' });
        }

        let escrowHours = 48; // Base for REVIEWED and VERIFIED
        if (creatorTier === 'EXPERIMENTAL') escrowHours = 72;

        const highRisk = ['Trading', 'Perps', 'Arbitrage'];
        const isHighRisk = agent.tags && agent.tags.some(tag => highRisk.includes(tag));
        if (isHighRisk) escrowHours = 72;

        const expiryAt = new Date();
        expiryAt.setHours(expiryAt.getHours() + escrowHours);

        let updateData = {
            timestamp: new Date(),
            trustTierSnapshot: creatorTier,
            escrowHours,
            categorySnapshot: isHighRisk ? 'HighRisk' : 'Standard',
            expiryAt,
            status: PURCHASE_STATUS.CREATED
        };
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
