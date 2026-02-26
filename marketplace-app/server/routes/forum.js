const express = require('express');
const router = express.Router();
const ForumPost = require('../models/ForumPost');
const User = require('../models/User');
const authenticateToken = require('../middleware/authMiddleware');
const trustEngine = require('../utils/trustEngine');
const { PostSchema } = require('../utils/validation');

router.get('/', async (req, res) => {
    try {
        const posts = await ForumPost.find().sort({ timestamp: -1 });
        const enriched = await Promise.all(posts.map(async post => {
            const authorTrust = await trustEngine.computeUserTrust(post.author);
            const comments = await Promise.all((post.comments || []).map(async c => ({
                ...c.toObject(),
                authorTrust: await trustEngine.computeUserTrust(c.author)
            })));
            return { ...post.toObject(), authorTrust, comments };
        }));
        res.json(enriched);
    } catch (err) {
        res.status(500).json([]);
    }
});

router.post('/', authenticateToken, async (req, res) => {
    try {
        const validatedData = PostSchema.parse(req.body);
        const { author, content, agentId } = validatedData;

        const user = await User.findOne({ username: author });
        if (user) {
            const trustScore = await trustEngine.computeUserTrust(author);
            let maxPosts = 1;
            if (trustScore >= 100) maxPosts = 15;
            else if (trustScore >= 50) maxPosts = 10;
            else if (trustScore >= 20) maxPosts = 5;
            else if (trustScore >= 10) maxPosts = 3;

            const today = new Date().toISOString().split('T')[0];
            if (user.daily_posts_date !== today) {
                user.daily_posts_date = today;
                user.daily_posts_count = 0;
            }

            if (user.daily_posts_count >= maxPosts) return res.status(429).json({ error: 'Limit reached' });
            user.daily_posts_count += 1;
            await user.save();
        }

        const newPost = await ForumPost.create({
            id: Date.now().toString(),
            author, content, agentId: agentId || null,
            timestamp: new Date()
        });
        await trustEngine.updateTrustScore(author, 0.5, 'post_forum');
        res.status(201).json(newPost);
    } catch (err) {
        res.status(500).json({ error: 'Failed' });
    }
});

router.post('/:id/comment', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { author, content } = req.body;
    try {
        const post = await ForumPost.findOne({ id });
        if (!post) return res.status(404).json({ error: 'Not found' });

        const comment = { id: Date.now().toString(), author, content, timestamp: new Date() };
        post.comments.push(comment);
        await post.save();

        let points = 0.25;
        const textLower = content.toLowerCase();
        if (['great', 'awesome', 'good', 'love', 'based'].some(w => textLower.includes(w))) points += 0.1;
        if (['scam', 'fake', 'bad'].some(w => textLower.includes(w))) points -= 0.3;

        await trustEngine.updateTrustScore(author, points, 'comment', post.author);
        if (post.author !== author) await trustEngine.updateTrustScore(post.author, Math.max(0.1, points), 'receive_comment', author);

        res.json({ ...comment, authorTrust: await trustEngine.computeUserTrust(author) });
    } catch (err) {
        res.status(500).json({ error: 'Failed' });
    }
});

router.post('/:id/like', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { author } = req.body;
    try {
        const post = await ForumPost.findOne({ id });
        if (!post) return res.status(404).json({ error: 'Not found' });

        const hasLiked = post.likedBy?.includes(author);
        if (hasLiked) {
            post.likedBy = post.likedBy.filter(a => a !== author);
            post.likes = Math.max(0, post.likes - 1);
            if (post.author !== author) await trustEngine.updateTrustScore(post.author, -0.2, 'receive_like_removed', author);
        } else {
            post.likedBy.push(author);
            post.likes += 1;
            if (post.author !== author) await trustEngine.updateTrustScore(post.author, 0.2, 'receive_like', author);
        }
        await post.save();
        res.json({ success: true, likes: post.likes, hasLiked: !hasLiked });
    } catch (err) {
        res.status(500).json({ error: 'Failed' });
    }
});

module.exports = router;
