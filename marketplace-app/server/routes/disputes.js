const crypto = require('crypto');
const express = require('express');

const authenticateToken = require('../middleware/authMiddleware');
const Purchase = require('../models/Purchase');
const User = require('../models/User');
const { PURCHASE_STATUS, normalizePurchaseStatus } = require('../utils/purchaseStatus');

const router = express.Router();

router.post('/', authenticateToken, async (req, res) => {
    const escrowId = req.body?.escrowId?.toString().trim();
    const buyerAddress = req.user?.address?.toLowerCase();
    const evidence = typeof req.body?.evidence === 'string'
        ? req.body.evidence.trim().slice(0, 2000)
        : '';

    if (!escrowId) {
        return res.status(400).json({ error: 'Escrow ID is required' });
    }

    if (!buyerAddress) {
        return res.status(401).json({ error: 'Unauthorized buyer session' });
    }

    try {
        const purchase = await Purchase.findOne({ escrowId, buyer: buyerAddress });
        if (!purchase) {
            return res.status(404).json({ error: 'Purchase escrow not found for this buyer' });
        }

        const normalizedStatus = normalizePurchaseStatus(purchase.status);
        if ([PURCHASE_STATUS.REFUNDED, PURCHASE_STATUS.RESOLVED, PURCHASE_STATUS.FINALIZED].includes(normalizedStatus)) {
            return res.status(409).json({ error: 'This escrow can no longer be disputed' });
        }

        const user = await User.findOne({ address: buyerAddress });

        purchase.status = PURCHASE_STATUS.DISPUTED;
        purchase.disputeDate = purchase.disputeDate || new Date();
        purchase.disputedBy = user?.username || buyerAddress;
        purchase.disputedByAddress = buyerAddress;
        purchase.disputeReason = evidence || purchase.disputeReason || 'No reason provided.';
        purchase.disputeEvidenceHash = evidence
            ? `0x${crypto.createHash('sha256').update(evidence, 'utf8').digest('hex')}`
            : purchase.disputeEvidenceHash;

        await purchase.save();

        res.json({
            success: true,
            purchaseId: purchase._id,
            status: purchase.status
        });
    } catch (error) {
        console.error('Failed to persist dispute state:', error.message);
        res.status(500).json({ error: 'Failed to persist dispute state' });
    }
});

module.exports = router;
