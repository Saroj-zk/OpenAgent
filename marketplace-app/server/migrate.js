require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const User = require('./models/User');
const Agent = require('./models/Agent');
const ForumPost = require('./models/ForumPost');
const Auction = require('./models/Auction');
const Purchase = require('./models/Purchase');

const MONGO_URI = process.env.MONGO_URI;

const read = (file) => {
    if (!fs.existsSync(file)) return null;
    return JSON.parse(fs.readFileSync(file));
};

async function migrate() {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB for migration...");

    // Migrate Users
    const usersData = read(path.join(__dirname, 'users.json'));
    if (usersData) {
        for (const [address, data] of Object.entries(usersData)) {
            await User.findOneAndUpdate({ address: address.toLowerCase() }, data, { upsert: true });
        }
        console.log("Migrated Users.");
    }

    // Migrate Agents
    const agentsData = read(path.join(__dirname, 'agents.json'));
    if (agentsData) {
        for (const agent of agentsData) {
            await Agent.findOneAndUpdate({ id: agent.id }, agent, { upsert: true });
        }
        console.log("Migrated Agents.");
    }

    // Migrate Forum
    const forumData = read(path.join(__dirname, 'forum.json'));
    if (forumData) {
        for (const post of forumData) {
            await ForumPost.findOneAndUpdate({ id: post.id }, post, { upsert: true });
        }
        console.log("Migrated Forum.");
    }

    // Migrate Auctions
    const auctionsData = read(path.join(__dirname, 'auctions.json'));
    if (auctionsData) {
        for (const auction of auctionsData) {
            await Auction.findOneAndUpdate({ id: auction.id }, auction, { upsert: true });
        }
        console.log("Migrated Auctions.");
    }

    // Migrate Purchases
    const purchasesData = read(path.join(__dirname, 'purchases.json'));
    if (purchasesData) {
        for (const purchase of purchasesData) {
            await Purchase.findOneAndUpdate({ agentId: purchase.agentId, buyer: purchase.buyer }, purchase, { upsert: true });
        }
        console.log("Migrated Purchases.");
    }

    console.log("Migration complete!");
    process.exit(0);
}

migrate().catch(err => {
    console.error(err);
    process.exit(1);
});
