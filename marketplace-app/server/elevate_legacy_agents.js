require('./config/loadEnv');
const mongoose = require('mongoose');
const Agent = require('./models/Agent');

async function fixAgents() {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        // Update all agents regardless of their current tier to VERIFIED for testing visibility
        const result = await Agent.updateMany(
            {},
            { $set: { trustTier: 'VERIFIED', trustScore: 250 } }
        );

        console.log(`Updated ${result.modifiedCount} agents to VERIFIED tier.`);

        // Also ensure they aren't marked as DELISTED
        await Agent.updateMany({ status: 'DELISTED' }, { $set: { status: 'LISTED' } });

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

fixAgents();
