require('dotenv').config();
const { ethers } = require('ethers');
const mongoose = require('mongoose');
const Agent = require('../models/Agent');

// MongoDB Connection
const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI || MONGO_URI.includes('<db_password>')) {
    console.error("❌ MongoDB connection string missing or password not set in .env");
    process.exit(1);
}
mongoose.connect(MONGO_URI)
    .then(() => console.log('✅ Indexer: Connected to MongoDB Atlas'))
    .catch(err => console.error('❌ Indexer: MongoDB Connection Error:', err));

// Blockchain Configuration
const provider = new ethers.JsonRpcProvider(process.env.BASE_SEPOLIA_RPC);
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;

// Minimal ABI just for listening to events
const ABI = [
    "event AgentListed(uint256 indexed id, address indexed creator, uint256 price)",
    "event AgentBought(uint256 indexed id, address indexed buyer, uint256 price)",
    "event IdentityClaimed(address indexed user, string username)"
];

const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);

async function startIndexer() {
    console.log(`📡 Indexer: Listening to OpenAgentRegistry at ${CONTRACT_ADDRESS}...`);

    contract.on("AgentListed", async (id, creator, price, event) => {
        console.log(`\n🔔 New Agent Listed on-chain: ID ${id}`);
        try {
            // Find the pending agent in the database (recently created via frontend)
            // and officially mark it as active on-chain
            const agentIdNum = Number(id);
            const priceInEth = ethers.formatEther(price);

            const agent = await Agent.findOne({ id: agentIdNum });

            if (agent) {
                // Agent was already created by the POST endpoint, just update its status if needed
                console.log(`✅ Indexer found matching off-chain metadata for agent ${id}. Confirmed creation.`);
            } else {
                console.log(`⚠️ Indexer heard Agent ${id}, but no off-chain metadata found yet. Waiting for backend POST.`);
                // In a true resilient system, you could create a "pending metadata" entry here
            }
        } catch (error) {
            console.error("❌ Indexer Error on AgentListed:", error);
        }
    });

    contract.on("AgentBought", async (id, buyer, price, event) => {
        console.log(`\n🔔 Agent License Purchased: ID ${id} by ${buyer}`);
        // The backend /api/purchases endpoint currently handles this explicitly via the React client,
        // but adding this listener allows the backend to independently verify and save it regardless of UI crashes!
        try {
            const fs = require('fs');
            const path = require('path');
            const file = path.join(__dirname, '../purchases.json');
            let purchases = [];
            if (fs.existsSync(file)) {
                purchases = JSON.parse(fs.readFileSync(file, 'utf8'));
            }
            const exists = purchases.find(p => p.agentId.toString() === id.toString() && p.buyer.toLowerCase() === buyer.toLowerCase());
            if (!exists) {
                purchases.push({ agentId: id.toString(), buyer: buyer.toLowerCase(), timestamp: new Date(), source: 'indexer' });
                fs.writeFileSync(file, JSON.stringify(purchases, null, 2));
                console.log(`✅ Indexer successfully recorded independent purchase for Agent ${id}`);
            }
        } catch (error) {
            console.error("❌ Indexer Error on AgentBought:", error);
        }
    });
}

// Start listening
startIndexer();

// Keep process alive indefinitely
process.stdin.resume();
