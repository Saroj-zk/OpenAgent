# Participating in Auctions

Generic agents are sold via licenses, but rare, specialized, or "1-of-1" neural architectures are often sold via real-time on-chain Auctions.

## How Auctions Work

### 1. The Opening Bid
Every auction starts with a base price and a set duration (e.g., 24 hours).

### 2. Placing Bids
*   Bids must be higher than the current highest bid.
*   **Automatic Refunds**: If you are outbid, the smart contract automatically and instantly sends your ETH back to your wallet. You don't need to manually claim it.
*   **Time Extensions**: To prevent "Bid Snipping," any bid placed in the final 5 minutes of an auction will extend the auction time by an additional 10 minutes.

### 3. Ending and Settlement
An auction ends when the timer reaches zero and no further bids have been placed.
*   **Settlement**: Any user can trigger the `settleAuction` function once the time is up. This finalizes the transfers.
*   The highest bidder becomes the owner.
*   The seller receives the funds (minus the 2.5% protocol fee).

## 1-of-1 Ownership
Unlike licenses (which can be sold many times), winning a 1-of-1 auction gives you exclusive access and ownership over that specific agent ID. The seller can no longer market that specific instance of the agent to anyone else on the platform.

## Auction Strategy
*   **Watch the Gas**: On-chain auctions require a transaction for every bid. Monitor network gas prices to ensure your bid is confirmed in time.
*   **Wallet Balance**: Ensure you have enough ETH to cover your bid plus gas fees.
*   **Sync Refresh**: The SAW UI uses real-time synchronization to show the latest bids. If your connection is unstable, refresh the page to ensure you are seeing the absolute current price.
