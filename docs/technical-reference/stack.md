# Technical Stack

SAW is built using a "Web 2.5" architecture, combining the immutability of blockchain with the performance of modern web technologies.

## Core Stack

### 1. Smart Contract Layer
*   **Language**: Solidity ^0.8.20
*   **Framework**: [Hardhat](https://hardhat.org/)
*   **Libraries**: [OpenZeppelin](https://openzeppelin.com/contracts/) (ReentrancyGuard, Ownable)
*   **Networks**: Arbitrum / Base / Ethereum Mainnet

### 2. Backend Infrastructure
*   **Runtime**: Node.js
*   **Framework**: Express.js
*   **Database**: MongoDB (via Mongoose)
*   **Indexing**: Custom Blockchain Event Listener (SyncEngine)
*   **Reputation**: Modular Trust Engine for score calculation

### 3. Frontend Application
*   **Framework**: React (using Vite)
*   **Styling**: Vanilla CSS with a custom Design System
*   **Web3 Integration**: Ethers.js v6
*   **State Management**: React Context API (Wallet & Agent state)
*   **Animations**: Custom micro-interactions and smooth transitions

## DevOps & Scalability
*   **Containerization**: Docker & Docker Compose
*   **Versioning**: Git for both codebase and documentation
*   **Registry Security**: SHA-256 Artifact Hashing

## Architectural Overview
The protocol is split into three main components:
1.  **Identity & Registry**: On-chain storage of ownership and reputation.
2.  **Trust Engine**: Off-chain compute for complex reputation math.
3.  **Marketplace Interface**: Real-time UI for agent browsing and auction participation.
