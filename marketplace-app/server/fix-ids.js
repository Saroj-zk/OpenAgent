require('dotenv').config();
const mongoose = require('mongoose');
const Agent = require('./models/Agent');

async function fixIds() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to DB...");

        // Find all mock agents that might conflict with the new Smart Contract
        // The new smart contract starts at ID 1. The mock agents are ID 1-13.
        const mockAgents = await Agent.find({ id: { $lt: 100 } });

        let count = 0;
        for (const agent of mockAgents) {
            // Shift their IDs entirely out of the way of the real blockchain (e.g. add 1000)
            const newId = agent.id + 1000;
            // use findByIdAndUpdate to bypass pre-save hooks safely
            await Agent.findByIdAndUpdate(agent._id, { $set: { id: newId } });
            count++;
            console.log(`Shifted mock agent ${agent.name} from ID ${agent.id} -> ${newId}`);
        }

        console.log(`✅ Successfully shifted ${count} mock agents out of the way!`);
        process.exit(0);
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
}

fixIds();
