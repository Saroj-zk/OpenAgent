const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Unauthorized: Missing token' });

    const JWT_SECRET = process.env.JWT_SECRET;
    if (!JWT_SECRET) return res.status(500).json({ error: 'Server misconfiguration: JWT_SECRET missing' });

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: 'Forbidden: Invalid or expired token' });
        req.user = user;
        next();
    });
};

module.exports = authenticateToken;
