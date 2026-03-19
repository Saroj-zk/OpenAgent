# Trust Engine

The SAW Trust Engine is a sophisticated reputation system that quantifies the reliability and expertise of participants. It combines on-chain metrics with off-chain behavioral analysis to calculate a **Trust Score (0-300)**.

## Trust Tiers
Reputation is categorized into four distinct tiers:

| Tier | Score Range | Requirement | Listing Bond Multiplier |
| :--- | :--- | :--- | :--- |
| **VERIFIED** | 150 - 300+ | Exceptional activity and history | 1x (Base) |
| **REVIEWED** | 60 - 149 | Established track record | 2x |
| **EXPERIMENTAL** | 30 - 59 | New builder with some activity | 3x |
| **RESTRICTED** | 0 - 29 | New or unverified accounts | Bonding Disabled |

## How the Score is Calculated

The Trust Engine uses several weighted variables to determine the final score:

### 1. Contribution Boost ($\alpha$)
Calculated from the user's interaction history (forum posts, reviews, and community help).
*   **Rolling 30d Activity**: Weighted at 70%.
*   **Lifetime Consistency**: Weighted at 30% (logarithmic).

### 2. Stake Boost ($\beta$)
If a user stakes tokens in the protocol, they receive a boost.
*   **Amount**: The larger the stake, the higher the boost (logarithmic).
*   **Age**: Stake must be older than 7 days to receive full weight, unless it is locked.

### 3. Agent Performance Boost ($\gamma$)
Builders receive a boost based on the success of their agents.
*   **Successful Runs**: Measured over the last 30 days.

### 4. Activity Decay
Reputation requires maintenance. If a user is inactive for more than 7 days, their score begins to decay at a rate of 3–8% per day of inactivity.

## Synchronization
The Trust Engine runs as a modular Node.js service. Once a score is recalculated, it is asynchronously synced to the `SAWRegistry.sol` smart contract via the `ChainSync` module, ensuring that trust is verifiable on-chain.
