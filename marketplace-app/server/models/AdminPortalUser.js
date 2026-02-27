const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const adminPortalUserSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    name: String,
    role: { type: String, default: 'admin' },
    createdAt: { type: Date, default: Date.now }
}, { collection: 'admin_portal_users' });

// Hash password before saving
adminPortalUserSchema.pre('save', async function () {
    if (!this.isModified('password')) return;
    this.password = await bcrypt.hash(this.password, 10);
});

// Compare password
adminPortalUserSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('AdminPortalUser', adminPortalUserSchema);
