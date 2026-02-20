const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const multer = require('multer');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const AGENTS_FILE = path.join(__dirname, 'agents.json');
const USERS_FILE = path.join(__dirname, 'users.json');
const AUCTIONS_FILE = path.join(__dirname, 'auctions.json');
const FORUM_FILE = path.join(__dirname, 'forum.json');

// Ensure directories and files exist
if (!fs.existsSync(path.join(__dirname, 'uploads'))) fs.mkdirSync(path.join(__dirname, 'uploads'));
if (!fs.existsSync(AGENTS_FILE)) fs.writeFileSync(AGENTS_FILE, '[]');
if (!fs.existsSync(USERS_FILE)) fs.writeFileSync(USERS_FILE, '{}');
if (!fs.existsSync(AUCTIONS_FILE)) fs.writeFileSync(AUCTIONS_FILE, '[]');
if (!fs.existsSync(FORUM_FILE)) fs.writeFileSync(FORUM_FILE, '[]');

// Config Multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

// Storage Helpers
const read = (file) => JSON.parse(fs.readFileSync(file));
const write = (file, data) => fs.writeFileSync(file, JSON.stringify(data, null, 2));

// --- API ---

// AGENTS
app.get('/api/agents', (req, res) => res.json(read(AGENTS_FILE)));

app.post('/api/agents', upload.single('image'), (req, res) => {
    const agents = read(AGENTS_FILE);
    const {
        id, name, role, price, currency, description, owner, github, model,
        version, contextWindow, architecture, framework, apiDependencies,
        inferenceService, license, tags, videoLink, website, discord, telegram, docs
    } = req.body;

    const newAgent = {
        id: id ? (typeof id === 'string' ? parseInt(id) : id) : Date.now(),
        name,
        role,
        price,
        currency: currency || 'ETH',
        description,
        github,
        model,
        owner,
        creator: owner,
        version,
        contextWindow,
        architecture,
        framework,
        apiDependencies,
        inferenceService,
        license,
        tags: tags ? JSON.parse(tags) : [],
        videoLink,
        website,
        discord,
        telegram,
        docs,
        image: req.file ? `http://localhost:${PORT}/uploads/${req.file.filename}` : '/assets/agent1.png',
        status: 'Active',
        dateCreated: new Date().toISOString()
    };

    agents.unshift(newAgent);
    write(AGENTS_FILE, agents);

    try {
        const forum = read(FORUM_FILE);
        const newPost = {
            id: 'auto-' + Date.now().toString(),
            author: owner,
            content: `I just deployed a new entity to the network: ${name}.\n\nRole: ${role}\nPrice: ${price} ${currency || 'ETH'}\n\nInitialize acquisition below.`,
            agentId: newAgent.id.toString(),
            likes: 0,
            comments: [],
            timestamp: new Date().toISOString()
        };
        forum.unshift(newPost);
        write(FORUM_FILE, forum);
    } catch (e) {
        console.error("Failed to auto-post to forum", e);
    }

    res.status(201).json(newAgent);
});

app.delete('/api/agents/:id', (req, res) => {
    try {
        const agents = read(AGENTS_FILE);
        const initialCount = agents.length;
        const updated = agents.filter(a => a.id.toString() !== req.params.id.toString());

        if (updated.length === initialCount) {
            return res.status(404).json({ error: 'Agent not found in registry' });
        }

        write(AGENTS_FILE, updated);
        res.json({ success: true });
    } catch (error) {
        console.error("Delete agent error:", error);
        res.status(500).json({ error: 'Failed to modify registry' });
    }
});

// USERS / IDENTITY
app.get('/api/users/usernames', (req, res) => {
    const users = read(USERS_FILE);
    const usernames = Object.values(users)
        .map(u => u.username)
        .filter(name => name && name.trim() !== '');
    res.json(usernames);
});

app.get('/api/users/:identifier', (req, res) => {
    const users = read(USERS_FILE);
    const identifier = req.params.identifier.toLowerCase();
    res.json(users[identifier] || null);
});

app.post('/api/users', (req, res) => {
    const users = read(USERS_FILE);
    const { address, email, username, avatar, authType } = req.body;

    // Use address for web3, email for google
    const identifier = (address || email).toLowerCase();

    users[identifier] = {
        ...(users[identifier] || {}), // Preserve existing data
        username: username || users[identifier]?.username,
        address: address || users[identifier]?.address,
        email: email || users[identifier]?.email,
        avatar: avatar || users[identifier]?.avatar,
        authType: authType || users[identifier]?.authType,
        lastLogin: new Date().toISOString()
    };

    write(USERS_FILE, users);
    res.json({ success: true, user: users[identifier] });
});

// AUCTIONS
app.get('/api/auctions', (req, res) => res.json(read(AUCTIONS_FILE)));

app.post('/api/auctions/bid', (req, res) => {
    const { auctionId, bidder, amount } = req.body;
    const auctions = read(AUCTIONS_FILE);
    const auction = auctions.find(a => a.id === auctionId);

    if (auction) {
        auction.highestBid = amount;
        auction.highestBidder = bidder;
        auction.bids = [...(auction.bids || []), { bidder, amount, time: new Date().toISOString() }];
        write(AUCTIONS_FILE, auctions);
        return res.json({ success: true });
    }
    res.status(404).json({ error: 'Auction not found' });
});

// Stats (Admin)
app.get('/api/admin/stats', (req, res) => {
    const agents = read(AGENTS_FILE);
    res.json({
        totalAgents: agents.length,
        totalVolume: '142.5 ETH',
        activeUsers: '1,240',
        platformFees: '3.56 ETH'
    });
});

// FORUM
// Extremely Complex Trust Engine Logic
const computeUserTrust = (username) => {
    const users = read(USERS_FILE);
    const userKey = Object.keys(users).find(k => users[k].username && users[k].username.toLowerCase() === username.toLowerCase());
    if (!userKey) return 10;

    const user = users[userKey];

    // 1. Account Age Factor
    const createdDate = new Date(user.createdAt || user.lastLogin || new Date());
    const daysOld = Math.max(1, (new Date() - createdDate) / (1000 * 60 * 60 * 24));
    const ageMultiplier = Math.min(2.0, 1.0 + (daysOld / 365)); // Up to 2x multiplier for 1 year old accounts

    // 2. Activity Decay (Inactivity penalty)
    const lastActive = new Date(user.lastLogin || new Date());
    const daysInactive = Math.max(0, (new Date() - lastActive) / (1000 * 60 * 60 * 24));
    let decayPenalty = 0;
    if (daysInactive > 7) {
        decayPenalty = (daysInactive - 7) * 0.5; // Lose 0.5 points per day after a week of inactivity
    }

    // 3. Agent Deployment Bonus
    const agents = read(AGENTS_FILE);
    const userAgents = agents.filter(a => a.owner && a.owner.toLowerCase() === username.toLowerCase()).length;
    const agentBonus = userAgents * 2; // Flat +2 trust per active agent

    // 4. Raw Earned Points
    let rawPoints = user.earnedTrustPoints || 0;
    if (user.trustScore && user.trustScore > 10 && rawPoints === 0) {
        // Backwards compatibility migration
        rawPoints = user.trustScore - 10;
        user.earnedTrustPoints = rawPoints;
    }

    // Compute Final Score
    let finalScore = 10 + agentBonus + (rawPoints * ageMultiplier) - decayPenalty;

    // Hard floors and soft caps
    if (finalScore < 0) finalScore = 0;
    // Logarithmic flattening after 100 to make it progressively harder to level up
    if (finalScore > 100) {
        finalScore = 100 + (Math.log10(finalScore - 99) * 20);
    }

    return Math.floor(finalScore);
};

app.get('/api/forum', (req, res) => {
    const forum = read(FORUM_FILE);

    // Inject dynamically calculated trust scores into posts
    const enrichedForum = forum.map(post => {
        return { ...post, authorTrust: computeUserTrust(post.author) };
    });

    res.json(enrichedForum);
});

app.post('/api/forum', (req, res) => {
    const forum = read(FORUM_FILE);
    const { author, content, agentId } = req.body;

    if (!author || !content || !agentId) return res.status(400).json({ error: 'Author, content, and agentId required' });

    // Trust Score Engine: Base reward for showcasing an agent
    updateTrustScore(author, 2.0, 'post_agent');

    const newPost = {
        id: Date.now().toString(),
        author,
        content,
        agentId,
        likes: 0,
        likedBy: [],
        comments: [],
        timestamp: new Date().toISOString()
    };

    forum.unshift(newPost);
    write(FORUM_FILE, forum);
    res.status(201).json(newPost);
});

app.post('/api/forum/:id/comment', (req, res) => {
    const forum = read(FORUM_FILE);
    const { id } = req.Params || req.params;
    const { author, content } = req.body;

    if (!author || !content) return res.status(400).json({ error: 'Author and content required' });

    const postIndex = forum.findIndex(p => p.id === id);
    if (postIndex === -1) return res.status(404).json({ error: 'Post not found' });

    // Anti-Manipulation: Has this author already commented on this post?
    const hasAlreadyCommented = forum[postIndex].comments.some(c => c.author === author);

    const newComment = {
        id: Date.now().toString(),
        author,
        content,
        timestamp: new Date().toISOString()
    };

    forum[postIndex].comments.push(newComment);
    write(FORUM_FILE, forum);

    if (!hasAlreadyCommented) {
        // Trust Score Engine: Reward commenter for participation (First time only per post)
        let points = 0.5; // fractional points
        const textLower = content.toLowerCase();
        if (textLower.includes('great') || textLower.includes('awesome') || textLower.includes('good') || textLower.includes('love') || textLower.includes('based') || textLower.includes('amazing')) {
            points += 0.5;
        }
        if (textLower.includes('scam') || textLower.includes('fake') || textLower.includes('bad')) {
            points -= 1.0;
        }

        // Ensure not giving too many points for spam words. 
        updateTrustScore(author, points, 'comment', forum[postIndex].author);

        // Reward post author for receiving unique engagement
        if (forum[postIndex].author !== author) {
            updateTrustScore(forum[postIndex].author, Math.max(0.5, points), 'receive_comment', author);
        }
    }

    res.json(newComment);
});

// Trust Engine Logic (Dynamic Point Accumulation)
// interactionType and interactor are used to prevent 1 person from farming a single user
const updateTrustScore = (username, points, interactionType = 'general', interactor = null) => {
    if (!username) return;
    const users = read(USERS_FILE);

    // Find user by username
    const userKey = Object.keys(users).find(k => users[k].username && users[k].username.toLowerCase() === username.toLowerCase());
    if (userKey) {
        const user = users[userKey];

        if (!user.createdAt) user.createdAt = new Date().toISOString();
        if (!user.earnedTrustPoints) user.earnedTrustPoints = (user.trustScore ? Math.max(0, user.trustScore - 10) : 0);
        if (!user.dailyEarned) user.dailyEarned = { date: new Date().toISOString().split('T')[0], total: 0, fromOthers: {} };

        const today = new Date().toISOString().split('T')[0];
        if (user.dailyEarned.date !== today) {
            user.dailyEarned = { date: today, total: 0, fromOthers: {} };
        }

        let finalPoints = points;

        // If someone else is interacting with this user
        if (interactor && interactor !== username) {
            // A click farm of new accounts has low trust value, establish weight based on interactor's own trust
            const interactorTrust = computeUserTrust(interactor);
            let interactorWeight = 0.5; // Low trust accounts effectively give half-points 
            if (interactorTrust >= 100) interactorWeight = 1.5; // Very high trust users act like a multiplier
            else if (interactorTrust >= 20) interactorWeight = 1.0;

            finalPoints *= interactorWeight;

            // Cap interactions between identical two accounts per day
            if (!user.dailyEarned.fromOthers[interactor]) user.dailyEarned.fromOthers[interactor] = 0;

            if (finalPoints > 0) {
                // If receiving positive points from them
                if (user.dailyEarned.fromOthers[interactor] >= 3.0) {
                    console.log(`Trust Engine: Daily cap reached between ${interactor} and ${username}`);
                    return; // Reached cap from this specific person today
                }
                user.dailyEarned.fromOthers[interactor] += finalPoints;
            }
        }

        // Global Daily Caps to prevent spamming to win
        if (finalPoints > 0) {
            if (user.dailyEarned.total >= 15.0) {
                return; // Hard cap of 15 raw points earned organically per day
            }
            // Ensure we don't go over daily cap on this transaction
            if (user.dailyEarned.total + finalPoints > 15.0) {
                finalPoints = 15.0 - user.dailyEarned.total;
            }
            user.dailyEarned.total += finalPoints;
        }

        user.earnedTrustPoints += finalPoints;
        if (user.earnedTrustPoints < 0) user.earnedTrustPoints = 0;

        // Still update the old trustScore for backwards compatibility during this transition
        user.trustScore = computeUserTrust(username);

        write(USERS_FILE, users);
    }
};

app.post('/api/forum/:id/like', (req, res) => {
    const forum = read(FORUM_FILE);
    const { id } = req.Params || req.params;
    const { author } = req.body; // The person who liked it

    const postIndex = forum.findIndex(p => p.id === id);
    if (postIndex === -1) return res.status(404).json({ error: 'Post not found' });

    const post = forum[postIndex];
    if (!post.likedBy) post.likedBy = [];

    const hasLiked = post.likedBy.includes(author);
    if (hasLiked) {
        // Unlike
        post.likedBy = post.likedBy.filter(a => a !== author);
        post.likes = Math.max(0, post.likes - 1);
        // Trust Score logic: retract points
        if (post.author !== author) updateTrustScore(post.author, -0.5, 'receive_like_removed', author);
    } else {
        // Like
        post.likedBy.push(author);
        post.likes += 1;
        // Trust Score logic: receiving a like boosts trust
        if (post.author !== author) updateTrustScore(post.author, 0.5, 'receive_like', author);
    }

    write(FORUM_FILE, forum);
    res.json({ success: true, likes: post.likes, hasLiked: !hasLiked });
});
app.get('/api/admin/stats', (req, res) => {
    const agents = read(AGENTS_FILE);
    res.json({
        totalAgents: agents.length,
        totalVolume: '142.5 ETH',
        activeUsers: '1,240',
        platformFees: '3.56 ETH'
    });
});

app.listen(PORT, () => console.log(`OpenAgent Backend: http://localhost:${PORT}`));
