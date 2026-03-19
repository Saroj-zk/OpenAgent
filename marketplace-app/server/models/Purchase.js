const mongoose = require('mongoose');
const { PURCHASE_STATUS } = require('../utils/purchaseStatus');

const purchaseSchema = new mongoose.Schema({
    agentId: { type: String, required: true },
    buyer: { type: String, required: true },
    txHash: { type: String, default: null },
    timestamp: { type: Date, default: Date.now },
    status: { type: String, default: PURCHASE_STATUS.CREATED },
    escrowId: { type: String },
    expiryAt: { type: Date },
    trustTierSnapshot: { type: String },
    escrowHours: { type: Number },
    categorySnapshot: { type: String },
    disputeReason: { type: String, trim: true, maxlength: 2000 },
    disputeDate: { type: Date },
    disputedBy: { type: String, trim: true },
    disputedByAddress: { type: String, lowercase: true, trim: true },
    disputeEvidenceHash: { type: String, trim: true }
}, { collection: 'purchases' });

purchaseSchema.index({ txHash: 1 }, { unique: true, sparse: true });
purchaseSchema.index({ buyer: 1, escrowId: 1 }, { sparse: true });
purchaseSchema.index({ status: 1, disputeDate: -1 });

module.exports = mongoose.model('Purchase', purchaseSchema);
