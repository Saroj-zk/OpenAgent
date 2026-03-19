require('./config/loadEnv');
const mongoose = require('mongoose');

async function fix() {
    await mongoose.connect(process.env.MONGO_URI);
    const User = require('./models/User');
    const address = "0x9527c9fD391CCd48f7278FE7c7C09B786a0bb832".toLowerCase();

    // Set trust score high for testing
    await User.findOneAndUpdate(
        { address },
        {
            hidden_rating: 1000,
            trustScore: 200,
            trustTier: 'VERIFIED'
        },
        { upsert: true }
    );

    console.log("User trust score updated to 200 (VERIFIED) for address:", address);
    process.exit(0);
}
fix();
