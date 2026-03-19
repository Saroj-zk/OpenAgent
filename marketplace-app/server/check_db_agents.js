require('./config/loadEnv');
const mongoose = require('mongoose');
const Agent = require('./models/Agent');

async function checkAgents() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const agents = await Agent.find({});
        console.log(`Total agents found: ${agents.length}`);

        agents.forEach(a => {
            console.log(`- Name: ${a.name}, Status: ${a.status}, TrustTier: ${a.trustTier}, Creator: ${a.creator || a.owner}`);
        });

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkAgents();
