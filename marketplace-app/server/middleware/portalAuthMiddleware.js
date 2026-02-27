const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'portal_secret_777';

module.exports = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        if (!decoded.isPortal) throw new Error('Invalid token type');
        req.portalUser = decoded;
        next();
    } catch (err) {
        res.status(401).json({ error: 'Unauthorized Portal Access' });
    }
};
