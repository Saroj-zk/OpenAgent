// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title SAWRegistry
 * @dev Handles identities, agent listings, and auctions for the SAW Marketplace.
 */
contract SAWRegistry is ReentrancyGuard {
    address public owner;
    address public arbiter;
    address public insurancePool;
    uint256 public platformFee = 25; // 2.5% fee (basis points)
    
    uint256 public constant LISTING_BOND = 0.000001 ether;
    uint256 public constant MAX_STRIKES = 3;
    
    mapping(address => uint256) public creatorStrikes;
    mapping(address => uint256) public creatorBonds;
    mapping(address => uint256) public trustScores; // 0-300 scale
    
    struct Identity {
        string username;
        bool exists;
    }
    
    struct Agent {
        uint256 id;
        address payable creator;
        uint256 price;
        bool active;
        bytes32 artifactHash;
    }
    
    struct Auction {
        uint256 id;
        address payable seller;
        uint256 highestBid;
        address payable highestBidder;
        uint256 endTime;
        bool active;
        bool settled;
    }
    
    mapping(address => Identity) public identities;
    mapping(string => address) public usernameToAddress;
    
    mapping(uint256 => Agent) public agents;
    // Verifies if a user has purchased access to a specific agent: agentId => userAddress => bool
    mapping(uint256 => mapping(address => bool)) public hasAccess;

    mapping(address => uint256) public pendingWithdrawals;
    mapping(uint256 => Auction) public auctions;
    
    uint256 public nextAgentId = 1;
    uint256 public nextAuctionId = 1;
    
    event IdentityClaimed(address indexed user, string username);
    event AgentListed(uint256 indexed id, address indexed creator, uint256 price, bytes32 artifactHash);
    event AgentBought(uint256 indexed id, address indexed buyer, uint256 price);
    event AgentDelisted(uint256 indexed id, address indexed creator);
    event AgentPriceUpdated(uint256 indexed id, uint256 newPrice);
    
    event AuctionStarted(uint256 indexed id, address indexed seller, uint256 startTime, uint256 endTime);
    event BidPlaced(uint256 indexed id, address indexed bidder, uint256 amount);
    event AuctionSettled(uint256 indexed id, address indexed winner, uint256 amount);

    event CreatorStrike(address indexed creator, uint256 totalStrikes);
    event CreatorSlashed(address indexed creator, uint256 amount);

    constructor(address _initialArbiter) {
        owner = msg.sender;
        arbiter = _initialArbiter; // will be multisig in future
        insurancePool = owner;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only registry owner");
        _;
    }

    function setInsurancePool(address _newPool) external onlyOwner {
        require(_newPool != address(0), "ZERO_ADDR");
        insurancePool = _newPool;
    }

    modifier onlyArbiter() {
        require(msg.sender == arbiter, "NOT_ARBITER");
        _;
    }

    function setArbiter(address newArbiter) external onlyArbiter {
        require(newArbiter != address(0), "ZERO_ADDR");
        emit ArbiterUpdated(arbiter, newArbiter);
        arbiter = newArbiter;
    }

    function setTrustScore(address _creator, uint256 _score) external onlyArbiter {
        require(_score <= 300, "Max score 300");
        trustScores[_creator] = _score;
    }

    function getBondMultiplier(address _creator) public view returns (uint256) {
        uint256 score = trustScores[_creator];
        if (score >= 200) return 1; // VERIFIED
        if (score >= 100) return 2; // REVIEWED
        if (score >= 50) return 3;  // EXPERIMENTAL
        return 0; // RESTRICTED
    }

    // --- Identity ---
    
    function claimIdentity(string memory _username) external {
        require(!identities[msg.sender].exists, "Identity already claimed");
        require(usernameToAddress[_username] == address(0), "Username already taken");
        
        identities[msg.sender] = Identity(_username, true);
        usernameToAddress[_username] = msg.sender;
        
        emit IdentityClaimed(msg.sender, _username);
    }

    // --- Marketplace (Licenses) ---

    // Creators list an agent software package to be sold multiple times
    function listAgent(uint256 _price, bytes32 _artifactHash) external payable returns (uint256) {
        uint256 multiplier = getBondMultiplier(msg.sender);
        require(multiplier > 0, "Trust score < 50 (RESTRICTED)");
        
        uint256 requiredBond = LISTING_BOND * multiplier;
        require(msg.value == requiredBond, "Incorrect bond amount");
        require(creatorStrikes[msg.sender] < MAX_STRIKES, "Creator restricted");

        creatorBonds[msg.sender] += msg.value;

        uint256 id = nextAgentId++;
        agents[id] = Agent(id, payable(msg.sender), _price, true, _artifactHash);
        
        // Creator gets access automatically
        hasAccess[id][msg.sender] = true;

        emit AgentListed(id, msg.sender, _price, _artifactHash);
        return id;
    }

    function withdrawBond(uint256 amount) external nonReentrant {
        require(creatorBonds[msg.sender] >= amount, "Insufficient bond");
        creatorBonds[msg.sender] -= amount;
        (bool success, ) = payable(msg.sender).call{value: amount}("");
        require(success, "Transfer failed");
    }

    function getAgentArtifactHash(uint256 _id) external view returns (bytes32) {
        return agents[_id].artifactHash;
    }

    enum EscrowState { CREATED, DISPUTED, RESOLVED, FINALIZED }
    uint256 public constant ESCROW_WINDOW = 72 hours;

    struct Escrow {
        uint256 agentId;
        address buyer;
        address creator;
        uint256 amount;
        uint256 createdAt;
        uint256 expiryAt;
        EscrowState state;
        bytes32 buyerEvidenceHash;
        bytes32 creatorResponseHash;
    }
    
    // escrowId => Escrow
    mapping(uint256 => Escrow) public escrows;
    uint256 public nextEscrowId = 1;

    event EscrowCreated(uint256 indexed escrowId, uint256 indexed agentId, address indexed buyer, address creator, uint256 amount, uint256 createdAt, uint256 expiryAt);
    event EscrowFinalized(uint256 indexed escrowId, address indexed creator, uint256 amount);
    event DisputeOpened(uint256 indexed escrowId, address indexed buyer, bytes32 evidenceHash);
    event DisputeResponded(uint256 indexed escrowId, address indexed creator, bytes32 responseHash);
    event DisputeResolved(uint256 indexed escrowId, uint256 buyerPayout, uint256 creatorPayout);
    event ArbiterUpdated(address indexed oldArbiter, address indexed newArbiter);

    // Users buy access (a license) to the agent
    function buyAgent(uint256 _id) external payable nonReentrant {
        Agent storage agent = agents[_id];
        require(agent.active, "Agent not active for sale");
        require(msg.value >= agent.price, "Insufficient funds");
        require(!hasAccess[_id][msg.sender], "You already own access");

        hasAccess[_id][msg.sender] = true;
        
        uint256 fee = (msg.value * platformFee) / 1000;
        uint256 creatorProceeds = msg.value - fee;
        
        (bool successOwner, ) = payable(owner).call{value: fee}("");
        require(successOwner, "Transfer failed");
        
        uint256 escrowId = nextEscrowId++;
        escrows[escrowId] = Escrow({
            agentId: _id,
            buyer: msg.sender,
            creator: agent.creator,
            amount: creatorProceeds,
            createdAt: block.timestamp,
            expiryAt: block.timestamp + ESCROW_WINDOW,
            state: EscrowState.CREATED,
            buyerEvidenceHash: 0x0,
            creatorResponseHash: 0x0
        });

        emit EscrowCreated(escrowId, _id, msg.sender, agent.creator, creatorProceeds, block.timestamp, block.timestamp + ESCROW_WINDOW);
        emit AgentBought(_id, msg.sender, agent.price);
    }

    function openDispute(uint256 _escrowId, bytes32 _evidenceHash) external {
        Escrow storage escrow = escrows[_escrowId];
        require(escrow.state == EscrowState.CREATED, "Not in CREATED state");
        require(msg.sender == escrow.buyer, "Only buyer can dispute");
        require(block.timestamp < escrow.expiryAt, "Escrow already expired");
        
        escrow.state = EscrowState.DISPUTED;
        escrow.buyerEvidenceHash = _evidenceHash;
        
        emit DisputeOpened(_escrowId, msg.sender, _evidenceHash);
    }

    function respondDispute(uint256 _escrowId, bytes32 _responseHash) external {
        Escrow storage escrow = escrows[_escrowId];
        require(escrow.state == EscrowState.DISPUTED, "Escrow not disputed");
        require(msg.sender == escrow.creator, "Only creator can respond");
        
        escrow.creatorResponseHash = _responseHash;
        
        emit DisputeResponded(_escrowId, msg.sender, _responseHash);
    }

    function resolveDispute(uint256 _escrowId, uint256 _buyerPayout, uint256 _creatorPayout) external onlyArbiter nonReentrant {
        Escrow storage escrow = escrows[_escrowId];
        require(escrow.state == EscrowState.DISPUTED, "Escrow not disputed");
        require(_buyerPayout + _creatorPayout == escrow.amount, "Payouts must equal escrow amount");

        escrow.state = EscrowState.RESOLVED;

        if (_buyerPayout > 0) {
            // If buyer gets a full refund, revoke access
            if (_buyerPayout == escrow.amount) {
                hasAccess[escrow.agentId][escrow.buyer] = false;
            }
            (bool s1, ) = payable(escrow.buyer).call{value: _buyerPayout}("");
            require(s1, "Transfer failed");
        }
        if (_creatorPayout > 0) {
            (bool s2, ) = payable(escrow.creator).call{value: _creatorPayout}("");
            require(s2, "Transfer failed");
        }

        if (_buyerPayout > _creatorPayout) {
            creatorStrikes[escrow.creator]++;
            emit CreatorStrike(escrow.creator, creatorStrikes[escrow.creator]);

            uint256 slashAmount = LISTING_BOND;
            if (creatorBonds[escrow.creator] < slashAmount) {
                slashAmount = creatorBonds[escrow.creator];
            }
            
            if (slashAmount > 0) {
                creatorBonds[escrow.creator] -= slashAmount;
                (bool s3, ) = payable(insurancePool).call{value: slashAmount}("");
                require(s3, "Transfer failed");
                emit CreatorSlashed(escrow.creator, slashAmount);
            }
        }

        emit DisputeResolved(_escrowId, _buyerPayout, _creatorPayout);
    }

    function finalizeEscrow(uint256 _escrowId) external nonReentrant {
        Escrow storage escrow = escrows[_escrowId];
        require(escrow.state == EscrowState.CREATED, "Escrow is not in CREATED state");
        require(block.timestamp >= escrow.expiryAt, "Escrow window not yet expired");

        escrow.state = EscrowState.FINALIZED;
        (bool success, ) = payable(escrow.creator).call{value: escrow.amount}("");
        require(success, "Transfer failed");

        emit EscrowFinalized(_escrowId, escrow.creator, escrow.amount);
    }

    function getEscrow(uint256 _escrowId) external view returns (Escrow memory) {
        return escrows[_escrowId];
    }

    function delistAgent(uint256 _id) external {
        Agent storage agent = agents[_id];
        require(agent.active, "Agent not active");
        require(msg.sender == agent.creator, "Only creator can delist");

        agent.active = false;
        
        emit AgentDelisted(_id, msg.sender);
    }
    
    function updateAgentPrice(uint256 _id, uint256 _newPrice) external {
        Agent storage agent = agents[_id];
        require(agent.active, "Agent not active");
        require(msg.sender == agent.creator, "Only creator can update price");
        
        agent.price = _newPrice;
        
        emit AgentPriceUpdated(_id, _newPrice);
    }

    // --- Access Verification (Web 2.5) ---
    function checkAccess(uint256 _id, address _user) external view returns (bool) {
        return hasAccess[_id][_user];
    }

    // --- Auctions (1-of-1) ---

    function startAuction(uint256 _duration) external returns (uint256) {
        uint256 id = nextAuctionId++;
        auctions[id] = Auction({
            id: id,
            seller: payable(msg.sender),
            highestBid: 0,
            highestBidder: payable(address(0)),
            endTime: block.timestamp + _duration,
            active: true,
            settled: false
        });

        emit AuctionStarted(id, msg.sender, block.timestamp, block.timestamp + _duration);
        return id;
    }

    function withdrawPending() external nonReentrant {
        uint256 amount = pendingWithdrawals[msg.sender];
        require(amount > 0, "No pending funds");
        pendingWithdrawals[msg.sender] = 0;
        (bool success, ) = payable(msg.sender).call{value: amount}("");
        require(success, "Withdraw failed");
    }

    function placeBid(uint256 _id) external payable nonReentrant {
        Auction storage auction = auctions[_id];
        require(auction.active, "Auction not active");
        require(block.timestamp < auction.endTime, "Auction ended");
        require(msg.value > auction.highestBid, "Bid too low");

        // Refund previous bidder (Pull-over-Push)
        if (auction.highestBidder != address(0)) {
            pendingWithdrawals[auction.highestBidder] += auction.highestBid;
        }

        auction.highestBid = msg.value;
        auction.highestBidder = payable(msg.sender);

        emit BidPlaced(_id, msg.sender, msg.value);
    }

    function settleAuction(uint256 _id) external nonReentrant {
        Auction storage auction = auctions[_id];
        require(block.timestamp >= auction.endTime, "Auction still live");
        require(!auction.settled, "Already settled");

        auction.settled = true;
        auction.active = false;

        if (auction.highestBidder != address(0)) {
            uint256 fee = (auction.highestBid * platformFee) / 1000;
            uint256 sellerProceeds = auction.highestBid - fee;
            
            (bool sf, ) = payable(owner).call{value: fee}("");
            require(sf, "Fee transfer failed");
            (bool ss, ) = auction.seller.call{value: sellerProceeds}("");
            require(ss, "Seller transfer failed");
            
            emit AuctionSettled(_id, auction.highestBidder, auction.highestBid);
        }
    }
}
