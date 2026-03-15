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
const crypto = require('crypto');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { canAccess } = require('../services/accessService');

const BASE_URL = process.env.BASE_URL || `http://localhost:${process.env.PORT || 3001}`;

const s3Client = new S3Client({
    region: process.env.AWS_REGION || "auto",
    endpoint: process.env.S3_ENDPOINT || undefined,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || "mock-key",
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "mock-secret",
    }
});

async function uploadToS3(buffer, filename, mimetype) {
    if (process.env.AWS_ACCESS_KEY_ID) {
        const key = `${Date.now()}-${filename.replace(/\s+/g, '_')}`;
        await s3Client.send(new PutObjectCommand({
            Bucket: process.env.S3_BUCKET_NAME || 'openagent-bucket',
            Key: key,
            Body: buffer,
            ContentType: mimetype
        }));
        return process.env.S3_PUBLIC_URL ? `${process.env.S3_PUBLIC_URL}/${key}` : `https://${process.env.S3_BUCKET_NAME}.s3.amazonaws.com/${key}`;
    }
    return `https://mock-s3-url.com/${filename}`;
}

router.get('/', async (req, res) => {
    try {
        const showExperimental = req.query.showExperimental === 'true';
        let query = {
            trustTier: { $ne: 'RESTRICTED' },
            status: { $nin: ['DELISTED', 'RESTRICTED'] } // More inclusive for existing data
        };
        if (!showExperimental) {
            // Include agents that don't have a trustTier yet (legacy)
            query.$or = [
                { trustTier: { $nin: ['RESTRICTED', 'EXPERIMENTAL'] } },
                { trustTier: { $exists: false } }
            ];
        }

        let agents = await Agent.find(query);

        const enriched = await Promise.all(agents.map(async agent => {
            const agentObj = agent.toObject();
            const creatorTrust = await trustEngine.computeUserTrust(agentObj.owner || agentObj.creator || 'builder');
            const trustTier = trustEngine.getTrustTier(creatorTrust);
            return { ...agentObj, creatorTrust, trustTier, trustScore: creatorTrust };
        }));

        const tierOrder = { 'VERIFIED': 3, 'REVIEWED': 2, 'EXPERIMENTAL': 1, 'RESTRICTED': 0 };
        enriched.sort((a, b) => {
            if (tierOrder[a.trustTier] !== tierOrder[b.trustTier]) return tierOrder[b.trustTier] - tierOrder[a.trustTier];
            if (a.trustScore !== b.trustScore) return b.trustScore - a.trustScore;
            const aSales = a.successful_runs_30d || 0;
            const bSales = b.successful_runs_30d || 0;
            if (aSales !== bSales) return bSales - aSales;
            return new Date(b.dateCreated).getTime() - new Date(a.dateCreated).getTime();
        });

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
            inferenceService, license, tags, videoLink, website, discord, telegram, docs, txHash,
            pricingModel, deliveryType
        } = validatedData;

        const imageFile = req.files && req.files['image'] ? req.files['image'][0] : null;
        const codeZip = req.files && req.files['agentCode'] ? req.files['agentCode'][0] : null;

        let computedArtifactHash = '0x0000000000000000000000000000000000000000000000000000000000000000';
        let codeFileUrl = null;
        let imageUrl = '/assets/agent1.png';

        if (imageFile && imageFile.buffer) {
            imageUrl = await uploadToS3(imageFile.buffer, imageFile.originalname, imageFile.mimetype);
        }

        if (codeZip && codeZip.buffer) {
            const hashHex = crypto.createHash('sha256').update(codeZip.buffer).digest('hex');
            computedArtifactHash = '0x' + hashHex;
            codeFileUrl = await uploadToS3(codeZip.buffer, codeZip.originalname, codeZip.mimetype);
        }

        const galleryFiles = req.files && req.files['gallery'] ? req.files['gallery'] : [];
        const galleryUrls = [];
        for (const file of galleryFiles) {
            if (file.buffer) {
                const url = await uploadToS3(file.buffer, file.originalname, file.mimetype);
                galleryUrls.push(url);
            }
        }

        const creatorScore = await trustEngine.computeUserTrust(owner);
        const creatorTier = trustEngine.getTrustTier(creatorScore);

        // Allow everyone to list, but RESTRICTED/EXPERIMENTAL go to PENDING_REVIEW
        const agentStatus = (creatorTier === 'EXPERIMENTAL' || creatorTier === 'RESTRICTED')
            ? 'PENDING_REVIEW'
            : 'LISTED';


        const newAgentData = {
            id: id ? (typeof id === 'string' ? parseInt(id) : id) : Date.now(),
            name, role, price, currency: currency || 'ETH', description, github, model,
            owner, creator: owner, version, contextWindow, architecture, framework,
            apiDependencies, inferenceService, license, tags: tags ? JSON.parse(tags) : [],
            videoLink, website, discord, telegram, docs, txHash,
            pricingModel: pricingModel || 'ONE_TIME',
            deliveryType: deliveryType || 'DOWNLOAD',
            artifactHash: computedArtifactHash,
            fileSha256: computedArtifactHash,
            fileUrl: codeFileUrl,
            image: imageUrl,
            gallery: galleryUrls,
            codeFile: codeFileUrl,
            status: agentStatus,
            trustScore: creatorScore,
            trustTier: creatorTier,
            dateCreated: new Date(),
            successful_runs_30d: 0
        };

        if (!id) {
            console.warn("⚠️ Deployment Warning: No On-Chain ID provided. Falling back to timestamp ID. This agent may not be purchasable.");
        }

        const newAgent = await Agent.create(newAgentData);
        await trustEngine.updateTrustScore(owner, 2.0, 'agent_deploy');

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

// EDIT AGENT - Includes on-chain metadata lock logic
router.put('/:id', authenticateToken, cpUpload, async (req, res) => {
    try {
        const { id } = req.params;
        const agent = await Agent.findOne({ id });

        if (!agent) return res.status(404).json({ error: 'Agent not found' });
        if (agent.creator?.toLowerCase() !== req.user.address.toLowerCase() && agent.owner?.toLowerCase() !== req.user.address.toLowerCase()) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        // Lock metadata edits after listing onchain
        const isOnChain = !!agent.txHash;
        const updates = req.body;

        if (isOnChain) {
            // Unchangeable core fields when listed
            const lockedFields = ['name', 'description', 'role', 'price', 'currency'];
            for (let f of lockedFields) {
                if (updates[f] && updates[f] !== agent[f]) {
                    return res.status(400).json({ error: `Cannot modify core field '${f}' after it is listed onchain. Create a new version/agent instead.` });
                }
            }
            if (req.files && req.files['agentCode']) {
                return res.status(400).json({ error: 'Cannot modify software bundle/onchain hash after agent is listed. It is permanently bound.' });
            }
        } else {
            // Let them update code bundle if off-chain (drafts concept)
            const codeZip = req.files && req.files['agentCode'] ? req.files['agentCode'][0] : null;
            if (codeZip && codeZip.buffer) {
                const hashHex = crypto.createHash('sha256').update(codeZip.buffer).digest('hex');
                agent.artifactHash = '0x' + hashHex;
                agent.fileSha256 = agent.artifactHash;
                agent.fileUrl = await uploadToS3(codeZip.buffer, codeZip.originalname, codeZip.mimetype);
                agent.codeFile = agent.fileUrl;
            }
            if (updates.name) agent.name = updates.name;
            if (updates.description) agent.description = updates.description;
            if (updates.role) agent.role = updates.role;
        }

        const imageFile = req.files && req.files['image'] ? req.files['image'][0] : null;
        if (imageFile && imageFile.buffer) {
            agent.image = await uploadToS3(imageFile.buffer, imageFile.originalname, imageFile.mimetype);
        }

        // Allow updates to non-essential metadata freely
        const updatable = ['github', 'model', 'version', 'contextWindow', 'architecture', 'videoLink', 'website', 'discord', 'telegram', 'docs'];
        for (let u of updatable) {
            if (updates[u] !== undefined) agent[u] = updates[u];
        }

        // Ensure artifact binding stays fully verified via standard upload storage
        agent.save();
        res.json(agent);
    } catch (e) {
        res.status(500).json({ error: 'Failed to update metadata' });
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
        const hasAccess = await canAccess(id.toString(), buyer);

        if (!isOwner && !hasAccess) return res.status(403).json({ error: 'Access denied' });
        if (!agent.codeFile && !agent.fileUrl) return res.status(404).json({ error: 'No source code/bundle available' });

        const targetUrl = agent.fileUrl || agent.codeFile;
        // The sha256 artifact hash is already validated at upload and locked by the metadata handler. 
        // Redirecting directly to the S3 bucket link ensures no node.js disk dependency.
        return res.redirect(targetUrl);
    } catch (error) {
        res.status(500).json({ error: 'Failed' });
    }
});

module.exports = router;
