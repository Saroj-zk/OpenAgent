const mongoose = require('mongoose');

const agentSchema = new mongoose.Schema({
    id: { type: Number, required: true, unique: true },
    name: String,
    role: String,
    price: String,
    currency: { type: String, default: 'ETH' },
    description: String,
    owner: String,
    creator: String,
    model: String,
    tags: [String],
    dateCreated: { type: Date, default: Date.now },
    status: { type: String, default: 'Active' },
    image: String,
    github: String,
    version: String,
    contextWindow: String,
    architecture: String,
    framework: String,
    apiDependencies: String,
    inferenceService: String,
    license: String,
    videoLink: String,
    website: String,
    discord: String,
    telegram: String,
    docs: String,
    codeFile: String
}, { collection: 'agents' });

module.exports = mongoose.model('Agent', agentSchema);
