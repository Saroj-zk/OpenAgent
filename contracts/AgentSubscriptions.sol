// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

interface ISAWRegistry {
    function agents(uint256 id) external view returns (
        uint256 idx, address payable creator, uint256 price, bool active, bytes32 artifactHash
    );
}

contract AgentSubscriptions is Ownable, ReentrancyGuard {
    ISAWRegistry public registry;

    // subscriber => agentId => expiry timestamp
    mapping(address => mapping(uint256 => uint256)) public subscriptionExpiry;
    
    // agentId => price per 30 days
    mapping(uint256 => uint256) public subscriptionPrice;
    
    // agentId => creator address for payments
    mapping(uint256 => address) public agentCreator;

    event Subscribed(address indexed subscriber, uint256 indexed agentId, uint256 expiry);
    event Extended(address indexed subscriber, uint256 indexed agentId, uint256 newExpiry);
    event Cancelled(address indexed subscriber, uint256 indexed agentId);
    event PriceUpdated(uint256 indexed agentId, uint256 price, address creator);

    constructor(address _registry) Ownable(msg.sender) {
        registry = ISAWRegistry(_registry);
    }

    // Allow a creator to initialize their agent's subscription tier
    function setSubscriptionConfig(uint256 agentId, uint256 price, address creator) external {
        (, address payable actualCreator, , , ) = registry.agents(agentId);
        require(actualCreator == msg.sender || owner() == msg.sender, "Not authorized");
        subscriptionPrice[agentId] = price;
        agentCreator[agentId] = creator;
        emit PriceUpdated(agentId, price, creator);
    }

    function subscribe(uint256 agentId) external payable nonReentrant {
        uint256 price = subscriptionPrice[agentId];
        require(price > 0, "Subscription not configured");
        require(msg.value == price, "Incorrect ETH amount");

        address creator = agentCreator[agentId];
        require(creator != address(0), "Creator not set");

        (bool success, ) = creator.call{value: msg.value}("");
        require(success, "Transfer failed");

        uint256 currentExpiry = subscriptionExpiry[msg.sender][agentId];
        require(currentExpiry < block.timestamp, "Already active");

        uint256 expiry = block.timestamp + 30 days;
        subscriptionExpiry[msg.sender][agentId] = expiry;

        emit Subscribed(msg.sender, agentId, expiry);
    }

    function extendSubscription(uint256 agentId) external payable nonReentrant {
        uint256 price = subscriptionPrice[agentId];
        require(price > 0, "Subscription not configured");
        require(msg.value == price, "Incorrect ETH amount");

        address creator = agentCreator[agentId];
        require(creator != address(0), "Creator not set");

        (bool success, ) = creator.call{value: msg.value}("");
        require(success, "Transfer failed");

        uint256 currentExpiry = subscriptionExpiry[msg.sender][agentId];
        uint256 newExpiry;

        if (currentExpiry > block.timestamp) {
            newExpiry = currentExpiry + 30 days;
        } else {
            newExpiry = block.timestamp + 30 days;
        }

        subscriptionExpiry[msg.sender][agentId] = newExpiry;

        emit Extended(msg.sender, agentId, newExpiry);
    }

    function cancelSubscription(uint256 agentId) external {
        emit Cancelled(msg.sender, agentId);
    }

    function isActive(address user, uint256 agentId) external view returns (bool) {
        return subscriptionExpiry[user][agentId] > block.timestamp;
    }
}
