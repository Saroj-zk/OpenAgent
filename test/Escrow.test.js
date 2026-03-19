const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("SAWRegistry - Escrow Lifecycle", function () {
    let Registry;
    let registry;
    let owner;
    let creator;
    let buyer;
    let agentId;
    let listingBond;

    const ESCROW_WINDOW = 72 * 60 * 60; // 72 hours

    beforeEach(async function () {
        [owner, creator, buyer] = await ethers.getSigners();

        Registry = await ethers.getContractFactory("contracts/OpenAgentRegistry.sol:SAWRegistry");
        registry = await Registry.deploy(owner.address);
        listingBond = await registry.LISTING_BOND();

        // List an agent
        const price = ethers.parseEther("1.0");
        const mockHash = ethers.id("mock-zip-file-content");

        // Give creator VERIFIED status (1x bond)
        await registry.connect(owner).setTrustScore(creator.address, 200);

        await registry.connect(creator).listAgent(price, mockHash, { value: listingBond });
        agentId = 1; // Assuming it's the first agent
    });

    it("Should create an escrow with the correct state when an agent is bought", async function () {
        const price = ethers.parseEther("1.0");

        const tx = await registry.connect(buyer).buyAgent(agentId, { value: price });
        const receipt = await tx.wait();

        const block = await ethers.provider.getBlock(receipt.blockNumber);
        const escrow = await registry.getEscrow(1); // escrowId 1

        expect(escrow.buyer).to.equal(buyer.address);
        expect(escrow.creator).to.equal(creator.address);
        expect(escrow.state).to.equal(0); // EscrowState.CREATED
        expect(escrow.createdAt).to.equal(block.timestamp);
        expect(escrow.expiryAt).to.equal(block.timestamp + ESCROW_WINDOW);
    });

    it("Should allow finalization after time travel", async function () {
        const price = ethers.parseEther("1.0");
        await registry.connect(buyer).buyAgent(agentId, { value: price });

        const escrowBefore = await registry.getEscrow(1);
        const creatorBalanceBefore = await ethers.provider.getBalance(creator.address);

        // Cannot finalize early
        await expect(registry.connect(owner).finalizeEscrow(1))
            .to.be.revertedWith("Escrow window not yet expired");

        // Time travel past expiry
        await time.increase(ESCROW_WINDOW + 10);

        // Finalize
        await expect(registry.connect(owner).finalizeEscrow(1))
            .to.emit(registry, "EscrowFinalized")
            .withArgs(1, creator.address, escrowBefore.amount);

        const escrowAfter = await registry.getEscrow(1);
        expect(escrowAfter.state).to.equal(3); // EscrowState.FINALIZED

        const creatorBalanceAfter = await ethers.provider.getBalance(creator.address);
        expect(creatorBalanceAfter).to.be.gt(creatorBalanceBefore);
    });

    it("Should prevent finalization if disputed and allow partial refund resolution", async function () {
        const price = ethers.parseEther("1.0");
        await registry.connect(buyer).buyAgent(agentId, { value: price });

        const evidenceHash = ethers.id("bad agent");
        await registry.connect(buyer).openDispute(1, evidenceHash);

        let escrow = await registry.getEscrow(1);
        expect(escrow.state).to.equal(1); // EscrowState.DISPUTED

        // Time travel past expiry
        await time.increase(ESCROW_WINDOW + 10);

        // Finalize should fail because state is not CREATED
        await expect(registry.connect(owner).finalizeEscrow(1))
            .to.be.revertedWith("Escrow is not in CREATED state");

        // Creator responds
        const responseHash = ethers.id("it works fine");
        await registry.connect(creator).respondDispute(1, responseHash);

        escrow = await registry.getEscrow(1);
        expect(escrow.creatorResponseHash).to.equal(responseHash);

        // Arbiter resolves with partial refund
        const amount = escrow.amount;
        const buyerPayout = amount / 2n;
        const creatorPayout = amount - buyerPayout;

        const buyerBalBefore = await ethers.provider.getBalance(buyer.address);
        const creatorBalBefore = await ethers.provider.getBalance(creator.address);

        // owner is the arbiter by default in the constructor
        const tx = await registry.connect(owner).resolveDispute(1, buyerPayout, creatorPayout);
        const receipt = await tx.wait();

        escrow = await registry.getEscrow(1);
        expect(escrow.state).to.equal(2); // EscrowState.RESOLVED

        // To calculate accurate delta, we would need to account for gas costs if buyer or creator was msg.sender,
        // but since owner is the arbiter (msg.sender), buyerBal and creatorBal changes are exactly the payouts.
        const buyerBalAfter = await ethers.provider.getBalance(buyer.address);
        const creatorBalAfter = await ethers.provider.getBalance(creator.address);

        expect(buyerBalAfter - buyerBalBefore).to.equal(buyerPayout);
        expect(creatorBalAfter - creatorBalBefore).to.equal(creatorPayout);
    });

    it("Should block openDispute after expiry", async function () {
        const price = ethers.parseEther("1.0");
        await registry.connect(buyer).buyAgent(agentId, { value: price });

        await time.increase(ESCROW_WINDOW + 10);

        const evidenceHash = ethers.id("bad agent");
        await expect(registry.connect(buyer).openDispute(1, evidenceHash))
            .to.be.revertedWith("Escrow already expired");
    });

    it("Should restrict openDispute only to the buyer", async function () {
        const price = ethers.parseEther("1.0");
        await registry.connect(buyer).buyAgent(agentId, { value: price });

        const evidenceHash = ethers.id("bad agent");
        await expect(registry.connect(owner).openDispute(1, evidenceHash))
            .to.be.revertedWith("Only buyer can dispute");
    });

    it("Should restrict respondDispute only to the creator", async function () {
        const price = ethers.parseEther("1.0");
        await registry.connect(buyer).buyAgent(agentId, { value: price });

        const evidenceHash = ethers.id("bad agent");
        await registry.connect(buyer).openDispute(1, evidenceHash);

        const responseHash = ethers.id("it works fine");
        await expect(registry.connect(buyer).respondDispute(1, responseHash))
            .to.be.revertedWith("Only creator can respond");
    });

    it("Should restrict resolveDispute only to the arbiter", async function () {
        const price = ethers.parseEther("1.0");
        await registry.connect(buyer).buyAgent(agentId, { value: price });

        const evidenceHash = ethers.id("bad agent");
        await registry.connect(buyer).openDispute(1, evidenceHash);

        const escrow = await registry.getEscrow(1);

        await expect(registry.connect(buyer).resolveDispute(1, escrow.amount, 0n))
            .to.be.revertedWith("NOT_ARBITER");
    });

    it("Should enforce partial refunds sum constraint", async function () {
        const price = ethers.parseEther("1.0");
        await registry.connect(buyer).buyAgent(agentId, { value: price });

        const evidenceHash = ethers.id("bad agent");
        await registry.connect(buyer).openDispute(1, evidenceHash);

        const escrow = await registry.getEscrow(1);

        // Intentionally wrong maths
        await expect(registry.connect(owner).resolveDispute(1, escrow.amount, 100n))
            .to.be.revertedWith("Payouts must equal escrow amount");
    });

    it("Should store artifactHash immutably and verified via getter", async function () {
        const mockHash = ethers.id("mock-zip-file-content");
        const storedHash = await registry.getAgentArtifactHash(agentId);
        expect(storedHash).to.equal(mockHash);
    });

    it("Should apply strikes and slash the bond if creator loses dispute", async function () {
        const bondAmount = listingBond;

        // At start, creator bond equals the configured base listing bond
        let creatorBondBefore = await registry.creatorBonds(creator.address);
        expect(creatorBondBefore).to.equal(bondAmount);

        const price = ethers.parseEther("1.0");
        await registry.connect(buyer).buyAgent(agentId, { value: price });

        const evidenceHash = ethers.id("bad agent");
        await registry.connect(buyer).openDispute(1, evidenceHash);

        const responseHash = ethers.id("it works fine");
        await registry.connect(creator).respondDispute(1, responseHash);

        const escrow = await registry.getEscrow(1);

        // Arbiter resolves fully in favor of buyer
        await expect(registry.connect(owner).resolveDispute(1, escrow.amount, 0n))
            .to.emit(registry, "CreatorStrike")
            .withArgs(creator.address, 1)
            .to.emit(registry, "CreatorSlashed")
            .withArgs(creator.address, bondAmount);

        let strikes = await registry.creatorStrikes(creator.address);
        expect(strikes).to.equal(1);

        let creatorBondAfter = await registry.creatorBonds(creator.address);
        expect(creatorBondAfter).to.equal(0n); // Slashed completely
    });

    it("Should block listing if trust score is too low (RESTRICTED)", async function () {
        const [_, __, ___, restrictedUser] = await ethers.getSigners();
        const price = ethers.parseEther("1.0");
        const mockHash = ethers.id("restricted");

        // Trust score 10 (Restricted)
        await registry.connect(owner).setTrustScore(restrictedUser.address, 10);

        await expect(registry.connect(restrictedUser).listAgent(price, mockHash, { value: listingBond }))
            .to.be.revertedWith("Trust score < 50 (RESTRICTED)");
    });

    it("Should require 3x bond for EXPERIMENTAL status (50 <= score < 100)", async function () {
        const [_, __, ___, expUser] = await ethers.getSigners();
        const price = ethers.parseEther("1.0");
        const mockHash = ethers.id("experimental");

        // Trust score 50 (Experimental)
        await registry.connect(owner).setTrustScore(expUser.address, 50);

        // Try with 1x bond -> should fail
        await expect(registry.connect(expUser).listAgent(price, mockHash, { value: listingBond }))
            .to.be.revertedWith("Incorrect bond amount");

        // Try with 3x bond -> should succeed
        await expect(registry.connect(expUser).listAgent(price, mockHash, { value: listingBond * 3n }))
            .to.emit(registry, "AgentListed");
    });

});
