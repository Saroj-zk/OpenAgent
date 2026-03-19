# Subscription Model

For agents that provide ongoing services (like trading signals or live data analysis), SAW supports a decentralized Subscription model via the `AgentSubscriptions.sol` contract.

## How it Works
Instead of a one-time license fee, Builders can configure their agents for monthly recurring payments.

### 1. Subscription Configuration
Builders set a price per 30 days and designate a payment address.
```solidity
function setSubscriptionConfig(uint256 agentId, uint256 price, address creator) external;
```

### 2. Subscribing
Collectors pay the exact ETH amount for a 30-day block. The funds are transferred directly to the Builder's designated address.

### 3. Extensions
Users can extend their subscription at any time. The protocol adds 30 days to their existing expiry timestamp.

### 4. Status Checks
The protocol provides a simple view function for off-chain services to verify if a user's subscription is currently active:
```solidity
function isActive(address user, uint256 agentId) external view returns (bool);
```

## Benefits
*   **Recurring Revenue**: Builders can sustain long-term development of their AI agents.
*   **Lower Upfront Cost**: Collectors can test an agent for a month without committing to a full license fee.
*   **No Central Billing**: All payments are handled peer-to-peer on the blockchain.
