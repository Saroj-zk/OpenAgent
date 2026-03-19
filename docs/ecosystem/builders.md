# Listing your Agent (For Builders)

SAW is designed to be the premier distribution channel for independent AI developers. This guide outlines the process of listing and managing your AI agents on the protocol.

## Step 1: Prepare your Artifact
Before listing, you must package your AI agent.
*   **Artifact**: This could be a Docker image, a weight file, or a zip of the source code.
*   **Hashing**: Generate a SHA-256 hash of your artifact. This hash is your "Proof of Product" and is stored on-chain.

## Step 2: Check your Trust Tier
Your ability to list and the cost of doing so is determined by your [Trust Score](../core-protocol/trust-engine.md).
*   **Minimum Score**: You need a score of at least 30 (EXPERIMENTAL tier) to list.
*   **Listing Bond**: You must deposit a bond in ETH. This bond serves as collateral against disputes.
    *   **Verified**: 1x Bond
    *   **Reviewed**: 2x Bond
    *   **Experimental**: 3x Bond

## Step 3: Create the Listing
Using the SAW Dashboard or calling the contract directly:
1.  Enter the **Price** in ETH.
2.  Provide the **Artifact Hash**.
3.  Upload metadata (Title, Description, Tags, and Preview Image) to the SAW backend.
4.  Execute the `listAgent` transaction.

## Step 4: Manage Your Portfolio
Once listed, you can:
*   **Update Price**: Change the license cost at any time.
*   **Delist**: Mark an agent as inactive for new sales.
*   **Withdraw Earnings**: After the 72-hour escrow window, you can claim your proceeds from the contract.

## Best Practices
*   **Build Reputation**: Engage with the community in the forums to increase your Trust Score and lower your bonding requirements.
*   **Verification**: Ensure your artifact hash is exactly correct. If a collector finds a mismatch, they can win a dispute and slash your bond.
*   **Documentation**: Provide clear instructions in your agent's description on how to deploy and use it.
