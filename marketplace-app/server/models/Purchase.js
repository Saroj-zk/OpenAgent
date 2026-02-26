const mongoose = require('mongoose');

const purchaseSchema = new mongoose.Schema({
    agentId: { type: String, required: true },
    buyer: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
}, { collection: 'purchases' });

module.exports = mongoose.model('Purchase', purchaseSchema);
