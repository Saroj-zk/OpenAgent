const express = require('express');
const router = express.Router();
const x402Middleware = require('../middleware/x402-middleware');
const TrustEngine = require('../trust-engine/TrustEngine'); // Import for boost

const trustEngine = new TrustEngine();

/**
 * @route POST /api/x402/chat
 * @desc Demo endpoint for x402-protected AI Chat
 * @access Private (via x402)
 */
router.post('/chat', x402Middleware, async (req, res) => {
    try {
        const { message } = req.body;
        const agent = req.agent;

        // Simulate AI Logic
        const response = `[Agent ${agent.name}] I have received your payment and processed your request: "${message}"`;

        // Success! Boost the builder's Reputation in the Trust Engine
        if (agent.creator) {
            await trustEngine.updateTrustScore(agent.creator, 0.1, 'x402_inference');
            
            // Also increment the cumulative inference count for the builder
            const User = require('../models/User');
            await User.findOneAndUpdate(
                { username: agent.creator },
                { $inc: { successful_inferences_30d: 1 } }
            );
        }

        res.json({
            status: "success",
            agent: agent.name,
            reply: response,
            usage: {
                prompt_tokens: 15,
                completion_tokens: 30,
                cost_usdc: agent.inferencePrice || 0.05
            }
        });

    } catch (error) {
        console.error(`[x402 Demo] Error:`, error);
        res.status(500).json({ error: "Failed to process AI inference" });
    }
});

module.exports = router;
