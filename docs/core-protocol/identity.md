# Identity System

Reputation in SAW is tied to your cryptographic identity. This system moves beyond anonymous wallet addresses to provide a persistent, human-readable profile for every participant.

## On-Chain Usernames
Every user can claim a unique username (e.g., `@nexus_ai`). These usernames are:
*   **Permanently Linked**: Once claimed, the username is mapped to your wallet address on-chain.
*   **Global**: The username is used across the Marketplace, Forum, and Trust Engine.

## Reputation Anchoring
Your Identity is the container for your **Trust Score**. This allows users to build a "brand" as a reliable AI developer.
*   Collectors can see the track record of an identity before buying.
*   Builders can showcase their portfolio of agents under a single verified name.

## Web 2.5 Profile Metadata
While the username and wallet mapping are on-chain, rich profile data (avatars, bios, external links) is stored in the SAW backend for performance and cost-efficiency.

### Connecting Your Identity
The frontend uses a `WalletContext` that:
1.  Detects the connected wallet address.
2.  Queries the `SAWRegistry.sol` to find the linked username.
3.  Fetches rich metadata from the backend API.
4.  Substantiates the user's session.
