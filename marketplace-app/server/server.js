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

// Global Error Handler
app.use((err, req, res, next) => {
    console.error("Unhandled Error:", err);
    res.status(500).json({ error: 'Internal Server Error' });
});

app.listen(PORT, () => {
    console.log(`🚀 OpenAgent Backend: http://localhost:${PORT}`);
    startIndexer();
});
