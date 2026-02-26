const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const Agent = require('../models/Agent');
const ForumPost = require('../models/ForumPost');
const Purchase = require('../models/Purchase');
const authenticateToken = require('../middleware/authMiddleware');
const { cpUpload } = require('../middleware/uploadMiddleware');
const trustEngine = require('../utils/trustEngine');
const { AgentSchema } = require('../utils/validation');

const BASE_URL = process.env.BASE_URL || `http://localhost:${process.env.PORT || 3001}`;

router.get('/', async (req, res) => {
    try {
        const agents = await Agent.find().sort({ id: -1 });
        const enriched = await Promise.all(agents.map(async agent => {
            const agentObj = agent.toObject();
            const creatorTrust = await trustEngine.computeUserTrust(agentObj.owner || agentObj.creator || 'builder');
            return { ...agentObj, creatorTrust };
        }));
        res.json(enriched);
    } catch (err) {
        res.status(500).json({ error: 'Database fetch failed' });
    }
});

router.post('/', authenticateToken, cpUpload, async (req, res) => {
    try {
        const validatedData = AgentSchema.parse(req.body);
        const {
            id, name, role, price, currency, description, owner, github, model,
            version, contextWindow, architecture, framework, apiDependencies,
            inferenceService, license, tags, videoLink, website, discord, telegram, docs, txHash
        } = validatedData;

        const imageFile = req.files && req.files['image'] ? req.files['image'][0] : null;
        const codeZip = req.files && req.files['agentCode'] ? req.files['agentCode'][0] : null;

        const newAgentData = {
            id: id ? (typeof id === 'string' ? parseInt(id) : id) : Date.now(),
            name, role, price, currency: currency || 'ETH', description, github, model,
            owner, creator: owner, version, contextWindow, architecture, framework,
            apiDependencies, inferenceService, license, tags: tags ? JSON.parse(tags) : [],
            videoLink, website, discord, telegram, docs, txHash,
            image: imageFile ? (imageFile.location || `${BASE_URL}/uploads/${imageFile.filename}`) : '/assets/agent1.png',
            codeFile: codeZip ? (codeZip.location || codeZip.filename) : null,
            status: 'Active',
            dateCreated: new Date(),
            successful_runs_30d: 0
        };

        const newAgent = await Agent.create(newAgentData);
        await trustEngine.updateTrustScore(owner, 1.0, 'agent_deploy');

        // Auto-post to forum
        await ForumPost.create({
            id: 'auto-' + Date.now().toString(),
            author: owner,
            content: `I just deployed a new entity to the network: ${name}.\n\nRole: ${role}\nPrice: ${price} ${currency || 'ETH'}\n\nInitialize acquisition below.`,
            agentId: newAgent.id.toString(),
            timestamp: new Date()
        });

        res.status(201).json(newAgent);
    } catch (error) {
        if (error.name === 'ZodError') {
            return res.status(400).json({ error: 'Validation failed', details: error.errors });
        }
        console.error("Agent creation error:", error);
        res.status(500).json({ error: 'Failed to create agent' });
    }
});

router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const result = await Agent.deleteOne({ id: req.params.id });
        if (result.deletedCount === 0) return res.status(404).json({ error: 'Agent not found' });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed' });
    }
});

// DOWNLOAD AGENT CODE
router.get('/:id/download', async (req, res) => {
    try {
        const { id } = req.params;
        const buyer = req.query.buyer?.toLowerCase();
        if (!buyer) return res.status(400).json({ error: 'Wallet address required' });

        const agent = await Agent.findOne({ id });
        if (!agent) return res.status(404).json({ error: 'Agent not found' });

        const isOwner = agent.creator?.toLowerCase() === buyer || agent.owner?.toLowerCase() === buyer;
        const hasBought = await Purchase.findOne({ agentId: id.toString(), buyer });

        if (!isOwner && !hasBought) return res.status(403).json({ error: 'Access denied' });
        if (!agent.codeFile) return res.status(404).json({ error: 'No source code available' });

        if (agent.codeFile.startsWith('http://') || agent.codeFile.startsWith('https://')) {
            // S3 or Cloud URL
            return res.redirect(agent.codeFile);
        } else {
            // Local fallback
            const filePath = path.join(__dirname, '..', 'uploads', agent.codeFile);
            if (fs.existsSync(filePath)) {
                return res.download(filePath, `${agent.name.replace(/\s+/g, '_')}_Source.zip`);
            } else {
                return res.status(404).json({ error: 'File not found on server' });
            }
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed' });
    }
});

module.exports = router;
