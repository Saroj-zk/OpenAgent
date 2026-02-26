const { ethers } = require('ethers');
const User = require('./models/User');
const Purchase = require('./models/Purchase');

async function startIndexer() {
    const CONTRACT_ADDRESS = process.env.REGISTRY_ADDRESS || "0x2baFbf078c211Bb5d4ABE13891821b630a7FB2c0"; // Base Sepolia Contract Address
    const RPC_URL = process.env.RPC_URL || "https://sepolia.base.org";

    const provider = new ethers.JsonRpcProvider(RPC_URL);

    // Minimal ABI needed for listening to events
    const ABI = [
        "event AgentBought(uint256 indexed id, address indexed buyer, uint256 price)",
        "event IdentityClaimed(address indexed user, string username)"
    ];

    const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);

    console.log("🟢 Starting Blockchain Indexer (Polling Mode for Stability)...");

    // Use queryFilter with an interval for extreme stability on public RPCs
    let lastBlock = await provider.getBlockNumber();

    setInterval(async () => {
        try {
            const currentBlock = await provider.getBlockNumber();
            if (currentBlock <= lastBlock) return;

            // Check for AgentBought
            const buyEvents = await contract.queryFilter("AgentBought", lastBlock + 1, currentBlock);
            for (const event of buyEvents) {
                const { id, buyer } = event.args;
                const agentIdStr = id.toString();
                const buyerLower = buyer.toLowerCase();

                const exists = await Purchase.findOne({ agentId: agentIdStr, buyer: buyerLower });
                if (!exists) {
                    await Purchase.create({ agentId: agentIdStr, buyer: buyerLower });
                    console.log(`📡 [Indexer] Sync: Purchase agent ${agentIdStr} by ${buyerLower}`);
                }
            }

            // Check for IdentityClaimed
            const identityEvents = await contract.queryFilter("IdentityClaimed", lastBlock + 1, currentBlock);
            for (const event of identityEvents) {
                const { user, username } = event.args;
                const formattedAddress = user.toLowerCase();

                await User.findOneAndUpdate(
                    { address: formattedAddress },
                    { username: username, authType: 'web3', last_activity_at: new Date() },
                    { upsert: true }
                );
                console.log(`📡 [Indexer] Sync: Identity for ${formattedAddress} -> ${username}`);
            }

            lastBlock = currentBlock;
        } catch (error) {
            console.error("❌ [Indexer] Polling Error:", error.message);
        }
    }, 15000); // Poll every 15 seconds
}

module.exports = { startIndexer };
