const express = require('express');
const router = express.Router();
const Agent = require('../models/Agent');
const Purchase = require('../models/Purchase');
const User = require('../models/User');
const portalAuth = require('../middleware/portalAuthMiddleware');
const { ethers } = require('ethers');
const { PURCHASE_STATUS, normalizePurchaseStatus } = require('../utils/purchaseStatus');

// All routes here are protected by Portal Email/Pass Auth
router.use(portalAuth);

// Dashboard Stats
router.get('/stats', async (req, res) => {
    try {
        const totalAgents = await Agent.countDocuments();
        const totalUsers = await User.countDocuments();
        const totalPurchases = await Purchase.countDocuments();

        const purchases = await Purchase.find({
            status: { $ne: PURCHASE_STATUS.REFUNDED }
        });
        let totalVolume = 0;
        for (const p of purchases) {
            const agent = await Agent.findOne({ id: p.agentId });
            if (agent && agent.price) totalVolume += parseFloat(agent.price);
        }

        res.json({
            agents: totalAgents,
            users: totalUsers,
            sales: totalPurchases,
            volume: totalVolume.toFixed(2) + ' ETH',
            registryAddress: process.env.CONTRACT_ADDRESS || ''
        });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch portal stats' });
    }
});

// User List
router.get('/users', async (req, res) => {
    try {
        const users = await User.find().sort({ lastLogin: -1 });
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: 'Failed' });
    }
});

// Purchase List
router.get('/purchases', async (req, res) => {
    try {
        const purchases = await Purchase.find().sort({ timestamp: -1 });
        const enriched = await Promise.all(purchases.map(async (p) => {
            let agent = null;
            try {
                if (p.agentId) agent = await Agent.findOne({ id: p.agentId });
            } catch (e) {
                // Ignore CastError if test data had a string instead of number
            }
            return {
                ...p.toObject(),
                status: normalizePurchaseStatus(p.status),
                agentName: agent ? agent.name : 'Unknown Agent',
                price: agent ? agent.price : '0.0',
                seller: agent ? agent.owner : 'N/A'
            };
        }));
        res.json(enriched);
    } catch (err) {
        console.error("Purchases fetch error:", err);
        res.status(500).json({ error: 'Failed to fetch purchases' });
    }
});

// GET all disputed purchases for arbitration
router.get('/disputes', async (req, res) => {
    try {
        const disputes = await Purchase.find({
            status: { $in: [PURCHASE_STATUS.DISPUTED, 'DISPUTED'] }
        }).sort({ disputeDate: -1 });
        const abi = ["function resolveDispute(uint256 _escrowId, uint256 _buyerPayout, uint256 _creatorPayout) external"];
        const iface = new ethers.Interface(abi);

        const enriched = await Promise.all(disputes.map(async (d) => {
            let agent = null;
            try {
                if (d.agentId) agent = await Agent.findOne({ id: d.agentId });
            } catch (e) { }

            const priceEth = agent ? agent.price : '0';
            const escrowId = d.escrowId || 1;

            let payloadAccept = "";
            let payloadReject = "";

            try {
                const amountWei = ethers.parseEther(priceEth.toString());
                payloadAccept = iface.encodeFunctionData("resolveDispute", [escrowId, amountWei, 0]);
                payloadReject = iface.encodeFunctionData("resolveDispute", [escrowId, 0, amountWei]);
            } catch (e) {
                payloadAccept = "Error generating payload";
                payloadReject = "Error generating payload";
            }

            return {
                ...d.toObject(),
                status: normalizePurchaseStatus(d.status),
                escrowId,
                agentName: agent ? agent.name : 'Unknown Agent',
                seller: agent ? (agent.owner || agent.creator) : 'Unknown',
                price: priceEth,
                payloadAccept,
                payloadReject,
                targetContract: process.env.CONTRACT_ADDRESS || ''
            };
        }));
        // Inject the env contract address for the frontend payload builder
        res.json({ disputes: enriched, registryAddress: process.env.CONTRACT_ADDRESS });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch disputes' });
    }
});

// Smart Contract execution removed. Must use Safe UI payload generated on the frontend.

// RESOLVE Dispute (Buyer was right, Seller is a scammer)
// Marks as refunded in DB, but actual settlement requires Safe MultiSig execution
router.post('/disputes/:id/resolve', async (req, res) => {
    try {
        const purchase = await Purchase.findById(req.params.id);
        if (!purchase || normalizePurchaseStatus(purchase.status) !== PURCHASE_STATUS.DISPUTED) {
            return res.status(404).json({ error: 'Dispute not found' });
        }

        purchase.status = PURCHASE_STATUS.REFUNDED;
        await purchase.save();

        const agent = await Agent.findOne({ id: purchase.agentId });
        if (agent) {
            const trustEngine = require('../utils/trustEngine');
            const seller = agent.owner || agent.creator;
            await trustEngine.updateTrustScore(seller, -5.0, 'marketplace_outcome', 'admin');
        }

        res.json({ success: true, message: 'Dispute resolved locally. Action required on-chain via Safe.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed' });
    }
});

// REJECT Dispute (Buyer was lying/spamming, Seller is innocent)
// Marks as completed in DB, but actual settlement requires Safe MultiSig execution
router.post('/disputes/:id/reject', async (req, res) => {
    try {
        const purchase = await Purchase.findById(req.params.id);
        if (!purchase || normalizePurchaseStatus(purchase.status) !== PURCHASE_STATUS.DISPUTED) {
            return res.status(404).json({ error: 'Dispute not found' });
        }

        purchase.status = PURCHASE_STATUS.COMPLETED;
        await purchase.save();

        const trustEngine = require('../utils/trustEngine');
        await trustEngine.updateTrustScore(
            purchase.disputedByAddress || purchase.disputedBy,
            -3.0,
            'marketplace_outcome',
            'admin'
        );

        res.json({ success: true, message: 'Dispute rejected locally. Action required on-chain via Safe.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed' });
    }
});

// GET all PENDING_REVIEW agents
router.get('/pending', async (req, res) => {
    try {
        const pending = await Agent.find({ status: 'PENDING_REVIEW' }).sort({ dateCreated: -1 });
        res.json(pending);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch pending agents' });
    }
});

// Admin Review Actions
router.post('/pending/:id/:action', async (req, res) => {
    try {
        const agent = await Agent.findById(req.params.id);
        if (!agent) return res.status(404).json({ error: 'Agent not found' });

        const action = req.params.action;
        if (action === 'approve') {
            agent.status = 'LISTED';
        } else if (action === 'reject') {
            agent.status = 'REJECTED';
        } else {
            return res.status(400).json({ error: 'Invalid action' });
        }

        await agent.save();
        res.json({ success: true, message: `Agent ${action}d successfully.`, status: agent.status });
    } catch (err) {
        res.status(500).json({ error: 'Failed to process review' });
    }
});

module.exports = router;
