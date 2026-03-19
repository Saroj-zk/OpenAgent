const jwt = require('jsonwebtoken');

function getPortalJwtSecret() {
    const secret = process.env.JWT_SECRET;

    if (!secret) {
        const error = new Error('JWT_SECRET environment variable is required for portal auth');
        error.statusCode = 500;
        throw error;
    }

    return secret;
}

module.exports = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }

    try {
        const decoded = jwt.verify(token, getPortalJwtSecret());
        if (!decoded.isPortal) throw new Error('Invalid token type');
        req.portalUser = decoded;
        next();
    } catch (err) {
        if (err.statusCode) {
            return res.status(err.statusCode).json({ error: err.message });
        }
        res.status(401).json({ error: 'Unauthorized Portal Access' });
    }
};
