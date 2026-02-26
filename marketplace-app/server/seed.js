require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Agent = require('./models/Agent');

const AGENTS_FILE = path.join(__dirname, 'agents.json');

async function seedAgents() {
    if (!process.env.MONGO_URI || process.env.MONGO_URI.includes('<db_password>')) {
        console.error("❌ Please replace <db_password> in the server/.env file before seeding.");
        process.exit(1);
    }

    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ Connected to MongoDB");

        const agentsData = JSON.parse(fs.readFileSync(AGENTS_FILE, 'utf-8'));

        console.log(`Found ${agentsData.length} agents in JSON format. Attempting to seed...`);

        let insertedCount = 0;
        for (const agent of agentsData) {
            // Check if agent already exists
            const existing = await Agent.findOne({ id: agent.id });
            if (!existing) {
                await Agent.create(agent);
                insertedCount++;
                console.log(`Inserted agent: ${agent.name}`);
            } else {
                console.log(`Skipped agent (already exists): ${agent.name}`);
            }
        }

        console.log(`✅ Seeding complete. Inserted ${insertedCount} new mockup agents.`);
        process.exit(0);

    } catch (error) {
        console.error("❌ Error seeding agents:", error);
        process.exit(1);
    }
}

seedAgents();
