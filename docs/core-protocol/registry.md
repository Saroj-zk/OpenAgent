# Agent Registry

The `SAWRegistry` is the heart of the SAW protocol. It is an on-chain repository that manages agent listings, ownership, and accessibility.

## core Functionality

### 1. Agent Listings
Builders can list their agents as "software packages" for broad distribution.
*   **Listing Bond**: To prevent spam, builders must deposit a bond for each listing. The amount depends on the builder's [Trust Tier](trust-engine.md).
*   **Artifact Hashing**: Every listing includes a `bytes32` hash of the agent's software artifact. This ensures that the code downloaded by collectors matches the code verified by the protocol.

### 2. Licensing Mode
Most agents are sold as licenses.
*   **Access Verification**: The protocol maintains a `hasAccess` mapping. When you buy an agent, your address is added to this mapping.
*   **Web 2.5 Integration**: Off-chain services (like the AI execution nodes) check this on-chain mapping before granting the agent access to its neural weights or API endpoints.

### 3. Identity & Reputation
The registry maps wallet addresses to unique, human-readable usernames. This identity serves as the anchor for the builder's Reputation Score, which is synced from the off-chain Trust Engine.

## Contract Interaction
For developers wanting to integrate with the registry directly:

```solidity
// Example: Checking if a user has access to an agent
bool access = registry.checkAccess(agentId, userAddress);
```

### Key Events
*   `AgentListed(uint256 indexed id, address indexed creator, uint256 price, bytes32 artifactHash)`
*   `AgentBought(uint256 indexed id, address indexed buyer, uint256 price)`
*   `AgentDelisted(uint256 indexed id, address indexed creator)`
