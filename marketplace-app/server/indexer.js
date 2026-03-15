const { ethers } = require('ethers');
const User = require('./models/User');
const Purchase = require('./models/Purchase');
const IndexerState = require('./models/IndexerState');
const BlockchainEvent = require('./models/BlockchainEvent');
const Subscription = require('./models/Subscription');

const CONFIRMATIONS = 10;

async function startIndexer() {
    const CONTRACT_ADDRESS = process.env.REGISTRY_ADDRESS || process.env.CONTRACT_ADDRESS || "0xAC505Dd4788Ee677F6519D3A3F9E05c32c4d7f88";
    const RPC_URL = process.env.BASE_SEPOLIA_RPC || process.env.RPC_URL || "https://sepolia.base.org";
    const WSS_URL = process.env.WSS_URL;

    const httpProvider = new ethers.JsonRpcProvider(RPC_URL);

    const ABI = [
        "event AgentListed(uint256 indexed id, address indexed creator, uint256 price, bytes32 artifactHash)",
        "event AgentBought(uint256 indexed id, address indexed buyer, uint256 price)",
        "event IdentityClaimed(address indexed user, string username)",
        "event EscrowCreated(uint256 indexed escrowId, uint256 indexed agentId, address indexed buyer, address creator, uint256 amount, uint256 createdAt, uint256 expiryAt)",
        "event EscrowFinalized(uint256 indexed escrowId, address indexed creator, uint256 amount)",
        "event DisputeOpened(uint256 indexed escrowId, address indexed buyer, bytes32 evidenceHash)",
        "event DisputeResolved(uint256 indexed escrowId, uint256 buyerPayout, uint256 creatorPayout)"
    ];

    const contractHttp = new ethers.Contract(CONTRACT_ADDRESS, ABI, httpProvider);

    const SUBSCRIPTIONS_ADDRESS = process.env.SUBSCRIPTIONS_ADDRESS || "0xc384fDC3Eb026c9997fbA4399A4FBe8Af5Ce3694"; // base sepolia fallback
    const SUB_ABI = [
        "event Subscribed(address indexed subscriber, uint256 indexed agentId, uint256 expiry)",
        "event Extended(address indexed subscriber, uint256 indexed agentId, uint256 newExpiry)",
        "event Cancelled(address indexed subscriber, uint256 indexed agentId)"
    ];
    const subContractHttp = new ethers.Contract(SUBSCRIPTIONS_ADDRESS, SUB_ABI, httpProvider);

    console.log("🟢 Starting Reliable Blockchain Indexer (10 Confirms & WS+HTTP Fallback)...");

    async function processEvent(eventObj, status, alreadyParsedData = null) {
        const transactionHash = eventObj.transactionHash;
        const logIndex = eventObj.logIndex || eventObj.index || 0;
        const blockNumber = eventObj.blockNumber;

        let eventName = eventObj.fragment ? eventObj.fragment.name : (eventObj.eventName || null);
        let args = eventObj.args;

        if (!eventName && eventObj.topics) {
            try {
                const parsed = contractHttp.interface.parseLog({ topics: eventObj.topics, data: eventObj.data });
                eventName = parsed ? parsed.name : (subContractHttp.interface.parseLog({ topics: eventObj.topics, data: eventObj.data })?.name || 'Unknown');
                args = parsed ? parsed.args : (subContractHttp.interface.parseLog({ topics: eventObj.topics, data: eventObj.data })?.args || []);
            } catch (e) {
                try {
                    const parsedSub = subContractHttp.interface.parseLog({ topics: eventObj.topics, data: eventObj.data });
                    eventName = parsedSub ? parsedSub.name : 'Unknown';
                    args = parsedSub ? parsedSub.args : [];
                } catch (e2) { return; }
            }
        }

        if (!['AgentListed', 'AgentBought', 'IdentityClaimed', 'EscrowCreated', 'EscrowFinalized', 'DisputeOpened', 'DisputeResolved', 'Subscribed', 'Extended', 'Cancelled'].includes(eventName)) return;

        let parsedData = alreadyParsedData;
        if (!parsedData) {
            if (eventName === 'AgentListed' && args) {
                parsedData = { id: args[0].toString(), creator: args[1].toLowerCase(), price: args[2].toString(), artifactHash: args[3] };
            } else if (eventName === 'AgentBought' && args) {
                parsedData = { id: args[0].toString(), buyer: args[1].toLowerCase(), price: args[2].toString() };
            } else if (eventName === 'IdentityClaimed' && args) {
                parsedData = { user: args[0].toLowerCase(), username: args[1] };
            } else if (eventName === 'EscrowCreated' && args) {
                parsedData = { escrowId: args[0].toString(), agentId: args[1].toString(), buyer: args[2].toLowerCase(), expiryAt: args[6].toString() };
            } else if (['EscrowFinalized', 'DisputeOpened', 'DisputeResolved'].includes(eventName) && args) {
                parsedData = { escrowId: args[0].toString() };
            } else if (['Subscribed', 'Extended', 'Cancelled'].includes(eventName) && args) {
                parsedData = { subscriber: args[0].toLowerCase(), agentId: args[1].toString(), expiry: args[2]?.toString() };
            }
        }

        if (!parsedData) return;

        try {
            await BlockchainEvent.create({
                txHash: transactionHash,
                logIndex,
                eventName,
                blockNumber,
                data: parsedData,
                status
            });
        } catch (e) {
            if (e.code !== 11000) {
                console.error(`❌ DB Insert Event Error (TX: ${transactionHash}):`, e.message);
                return;
            }
            if (status === 'confirmed') {
                await BlockchainEvent.updateOne({ txHash: transactionHash, logIndex }, { status: 'confirmed' });
            }
        }

        if (status === 'confirmed') {
            try {
                if (eventName === "AgentListed") {
                    const Agent = require('./models/Agent');
                    await Agent.findOneAndUpdate(
                        { id: parsedData.id },
                        { 
                            id: parsedData.id, 
                            creator: parsedData.creator, 
                            owner: parsedData.creator, 
                            price: ethers.formatEther(parsedData.price), 
                            artifactHash: parsedData.artifactHash,
                            status: 'LISTED' 
                        },
                        { upsert: true }
                    );
                    console.log(`📡 [Indexer] Confirmed: Sync Agent ${parsedData.id} by ${parsedData.creator}`);
                } else if (eventName === "AgentBought") {
                    const idStr = parsedData.id;
                    const buyerStr = parsedData.buyer;
                    await Purchase.findOneAndUpdate(
                        { agentId: idStr, buyer: buyerStr, txHash: transactionHash },
                        { agentId: idStr, buyer: buyerStr, txHash: transactionHash, status: 'completed' }, // mapped to created soon
                        { upsert: true }
                    );
                    console.log(`📡 [Indexer] Confirmed: Purchase agent ${idStr} by ${buyerStr}`);
                } else if (eventName === "IdentityClaimed") {
                    const userStr = parsedData.user;
                    const usernameStr = parsedData.username;
                    await User.findOneAndUpdate(
                        { address: userStr },
                        { username: usernameStr, authType: 'web3', last_activity_at: new Date() },
                        { upsert: true }
                    );
                    console.log(`📡 [Indexer] Confirmed: Identity ${userStr} -> ${usernameStr}`);
                } else if (eventName === "EscrowCreated") {
                    await Purchase.findOneAndUpdate(
                        { txHash: transactionHash },
                        { escrowId: parsedData.escrowId, expiryAt: new Date(Number(parsedData.expiryAt) * 1000), status: 'CREATED' },
                        { upsert: true }
                    );
                } else if (eventName === "DisputeOpened") {
                    await Purchase.findOneAndUpdate({ escrowId: parsedData.escrowId }, { status: 'DISPUTED' });
                } else if (eventName === "DisputeResolved") {
                    await Purchase.findOneAndUpdate({ escrowId: parsedData.escrowId }, { status: 'RESOLVED' });
                } else if (eventName === "EscrowFinalized") {
                    await Purchase.findOneAndUpdate({ escrowId: parsedData.escrowId }, { status: 'FINALIZED' });
                } else if (eventName === "Subscribed" || eventName === "Extended") {
                    await Subscription.findOneAndUpdate(
                        { userAddress: parsedData.subscriber, agentId: parsedData.agentId },
                        { expiresAt: new Date(Number(parsedData.expiry) * 1000), txHash: transactionHash, status: 'ACTIVE', updatedAt: new Date() },
                        { upsert: true }
                    );
                    console.log(`📡 [Indexer] Confirmed: Subscribed ${parsedData.agentId} by ${parsedData.subscriber}`);
                } else if (eventName === "Cancelled") {
                    await Subscription.findOneAndUpdate(
                        { userAddress: parsedData.subscriber, agentId: parsedData.agentId },
                        { status: 'EXPIRED' }
                    );
                }
            } catch (err) {
                if (err.code !== 11000) console.error("❌ Action Error:", err.message);
            }
        }
    }

    async function catchUp() {
        try {
            let state = await IndexerState.findOne({ id: 'main' });
            if (!state) {
                state = await IndexerState.create({ id: 'main', lastProcessedBlock: 0 });
            }

            const currentBlock = await httpProvider.getBlockNumber();
            let fromBlock = state.lastProcessedBlock > 200 ? state.lastProcessedBlock - 200 : currentBlock - 5000;
            const toBlock = currentBlock - CONFIRMATIONS;

            if (toBlock > fromBlock) {
                // To obey 10,000 block RPC limit
                if (toBlock - fromBlock > 9000) {
                    fromBlock = toBlock - 9000;
                }
                const events = await contractHttp.queryFilter("*", fromBlock, toBlock);
                for (let ev of events) {
                    await processEvent(ev, 'confirmed');
                }
                const subEvents = await subContractHttp.queryFilter("*", fromBlock, toBlock);
                for (let ev of subEvents) {
                    await processEvent(ev, 'confirmed');
                }

                state.lastProcessedBlock = toBlock;
                await state.save();
            }
            return currentBlock;
        } catch (e) {
            console.error("❌ CatchUp Error:", e.message);
            return null;
        }
    }

    // Run Initial Backfill
    await catchUp();

    let activeWsProvider = null;
    let contractWs = null;

    if (WSS_URL) {
        try {
            console.log("🕸️ Connecting to WebSocket for Real-Time Pending Events...");
            activeWsProvider = new ethers.WebSocketProvider(WSS_URL);
            contractWs = new ethers.Contract(CONTRACT_ADDRESS, ABI, activeWsProvider);
            const subContractWs = new ethers.Contract(SUBSCRIPTIONS_ADDRESS, SUB_ABI, activeWsProvider);

            contractWs.on("*", async (event) => {
                const log = event.log || event;
                if (!log.transactionHash) return;
                await processEvent(log, 'pending');
            });
            subContractWs.on("*", async (event) => {
                const log = event.log || event;
                if (!log.transactionHash) return;
                await processEvent(log, 'pending');
            });
        } catch (e) {
            console.error("❌ WSS setup failed. Falling back completely to HTTP.", e.message);
            contractWs = null;
        }
    }

    console.log("🔄 Starting Confirmation/Fallback Polling Loop...");
    setInterval(async () => {
        const currentBlock = await catchUp(); // Backfills confirmed events using HTTP

        try {
            if (!currentBlock) return;
            const threshold = currentBlock - CONFIRMATIONS;
            const pendingEvents = await BlockchainEvent.find({ status: 'pending', blockNumber: { $lte: threshold } });

            for (let pe of pendingEvents) {
                try {
                    const receipt = await httpProvider.getTransactionReceipt(pe.txHash);
                    if (receipt && receipt.blockNumber <= threshold) {
                        let simulatedEv = {
                            transactionHash: pe.txHash,
                            logIndex: pe.logIndex,
                            blockNumber: receipt.blockNumber,
                            eventName: pe.eventName
                        };
                        await processEvent(simulatedEv, 'confirmed', pe.data);
                    } else if (!receipt) {
                        await BlockchainEvent.deleteOne({ _id: pe._id });
                        console.log(`⚠️ Re-org dropped event tx ${pe.txHash}`);
                    }
                } catch (receiptError) {
                    console.log(`⚠️ Error getting receipt for tx ${pe.txHash}`, receiptError.message);
                }
            }
        } catch (e) {
            console.error("❌ Pending confirmation error:", e.message);
        }
    }, 15000);
}

module.exports = { startIndexer };
