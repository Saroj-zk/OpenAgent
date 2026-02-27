require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

// Config & Utils
const connectDB = require('./config/db');
const { startIndexer } = require('./indexer');

// Routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const agentRoutes = require('./routes/agents');
const forumRoutes = require('./routes/forum');
const auctionRoutes = require('./routes/auctions');
const purchaseRoutes = require('./routes/purchases');
const adminRoutes = require('./routes/admin');
const portalAuthRoutes = require('./routes/portalAuth');
const portalDataRoutes = require('./routes/portalData');

// Initialize Database
connectDB();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Ensure uploads dir
if (!fs.existsSync(path.join(__dirname, 'uploads'))) fs.mkdirSync(path.join(__dirname, 'uploads'));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/agents', agentRoutes);
app.use('/api/forum', forumRoutes);
app.use('/api/auctions', auctionRoutes);
app.use('/api/purchases', purchaseRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/portal/auth', portalAuthRoutes);
app.use('/api/portal/data', portalDataRoutes);

// --- Production Ready Static File Serving ---
// Serve the Admin Portal build specifically on the /portal path
app.use('/portal', express.static(path.join(__dirname, 'public-portal')));
app.use('/portal', (req, res, next) => {
    if (req.method !== 'GET') return next();
    res.sendFile(path.join(__dirname, 'public-portal', 'index.html'));
});

// Serve the Main App build on root
app.use(express.static(path.join(__dirname, 'public')));

// Catch-all API 404 to prevent HTML response for unknown APIs
app.use('/api', (req, res) => {
    res.status(404).json({ error: 'API endpoint not found' });
});

// Catch-all for main app router
app.use((req, res, next) => {
    if (req.method !== 'GET') return next();
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error("Unhandled Error:", err);
    res.status(500).json({ error: 'Internal Server Error' });
});

app.listen(PORT, () => {
    console.log(`🚀 OpenAgent Backend: http://localhost:${PORT}`);
    startIndexer();
});
