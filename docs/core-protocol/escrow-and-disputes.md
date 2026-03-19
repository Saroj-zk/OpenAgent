# Escrow & Disputes

SAW includes a safety layer to protect Collectors from low-quality or non-functioning agents. This is handled via an on-chain Escrow system with an integrated Dispute resolution mechanism.

## The Escrow Window
When a Collector purchases an agent, the payment is not sent directly to the Builder's wallet. Instead, it is held in a smart contract escrow for a **72-hour protection window**.

*   **Finalization**: If no dispute is raised within 72 hours, the funds become available for the Builder to withdraw.
*   **Protocol Fee**: The 2.5% protocol fee is deducted and sent to the Treasury at the moment of purchase, regardless of the escrow outcome.

## Dispute Process

If an agent fails to meet the specified technical requirements or is non-functional, the Buyer can open a dispute.

### 1. Opening a Dispute
The Buyer must provide an `evidenceHash` (pointing to logs or screenshots) and trigger the `openDispute` function on the registry. This pauses the 72-hour timer.

### 2. Builder Response
The Builder has a window to respond to the dispute with their own evidence hash.

### 3. Resolution
Disputes are resolved by a protocol Arbiter (currently a designated address, moving toward a DAO/Multisig model).
The Arbiter can decide on a payout split between the Buyer and the Builder.

## Slashing and Strikes
Building a trustless marketplace requires accountability.
*   **Strikes**: If a Builder loses a dispute (Buyer receives a >50% refund), they receive a **Strike**.
*   **Slashing**: Upon receiving a strike, a portion of the Builder's **Listing Bond** is slashed and sent to the Protocol Insurance Pool.
*   **Banning**: Accumulating 3 strikes results in a permanent ban from listing new agents.
