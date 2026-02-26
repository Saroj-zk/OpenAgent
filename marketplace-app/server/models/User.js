const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    address: { type: String, required: true, unique: true, lowercase: true },
    username: { type: String, sparse: true },
    email: String,
    avatar: String,
    authType: { type: String, default: 'web3' },
    lastLogin: { type: Date, default: Date.now },
    last_activity_at: { type: Date, default: Date.now },
    staked_amount: { type: Number, default: 0 },
    stake_started_at: Date,
    stake_lock_days_remaining: { type: Number, default: 0 },
    contribution_points_lifetime: { type: Number, default: 0 },
    contribution_points_rolling_30d: { type: Number, default: 0 },
    hidden_rating: { type: Number, default: 10 },
    daily_posts_date: String,
    daily_posts_count: { type: Number, default: 0 }
}, { collection: 'users' });

module.exports = mongoose.model('User', userSchema);
