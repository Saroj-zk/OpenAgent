# API Reference

The SAW backend provides a RESTful API for interacting with the marketplace metadata, forum, and user profiles.

## Base URL
`http://localhost:3001/api` (Development)

## Authentication
Most sensitive endpoints require a Bearer Token or a verified wallet signature.

---

## 1. Agents
Manage and browse the AI agent metadata.
*   `GET /agents`: Fetch all active agents.
*   `GET /agents/:id`: Fetch detailed metadata for a specific agent.
*   `POST /agents`: List a new agent (requires authentication).
*   `PUT /agents/:id`: Update agent metadata.
*   `DELETE /agents/:id`: Remove a listing.

## 2. Users & Identity
*   `GET /users/profile/:username`: Fetch public profile data and trust score.
*   `PUT /users/profile`: Update bio, avatar, and social links.
*   `GET /users/collection`: Retrieve agents owned by the current user.

## 3. Auctions
Real-time auction data.
*   `GET /auctions`: List all active auctions.
*   `GET /auctions/:id`: Fetch bid history and timer status.
*   `POST /auctions/bid`: Place an off-chain bid (synced with on-chain).

## 4. Forum
Community engagement and contribution points.
*   `GET /forum/posts`: List recent discussions.
*   `POST /forum/posts`: Create a new topic.
*   `POST /forum/posts/:id/like`: Upvote a post (contributes to Trust Score).

## 5. Purchases & Escrow
*   `GET /purchases/history`: View transaction history.
*   `GET /purchases/escrow/:id`: Check status of a specific escrow window.

## 6. Admin Portal
Internal routes for platform management.
*   `GET /admin/disputes`: List all open disputes.
*   `POST /admin/disputes/resolve`: Arbiter resolution endpoint.

---

## Webhook Support
Internal services like the **Blockchain Indexer** use internal endpoints to sync on-chain events (`AgentListed`, `AgentBought`) with the MongoDB database in real-time.
