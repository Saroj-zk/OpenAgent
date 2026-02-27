const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const AdminPortalUser = require('../models/AdminPortalUser');

const JWT_SECRET = process.env.JWT_SECRET || 'portal_secret_777';

// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await AdminPortalUser.findOne({ email });

        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const token = jwt.sign(
            { id: user._id, email: user.email, role: user.role, isPortal: true },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            token,
            user: { name: user.name, email: user.email, role: user.role }
        });
    } catch (err) {
        res.status(500).json({ error: 'Login failed' });
    }
});

// Setup Initial Admin (One-time or helper)
router.post('/setup', async (req, res) => {
    try {
        const count = await AdminPortalUser.countDocuments();
        if (count > 0) return res.status(400).json({ error: 'Admin already exists' });

        const { email, password, name } = req.body;
        const newUser = new AdminPortalUser({ email, password, name });
        await newUser.save();

        res.json({ success: true, message: 'Portal admin created' });
    } catch (err) {
        res.status(500).json({ error: 'Setup failed' });
    }
});

module.exports = router;
