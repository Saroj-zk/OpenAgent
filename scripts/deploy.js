const hre = require("hardhat");

async function main() {
    const [deployer] = await hre.ethers.getSigners();
    const Registry = await hre.ethers.getContractFactory("contracts/OpenAgentRegistry.sol:SAWRegistry");
    const registry = await Registry.deploy(deployer.address);

    await registry.waitForDeployment();

    console.log("-----------------------------------------");
    console.log("SAWRegistry deployed to:", await registry.getAddress());
    console.log("-----------------------------------------");
    console.log("Update CONTRACT_ADDRESS in marketplace-app/src/contracts.js with this address.");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
