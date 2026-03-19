require('./config/loadEnv');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const mongoose = require('mongoose');
const path = require('path');

// Config & Utils
const connectDB = require('./config/db');
const { getBooleanEnv, getNumberEnv, validateEnvironment } = require('./config/env');
const { startIndexer } = require('./indexer');
const AppError = require('./utils/AppError');
const errorMiddleware = require('./middleware/errorMiddleware');
const { createRateLimiter } = require('./middleware/rateLimit');

// Routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const agentRoutes = require('./routes/agents');
const forumRoutes = require('./routes/forum');
const auctionRoutes = require('./routes/auctions');
const purchaseRoutes = require('./routes/purchases');
const disputeRoutes = require('./routes/disputes');
const adminRoutes = require('./routes/admin');
const portalAuthRoutes = require('./routes/portalAuth');
const portalDataRoutes = require('./routes/portalData');
const apiKeyRoutes = require('./routes/api-keys');
const x402Routes = require('./routes/x402');

const app = express();
const PORT = process.env.PORT || 3001;
const allowedOrigins = (process.env.CORS_ORIGINS || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
const apiRateLimiter = createRateLimiter({
    windowMs: getNumberEnv('RATE_LIMIT_WINDOW_MS', 60_000),
    max: getNumberEnv('RATE_LIMIT_MAX_REQUESTS', 300),
    message: 'Too many API requests. Please try again shortly.'
});
const authRateLimiter = createRateLimiter({
    windowMs: getNumberEnv('RATE_LIMIT_WINDOW_MS', 60_000),
    max: getNumberEnv('AUTH_RATE_LIMIT_MAX_REQUESTS', 20),
    message: 'Too many authentication attempts. Please try again shortly.'
});

function getDatabaseStatus() {
    const states = {
        0: 'disconnected',
        1: 'connected',
        2: 'connecting',
        3: 'disconnecting'
    };

    return {
        state: states[mongoose.connection.readyState] || 'unknown',
        readyState: mongoose.connection.readyState
    };
}

app.disable('x-powered-by');
if (getBooleanEnv('TRUST_PROXY', false)) {
    app.set('trust proxy', 1);
}

// Middleware
app.use(cors({
    origin(origin, callback) {
        if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
            callback(null, true);
            return;
        }

        callback(null, false);
    },
    credentials: true,
    optionsSuccessStatus: 204
}));
app.use(bodyParser.json({ limit: '1mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '1mb' }));
app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Referrer-Policy', 'same-origin');
    res.setHeader('Cross-Origin-Resource-Policy', 'same-site');

    if (process.env.NODE_ENV === 'production') {
        res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    }

    next();
});
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Ensure uploads dir
if (!fs.existsSync(path.join(__dirname, 'uploads'))) {
    fs.mkdirSync(path.join(__dirname, 'uploads'));
}

// Basic Request Logging
app.use((req, res, next) => {
    if (req.path === '/health' || req.path === '/readyz') {
        next();
        return;
    }

    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// Health Check
app.get('/health', (req, res) => {
    res.json({
        status: 'UP',
        timestamp: new Date().toISOString(),
        env: process.env.NODE_ENV || 'development',
        database: getDatabaseStatus()
    });
});

app.get('/readyz', (req, res) => {
    const database = getDatabaseStatus();
    const isReady = database.readyState === 1;

    res.status(isReady ? 200 : 503).json({
        status: isReady ? 'READY' : 'DEGRADED',
        timestamp: new Date().toISOString(),
        database
    });
});

// API Routes
app.use('/api/auth', authRateLimiter, authRoutes);
app.use('/api/portal/auth', authRateLimiter, portalAuthRoutes);
app.use('/api', apiRateLimiter);
app.use('/api/users', userRoutes);
app.use('/api/agents', agentRoutes);
app.use('/api/forum', forumRoutes);
app.use('/api/auctions', auctionRoutes);
app.use('/api/purchases', purchaseRoutes);
app.use('/api/disputes', disputeRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/portal/data', portalDataRoutes);
app.use('/api/api-keys', apiKeyRoutes);
app.use('/api/x402', x402Routes);

// Serve the Admin Portal build specifically on the /portal path
const portalDir = path.join(__dirname, 'public-portal');
if (fs.existsSync(portalDir)) {
    app.use('/portal', express.static(portalDir));
    app.get(/^\/portal(?:\/.*)?$/, (req, res, next) => {
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
    app.get(/^(?!\/api(?:\/|$)).*/, (req, res, next) => {
        if (req.accepts('html')) {
            res.sendFile(path.join(publicDir, 'index.html'));
        } else {
            next();
        }
    });
}

// Global Error Handler
app.use(errorMiddleware);

let server = null;
let shuttingDown = false;

async function bootstrap() {
    const warnings = validateEnvironment();
    warnings.forEach((warning) => console.warn(`Startup warning: ${warning}`));

    await connectDB();

    server = app.listen(PORT, () => {
        console.log(`SAW Backend listening on http://localhost:${PORT}`);

        try {
            startIndexer().catch((err) => {
                console.error('Background indexer failed to start:', err.message);
            });
        } catch (error) {
            console.error('Failed to initialize indexer service:', error.message);
        }
    });
}

bootstrap().catch((err) => {
    console.error('Failed to bootstrap backend:', err.message);
    process.exit(1);
});

async function shutdown(signal) {
    if (shuttingDown) {
        return;
    }

    shuttingDown = true;
    console.log(`${signal} received: shutting down services`);

    if (server) {
        await new Promise((resolve, reject) => {
            server.close((error) => {
                if (error) {
                    reject(error);
                    return;
                }
                resolve();
            });
        });
        console.log('HTTP server closed');
    }

    if (mongoose.connection.readyState !== 0) {
        await mongoose.connection.close(false);
        console.log('MongoDB connection closed');
    }
}

['SIGINT', 'SIGTERM'].forEach((signal) => {
    process.on(signal, () => {
        shutdown(signal)
            .then(() => process.exit(0))
            .catch((error) => {
                console.error(`Failed during ${signal} shutdown:`, error.message);
                process.exit(1);
            });
    });
});
