require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

// Config & Utils
const connectDB = require('./config/db');
const { startIndexer } = require('./indexer');
const AppError = require('./utils/AppError');
const errorMiddleware = require('./middleware/errorMiddleware');

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
const apiKeyRoutes = require('./routes/api-keys');
const x402Routes = require('./routes/x402');

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
// Basic Request Logging
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// Health Check
app.get('/health', (req, res) => {
    res.json({ 
        status: 'UP', 
        timestamp: new Date(), 
        env: process.env.NODE_ENV || 'development' 
    });
});

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
app.use('/api/api-keys', apiKeyRoutes);
app.use('/api/x402', x402Routes);

// --- Production Ready Static File Serving ---
// Serve the Admin Portal build specifically on the /portal path
const portalDir = path.join(__dirname, 'public-portal');
if (fs.existsSync(portalDir)) {
    app.use('/portal', express.static(portalDir));
    app.get('/portal/*', (req, res, next) => {
        if (req.accepts('html')) {
            res.sendFile(path.join(portalDir, 'index.html'));
        } else {
            next();
        }
    });
}

// Serve the Main App build on root
const publicDir = path.join(__dirname, 'public');
if (fs.existsSync(publicDir)) {
    app.use(express.static(publicDir));
}

// Catch-all for API (404)
app.use('/api', (req, res, next) => {
    next(new AppError(`API endpoint ${req.originalUrl} not found`, 404));
});

// SPA Catch-all for main app
if (fs.existsSync(publicDir)) {
    app.get('*', (req, res, next) => {
        if (req.accepts('html')) {
            res.sendFile(path.join(publicDir, 'index.html'));
        } else {
            next();
        }
    });
}

// Global Error Handler
app.use(errorMiddleware);

const server = app.listen(PORT, () => {
    console.log(`🚀 OpenAgent Backend: http://localhost:${PORT}`);
    
    // Start indexer asynchronously and catch errors to prevent server crash
    try {
        startIndexer().catch(err => {
            console.error("⚠️ Background Indexer failed to start:", err.message);
        });
    } catch (e) {
        console.error("⚠️ Failed to initialize Indexer service:", e.message);
    }
});

// Graceful Shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    server.close(() => {
        console.log('HTTP server closed');
        process.exit(0);
    });
});
