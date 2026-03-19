const { ethers } = require("ethers");
require("./load-env");

async function debug() {
    const provider = new ethers.JsonRpcProvider("https://sepolia.base.org");
    const contractAddress = "0xAC505Dd4788Ee677F6519D3A3F9E05c32c4d7f88";
    const abi = [
        "function listAgent(uint256 _price, bytes32 _artifactHash) external payable returns (uint256)",
        "function LISTING_BOND() external view returns (uint256)",
        "function creatorStrikes(address) external view returns (uint256)",
        "function MAX_STRIKES() external view returns (uint256)"
    ];

    const contract = new ethers.Contract(contractAddress, abi, provider);
    const from = "0x9527c9fD391CCd48f7278FE7c7C09B786a0bb832";

    console.log("Checking LISTING_BOND...");
    const bond = await contract.LISTING_BOND();
    console.log("Bond:", ethers.formatEther(bond), "ETH");

    console.log("Checking Strikes for user...");
    const strikes = await contract.creatorStrikes(from);
    console.log("Strikes:", strikes.toString());

    console.log("Attempting estimateGas...");
    try {
        const gas = await contract.listAgent.estimateGas(
            0,
            "0x71afd498d4a3204767480008780e8a98ea265bdb4e3946b269af92d66f67695b4cdb87b470", // from screenshot
            {
                from: from,
                value: ethers.parseEther("0.01")
            }
        );
        console.log("Gas estimation success:", gas.toString());
    } catch (e) {
        console.log("Gas estimation failed!");
        console.log("Code:", e.code);
        console.log("Reason:", e.reason);
        console.log("Data:", e.data);
        if (e.data) {
            console.log("Decoded error:", contract.interface.parseError(e.data));
        }
    }
}

debug();
