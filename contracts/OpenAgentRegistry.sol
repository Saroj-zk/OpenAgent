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
    
    struct Listing {
        uint256 id;
        address payable seller;
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
    
    mapping(uint256 => Listing) public listings;
    mapping(uint256 => Auction) public auctions;
    
    uint256 private nextListingId = 1;
    uint256 private nextAuctionId = 1;
    
    event IdentityClaimed(address indexed user, string username);
    event AgentListed(uint256 indexed id, address indexed seller, uint256 price);
    event AgentSold(uint256 indexed id, address indexed buyer, uint256 price);
    event AgentDelisted(uint256 indexed id, address indexed seller);
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

    // --- Marketplace ---

    function listAgent(uint256 _price) external returns (uint256) {
        uint256 id = nextListingId++;
        listings[id] = Listing(id, payable(msg.sender), _price, true);
        
        emit AgentListed(id, msg.sender, _price);
        return id;
    }

    function buyAgent(uint256 _id) external payable {
        Listing storage listing = listings[_id];
        require(listing.active, "Listing not active");
        require(msg.value >= listing.price, "Insufficient funds");

        listing.active = false;
        
        uint256 fee = (msg.value * platformFee) / 1000;
        uint256 sellerProceeds = msg.value - fee;
        
        payable(owner).transfer(fee);
        listing.seller.transfer(sellerProceeds);

        emit AgentSold(_id, msg.sender, msg.value);
    }

    function delistAgent(uint256 _id) external {
        Listing storage listing = listings[_id];
        require(listing.active, "Listing not active");
        require(msg.sender == listing.seller, "Only seller can delist");

        listing.active = false;
        
        emit AgentDelisted(_id, msg.sender);
    }

    // --- Auctions ---

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
