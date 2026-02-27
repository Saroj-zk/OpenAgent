// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title OpenAgentRegistry
 * @dev Handles identities, agent listings, and auctions for the OpenAgent Marketplace.
 */
contract OpenAgentRegistry {
    address public owner;
    uint256 public platformFee = 25; // 2.5% fee (basis points)
    
    struct Identity {
        string username;
        bool exists;
    }
    
    struct Agent {
        uint256 id;
        address payable creator;
        uint256 price;
        bool active;
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

    mapping(uint256 => Auction) public auctions;
    
    uint256 public nextAgentId = 1;
    uint256 public nextAuctionId = 1;
    
    event IdentityClaimed(address indexed user, string username);
    event AgentListed(uint256 indexed id, address indexed creator, uint256 price);
    event AgentBought(uint256 indexed id, address indexed buyer, uint256 price);
    event AgentDelisted(uint256 indexed id, address indexed creator);
    event AgentPriceUpdated(uint256 indexed id, uint256 newPrice);
    
    event AuctionStarted(uint256 indexed id, address indexed seller, uint256 startTime, uint256 endTime);
    event BidPlaced(uint256 indexed id, address indexed bidder, uint256 amount);
    event AuctionSettled(uint256 indexed id, address indexed winner, uint256 amount);

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only registry owner");
        _;
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
    function listAgent(uint256 _price) external returns (uint256) {
        uint256 id = nextAgentId++;
        agents[id] = Agent(id, payable(msg.sender), _price, true);
        
        // Creator gets access automatically
        hasAccess[id][msg.sender] = true;

        emit AgentListed(id, msg.sender, _price);
        return id;
    }

    struct Escrow {
        uint256 amount;
        address payable creator;
        bool isSettled;
    }
    
    // agentId => buyer => Escrow
    mapping(uint256 => mapping(address => Escrow)) public escrows;

    event EscrowSettled(uint256 indexed agentId, address indexed buyer, address recipient, uint256 amount);

    // Users buy access (a license) to the agent
    function buyAgent(uint256 _id) external payable {
        Agent storage agent = agents[_id];
        require(agent.active, "Agent not active for sale");
        require(msg.value >= agent.price, "Insufficient funds");
        require(!hasAccess[_id][msg.sender], "You already own access");

        hasAccess[_id][msg.sender] = true;
        
        uint256 fee = (msg.value * platformFee) / 1000;
        uint256 creatorProceeds = msg.value - fee;
        
        payable(owner).transfer(fee);
        
        // HOLD creatorProceeds in escrow instead of immediate transfer
        escrows[_id][msg.sender] = Escrow(creatorProceeds, agent.creator, false);

        emit AgentBought(_id, msg.sender, agent.price);
    }

    // Arbitration: The platform owner can resolve escrows
    // If favorBuyer is true, the buyer gets refunded.
    // If favorBuyer is false, the escrowed funds are finally paid to the creator.
    function resolveEscrow(uint256 _agentId, address payable _buyer, bool _favorBuyer) external onlyOwner {
        Escrow storage escrow = escrows[_agentId][_buyer];
        require(!escrow.isSettled, "Escrow already settled or does not exist");
        require(escrow.amount > 0, "No funds in escrow");

        escrow.isSettled = true;

        if (_favorBuyer) {
            // Revoke access
            hasAccess[_agentId][_buyer] = false;
            // Refund the buyer
            _buyer.transfer(escrow.amount);
            emit EscrowSettled(_agentId, _buyer, _buyer, escrow.amount);
        } else {
            // Pay the creator
            escrow.creator.transfer(escrow.amount);
            emit EscrowSettled(_agentId, _buyer, escrow.creator, escrow.amount);
        }
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

    function placeBid(uint256 _id) external payable {
        Auction storage auction = auctions[_id];
        require(auction.active, "Auction not active");
        require(block.timestamp < auction.endTime, "Auction ended");
        require(msg.value > auction.highestBid, "Bid too low");

        // Refund previous bidder
        if (auction.highestBidder != address(0)) {
            auction.highestBidder.transfer(auction.highestBid);
        }

        auction.highestBid = msg.value;
        auction.highestBidder = payable(msg.sender);

        emit BidPlaced(_id, msg.sender, msg.value);
    }

    function settleAuction(uint256 _id) external {
        Auction storage auction = auctions[_id];
        require(block.timestamp >= auction.endTime, "Auction still live");
        require(!auction.settled, "Already settled");

        auction.settled = true;
        auction.active = false;

        if (auction.highestBidder != address(0)) {
            uint256 fee = (auction.highestBid * platformFee) / 1000;
            uint256 sellerProceeds = auction.highestBid - fee;
            
            payable(owner).transfer(fee);
            auction.seller.transfer(sellerProceeds);
            
            emit AuctionSettled(_id, auction.highestBidder, auction.highestBid);
        }
    }
}
