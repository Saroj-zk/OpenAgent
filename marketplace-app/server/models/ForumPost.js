const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    id: String,
    author: String,
    content: String,
    timestamp: { type: Date, default: Date.now },
    authorTrust: Number
});

const forumPostSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    author: { type: String, required: true },
    content: String,
    agentId: String,
    likes: { type: Number, default: 0 },
    likedBy: [String],
    comments: [commentSchema],
    timestamp: { type: Date, default: Date.now },
    authorTrust: Number
}, { collection: 'forum' });

module.exports = mongoose.model('ForumPost', forumPostSchema);
