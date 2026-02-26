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
const TRUST_EVENTS_FILE = path.join(__dirname, 'trust_events.json');

// Ensure directories and files exist
if (!fs.existsSync(path.join(__dirname, 'uploads'))) fs.mkdirSync(path.join(__dirname, 'uploads'));
if (!fs.existsSync(AGENTS_FILE)) fs.writeFileSync(AGENTS_FILE, '[]');
if (!fs.existsSync(USERS_FILE)) fs.writeFileSync(USERS_FILE, '{}');
if (!fs.existsSync(AUCTIONS_FILE)) fs.writeFileSync(AUCTIONS_FILE, '[]');
if (!fs.existsSync(FORUM_FILE)) fs.writeFileSync(FORUM_FILE, '[]');
if (!fs.existsSync(TRUST_EVENTS_FILE)) fs.writeFileSync(TRUST_EVENTS_FILE, '[]');

// Trust Engine Constants (LoL-Style)
const K_FACTOR = 0.12;
const SIGMOID_SCALE = 60;
const ALPHA = 0.08; // Contribution weight
const BETA = 0.9;   // Stake weight
const GAMMA = 0.15; // Agent usage weight
const LOG_A = 120;
const LOG_B = 0;

// Config Multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

// Storage Helpers
const read = (file) => JSON.parse(fs.readFileSync(file));
const write = (file, data) => fs.writeFileSync(file, JSON.stringify(data, null, 2));

// --- Trust Engine Core Logic ---

const sigmoid = (x) => 1 / (1 + Math.exp(-x / SIGMOID_SCALE));

const mappingHiddenToVisible = (h) => {
    return Math.floor(LOG_A * Math.log10(Math.max(0, h) + 1) + LOG_B);
};

const getRollingContributionPoints = (user) => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // In a real DB, this would be a query. For JSON, we filter history if available.
    // For now, assume rolling points are updated during events and we check the window.
    return user.contribution_points_rolling_30d || 0;
};

const computeDecay = (user, visibleTrust) => {
    if (!user.last_activity_at) return 0;
    const daysInactive = Math.max(0, (new Date() - new Date(user.last_activity_at)) / (1000 * 60 * 60 * 24));

    if (daysInactive <= 7) return 0;

    let delta = 0.03;
    if (visibleTrust >= 200) delta = 0.08;
    else if (visibleTrust >= 100) delta = 0.05;

    return delta * (daysInactive - 7);
};

const computeAgentUsageBoost = (username) => {
    // Σ log10(agent_successful_runs_last_30d + 1)
    const agents = read(AGENTS_FILE);
    const userAgents = agents.filter(a => a.owner && a.owner.toLowerCase() === username.toLowerCase());

    let totalUsageBoost = 0;
    userAgents.forEach(agent => {
        // Assume successful_runs is tracked on the agent object
        const runs = agent.successful_runs_30d || 0;
        totalUsageBoost += Math.log10(runs + 1);
    });

    return GAMMA * totalUsageBoost;
};

const computeUserTrust = (username) => {
    const users = read(USERS_FILE);
    const userKey = Object.keys(users).find(k => users[k].username && users[k].username.toLowerCase() === username.toLowerCase());
    if (!userKey) return 10;

    const user = users[userKey];

    // Initialize new fields if missing
    if (user.hidden_rating === undefined) user.hidden_rating = 10;
    if (user.staked_amount === undefined) user.staked_amount = 0;
    if (user.contribution_points_rolling_30d === undefined) user.contribution_points_rolling_30d = 0;
    if (user.contribution_points_lifetime === undefined) user.contribution_points_lifetime = 0;

    let h = user.hidden_rating;
    const visibleNow = mappingHiddenToVisible(h);

    // 1. Contribution Boost
    const cp = 0.7 * getRollingContributionPoints(user) + 0.3 * Math.log10((user.contribution_points_lifetime || 0) + 1);
    const contributionBoost = ALPHA * cp;

    // 2. Stake Boost (Diminishing returns + Anti-flash stake)
    let stakeBoost = 0;
    if (user.staked_amount > 0) {
        let actualStakeWeight = 1.0;
        const stakeAgeDays = user.stake_started_at ? (new Date() - new Date(user.stake_started_at)) / (1000 * 60 * 60 * 24) : 0;
        const isLocked = user.stake_lock_days_remaining > 0;

        if (stakeAgeDays < 7 && !isLocked) {
            actualStakeWeight = 0.2; // 20% until matured
        }
        stakeBoost = BETA * Math.log10(user.staked_amount + 1) * actualStakeWeight;
    }

    // 3. Agent Usage Boost
    const agentBoost = computeAgentUsageBoost(username);

    // 4. Decay
    const decay = computeDecay(user, visibleNow);

    const finalH = h + contributionBoost + stakeBoost + agentBoost - decay;
    const finalVisible = mappingHiddenToVisible(finalH);

    // Sync back if changed significantly or on periodic refresh
    user.visible_trust = finalVisible;
    user.last_trust_update_at = new Date().toISOString();

    return finalVisible;
};

const logTrustEvent = (userId, type, outcome, weightedPoints, sourceId = null, agentId = null) => {
    const events = read(TRUST_EVENTS_FILE);
    events.push({
        userId,
        type,
        outcome,
        weightedPoints,
        sourceId,
        agentId,
        createdAt: new Date().toISOString()
    });
    // Keep last 5000 events for performance in this simple JSON implementation
    if (events.length > 5000) events.shift();
    write(TRUST_EVENTS_FILE, events);
};

const updateTrustScore = (username, outcomeValue, type = 'general', sourceUser = null) => {
    if (!username) return;
    const users = read(USERS_FILE);
    const userKey = Object.keys(users).find(k => users[k].username && users[k].username.toLowerCase() === username.toLowerCase());

    if (userKey) {
        const user = users[userKey];

        // Ensure defaults
        if (user.hidden_rating === undefined) user.hidden_rating = 10;
        if (user.last_activity_at === undefined) user.last_activity_at = new Date().toISOString();
        if (user.daily_weighted_total === undefined || user.daily_total_date !== new Date().toISOString().split('T')[0]) {
            user.daily_total_date = new Date().toISOString().split('T')[0];
            user.daily_weighted_total = 0;
            user.daily_from_others = {};
        }

        let weight = 1.0;
        if (sourceUser && sourceUser !== username) {
            const sourceVisibleTrust = computeUserTrust(sourceUser);
            // weighted_points = base_points * clamp( log10(source_user_visible_trust + 10) / 2, 0.5, 2.0 )
            weight = Math.min(2.0, Math.max(0.5, Math.log10(sourceVisibleTrust + 10) / 2));

            // Interaction Caps (per user)
            if (!user.daily_from_others[sourceUser]) user.daily_from_others[sourceUser] = 0;
            if (outcomeValue > 0 && user.daily_from_others[sourceUser] >= 3.0) return;
        }

        let weightedPoints = outcomeValue * weight;

        // Global Daily Cap (15 weighted points)
        if (outcomeValue > 0) {
            if (user.daily_weighted_total >= 15.0) return;
            if (user.daily_weighted_total + weightedPoints > 15.0) {
                weightedPoints = 15.0 - user.daily_weighted_total;
            }
            user.daily_weighted_total += weightedPoints;
            if (sourceUser) user.daily_from_others[sourceUser] = (user.daily_from_others[sourceUser] || 0) + weightedPoints;
        }

        // MMR-like update: ΔOutcome = K * (Performance - Expected)
        const expected = sigmoid(user.hidden_rating);

        // Performance is 1.0/-1.0 for marketplace, or shifted sigmoid for social
        let performance = expected + weightedPoints;
        if (type === 'marketplace_outcome') performance = outcomeValue;

        const deltaOutcome = K_FACTOR * (performance - expected);

        user.hidden_rating += deltaOutcome;
        if (user.hidden_rating < 0) user.hidden_rating = 0;

        user.last_activity_at = new Date().toISOString();
        user.visible_trust = mappingHiddenToVisible(user.hidden_rating);

        logTrustEvent(username, type, outcomeValue, weightedPoints, sourceUser);
        write(USERS_FILE, users);
    }
};

// --- API ---

// STAKING
app.post('/api/users/stake', (req, res) => {
    const { username, amount, lockDays } = req.body;
    const users = read(USERS_FILE);
    const userKey = Object.keys(users).find(k => users[k].username === username);

    if (!userKey) return res.status(404).json({ error: 'User not found' });

    const user = users[userKey];
    user.staked_amount = (user.staked_amount || 0) + parseFloat(amount);
    user.stake_started_at = new Date().toISOString();
    user.stake_lock_days_remaining = lockDays || 0;

    write(USERS_FILE, users);
    res.json({ success: true, staked_amount: user.staked_amount });
});

app.post('/api/users/unstake', (req, res) => {
    const { username, amount } = req.body;
    const users = read(USERS_FILE);
    const userKey = Object.keys(users).find(k => users[k].username === username);

    if (!userKey) return res.status(404).json({ error: 'User not found' });

    const user = users[userKey];
    if (user.staked_amount < amount) return res.status(400).json({ error: 'Insufficient stake' });

    user.staked_amount -= amount;
    // Unstake penalty: Prevent temporary staking to inflate trust (8% drop in hidden rating)
    user.hidden_rating = (user.hidden_rating || 10) * 0.92;

    write(USERS_FILE, users);
    res.json({ success: true, staked_amount: user.staked_amount });
});

// CONTRIBUTIONS
app.post('/api/contributions', (req, res) => {
    const { username, type, points } = req.body;
    const users = read(USERS_FILE);
    const userKey = Object.keys(users).find(k => users[k].username === username);

    if (!userKey) return res.status(404).json({ error: 'User not found' });

    const user = users[userKey];
    user.contribution_points_lifetime = (user.contribution_points_lifetime || 0) + points;
    user.contribution_points_rolling_30d = (user.contribution_points_rolling_30d || 0) + points;

    write(USERS_FILE, users);

    // Also trigger an MMR update
    updateTrustScore(username, points * 0.1, `contribution_${type}`);

    res.json({ success: true, lifetime: user.contribution_points_lifetime });
});

// AGENTS
app.get('/api/agents', (req, res) => {
    const agents = read(AGENTS_FILE);
    const enriched = agents.map(agent => {
        return { ...agent, creatorTrust: computeUserTrust(agent.owner || agent.creator || 'builder') };
    });
    res.json(enriched);
});

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
        dateCreated: new Date().toISOString(),
        successful_runs_30d: 0 // New field for usage-weighted bonus
    };

    agents.unshift(newAgent);
    write(AGENTS_FILE, agents);

    // Reward for deploying - Treat as a Contribution or Outcome
    updateTrustScore(owner, 1.0, 'agent_deploy');

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
    const agents = read(AGENTS_FILE);
    const updated = agents.filter(a => a.id.toString() !== req.params.id.toString());
    write(AGENTS_FILE, updated);
    res.json({ success: true });
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
    const user = users[identifier];
    if (user && user.username) {
        user.visible_trust = computeUserTrust(user.username);
    }
    res.json(user || null);
});

app.post('/api/users', (req, res) => {
    const users = read(USERS_FILE);
    const { address, email, username, avatar, authType } = req.body;
    const identifier = (address || email).toLowerCase();

    users[identifier] = {
        ...(users[identifier] || {}),
        username: username || users[identifier]?.username,
        address: address || users[identifier]?.address,
        email: email || users[identifier]?.email,
        avatar: avatar || users[identifier]?.avatar,
        authType: authType || users[identifier]?.authType,
        lastLogin: new Date().toISOString(),
        last_activity_at: new Date().toISOString()
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

        // Reward for high-intent activity
        updateTrustScore(bidder, 0.2, 'place_bid');

        return res.json({ success: true });
    }
    res.status(404).json({ error: 'Auction not found' });
});

// FORUM
app.get('/api/forum', (req, res) => {
    const forum = read(FORUM_FILE);
    const enrichedForum = forum.map(post => {
        const enrichedComments = (post.comments || []).map(comment => {
            return { ...comment, authorTrust: computeUserTrust(comment.author) };
        });
        return { ...post, comments: enrichedComments, authorTrust: computeUserTrust(post.author) };
    });
    res.json(enrichedForum);
});

app.post('/api/forum', (req, res) => {
    const { author, content, agentId } = req.body;
    if (!author || (!content && !agentId)) return res.status(400).json({ error: 'Author and either content or agent are required' });

    const users = read(USERS_FILE);
    const userKey = Object.keys(users).find(k => users[k].username && users[k].username.toLowerCase() === author.toLowerCase());

    if (userKey) {
        const user = users[userKey];
        const today = new Date().toISOString().split('T')[0];
        if (user.daily_posts_date !== today) {
            user.daily_posts_date = today;
            user.daily_posts_count = 0;
        }

        const trustScore = computeUserTrust(author);
        let maxPosts = 1; // Default low level
        if (trustScore >= 100) maxPosts = 15;
        else if (trustScore >= 50) maxPosts = 10;
        else if (trustScore >= 20) maxPosts = 5;
        else if (trustScore >= 10) maxPosts = 3;

        if (user.daily_posts_count >= maxPosts) {
            return res.status(429).json({ error: `Daily limit (${maxPosts} posts) reached for your trust tier. Increase trust to post more.` });
        }

        user.daily_posts_count += 1;
        write(USERS_FILE, users);
    }

    updateTrustScore(author, 0.5, 'post_forum');

    const newPost = {
        id: Date.now().toString(),
        author,
        content,
        agentId: agentId || null,
        likes: 0,
        likedBy: [],
        comments: [],
        timestamp: new Date().toISOString()
    };

    const forum = read(FORUM_FILE);
    forum.unshift(newPost);
    write(FORUM_FILE, forum);
    res.status(201).json(newPost);
});

app.post('/api/forum/:id/comment', (req, res) => {
    const forum = read(FORUM_FILE);
    const { id } = req.params;
    const { author, content } = req.body;

    const postIndex = forum.findIndex(p => p.id === id);
    if (postIndex === -1) return res.status(404).json({ error: 'Post not found' });

    const newComment = {
        id: Date.now().toString(),
        author,
        content,
        timestamp: new Date().toISOString(),
    };

    forum[postIndex].comments.push(newComment);
    write(FORUM_FILE, forum);

    // Engagement logic
    const textLower = content.toLowerCase();
    let points = 0.25;
    if (['great', 'awesome', 'good', 'love', 'based'].some(w => textLower.includes(w))) points += 0.1;
    if (['scam', 'fake', 'bad'].some(w => textLower.includes(w))) points -= 0.3;

    updateTrustScore(author, points, 'comment', forum[postIndex].author);
    if (forum[postIndex].author !== author) {
        updateTrustScore(forum[postIndex].author, Math.max(0.1, points), 'receive_comment', author);
    }

    // Return the new comment with authorTrust for immediate UI rendering
    res.json({ ...newComment, authorTrust: computeUserTrust(author) });
});

app.post('/api/forum/:id/like', (req, res) => {
    const forum = read(FORUM_FILE);
    const { id } = req.params;
    const { author } = req.body;

    const postIndex = forum.findIndex(p => p.id === id);
    if (postIndex === -1) return res.status(404).json({ error: 'Post not found' });

    const post = forum[postIndex];
    if (!post.likedBy) post.likedBy = [];
    const hasLiked = post.likedBy.includes(author);

    if (hasLiked) {
        post.likedBy = post.likedBy.filter(a => a !== author);
        post.likes = Math.max(0, post.likes - 1);
        if (post.author !== author) updateTrustScore(post.author, -0.2, 'receive_like_removed', author);
    } else {
        post.likedBy.push(author);
        post.likes += 1;
        if (post.author !== author) updateTrustScore(post.author, 0.2, 'receive_like', author);
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
