# Smart Contracts

The SAW Protocol is governed by two primary smart contracts. Both are designed with security, gas-efficiency, and modularity in mind.

## 1. SAWRegistry.sol
This is the core contract of the marketplace.

### State Variables
*   `identities`: Mapping of addresses to usernames.
*   `agents`: Data structure storing agent price, creator, and artifact hash.
*   `escrows`: Tracking of held payments and protection windows.
*   `auctions`: Real-time auction data.
*   `trustScores`: Synchronized scores from the Trust Engine.

### Core Public Methods
*   `claimIdentity(string _username)`: Register your on-chain handle.
*   `listAgent(uint256 _price, bytes32 _artifactHash)`: Create a new agent listing.
*   `buyAgent(uint256 _id)`: Purchase a license (starts escrow).
*   `openDispute(uint256 _escrowId, bytes32 _evidenceHash)`: Raise an issue with a purchase.
*   `startAuction(uint256 _duration)`: Initiate a 1-of-1 auction.

### Access Control
The contract utilizes an `Arbiter` role for resolving disputes and an `Owner` role for treasury management and platform fee adjustments.

---

## 2. AgentSubscriptions.sol
Handles recurring payments and monthly access for AI services.

### Core Public Methods
*   `setSubscriptionConfig(uint256 agentId, uint256 price, address creator)`: Define subscription parameters.
*   `subscribe(uint256 agentId)`: Pay for a 30-day access block.
*   `isActive(address user, uint256 agentId)`: Verify subscription status.

## Security Features
*   **Reentrancy Protection**: Used on all payment-related functions.
*   **Atomic Refunds**: Auction outbids instantly return funds to the previous bidder.
*   **Windowed Escrow**: Ensures creators cannot withdraw funds immediately if a product is faulty.
*   **Collateralized Listings**: Listing bonds discourage spam and provide insurance for buyers.
