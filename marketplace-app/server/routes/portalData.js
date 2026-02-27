const express = require('express');
const router = express.Router();
const Agent = require('../models/Agent');
const Purchase = require('../models/Purchase');
const User = require('../models/User');
const portalAuth = require('../middleware/portalAuthMiddleware');

// All routes here are protected by Portal Email/Pass Auth
router.use(portalAuth);

// Dashboard Stats
router.get('/stats', async (req, res) => {
    try {
        const totalAgents = await Agent.countDocuments();
        const totalUsers = await User.countDocuments();
        const totalPurchases = await Purchase.countDocuments();

        const purchases = await Purchase.find({ status: { $ne: 'refunded' } });
        let totalVolume = 0;
        for (const p of purchases) {
            const agent = await Agent.findOne({ id: p.agentId });
            if (agent && agent.price) totalVolume += parseFloat(agent.price);
        }

        res.json({
            agents: totalAgents,
            users: totalUsers,
            sales: totalPurchases,
            volume: totalVolume.toFixed(2) + ' ETH'
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
        const disputes = await Purchase.find({ status: 'disputed' }).sort({ disputeDate: -1 });
        const enriched = await Promise.all(disputes.map(async (d) => {
            let agent = null;
            try {
                if (d.agentId) agent = await Agent.findOne({ id: d.agentId });
            } catch (e) { }
            return {
                ...d.toObject(),
                agentName: agent ? agent.name : 'Unknown Agent',
                seller: agent ? (agent.owner || agent.creator) : 'Unknown'
            };
        }));
        res.json(enriched);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch disputes' });
    }
});

// Smart Contract arbitration helper
const executeEscrowArbitration = async (agentId, buyerAddress, favorBuyer) => {
    try {
        const { ethers } = require('ethers');
        const privateKey = process.env.ADMIN_PRIVATE_KEY;
        if (!privateKey) {
            console.log("⚠️ Skipping on-chain escrow arbitration: ADMIN_PRIVATE_KEY missing.");
            return true;
        }

        const provider = new ethers.JsonRpcProvider(process.env.BASE_SEPOLIA_RPC);
        const wallet = new ethers.Wallet(privateKey, provider);
        const abi = ["function resolveEscrow(uint256 _agentId, address _buyer, bool _favorBuyer) external"];
        const contract = new ethers.Contract(process.env.CONTRACT_ADDRESS, abi, wallet);

        console.log(`📡 Sending arbitration to contract for Agent ${agentId} - Favor Buyer: ${favorBuyer}`);
        const tx = await contract.resolveEscrow(agentId, buyerAddress, favorBuyer);
        await tx.wait();
        console.log(`✅ Arbitration executed on-chain. TX Hash: ${tx.hash}`);
        return true;
    } catch (err) {
        console.error("❌ On-chain Escrow Error:", err);
        return false;
    }
};

// RESOLVE Dispute (Buyer was right, Seller is a scammer)
router.post('/disputes/:id/resolve', async (req, res) => {
    try {
        const purchase = await Purchase.findById(req.params.id);
        if (!purchase || purchase.status !== 'disputed') return res.status(404).json({ error: 'Dispute not found' });

        // Trigger on-chain arbitration (true = refund buyer)
        const ok = await executeEscrowArbitration(purchase.agentId, purchase.buyer || purchase.disputedBy, true);
        if (!ok) return res.status(500).json({ error: 'Smart contract escrow transaction failed' });

        purchase.status = 'refunded';
        await purchase.save();

        const agent = await Agent.findOne({ id: purchase.agentId });
        if (agent) {
            const trustEngine = require('../utils/trustEngine');
            const seller = agent.owner || agent.creator;
            await trustEngine.updateTrustScore(seller, -5.0, 'marketplace_outcome', 'admin');
        }

        res.json({ success: true, message: 'Dispute resolved in favor of buyer. Seller slashed.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed' });
    }
});

// REJECT Dispute (Buyer was lying/spamming, Seller is innocent)
router.post('/disputes/:id/reject', async (req, res) => {
    try {
        const purchase = await Purchase.findById(req.params.id);
        if (!purchase || purchase.status !== 'disputed') return res.status(404).json({ error: 'Dispute not found' });

        // Trigger on-chain arbitration (false = pay seller out of escrow)
        const ok = await executeEscrowArbitration(purchase.agentId, purchase.buyer || purchase.disputedBy, false);
        if (!ok) return res.status(500).json({ error: 'Smart contract escrow transaction failed' });

        purchase.status = 'completed';
        await purchase.save();

        const trustEngine = require('../utils/trustEngine');
        await trustEngine.updateTrustScore(purchase.disputedBy, -3.0, 'marketplace_outcome', 'admin');

        res.json({ success: true, message: 'Dispute rejected in favor of seller. Malicious buyer slashed.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed' });
    }
});

module.exports = router;
