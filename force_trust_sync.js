const { ethers } = require('ethers');
require('./load-env');

async function forceSync() {
    const RPC_URL = "https://sepolia.base.org";
    const CONTRACT_ADDRESS = "0x1AAb5946263Eeb41107661D74f946F176E0d281E";
    const ADMIN_KEY = "d0722c748521496980fc7e85c1c8f915f07242ae0d4d43dac35ba27ab5d26b20";
    const targetAddress = "0x9527c9fD391CCd48f7278FE7c7C09B786a0bb832";

    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const wallet = new ethers.Wallet(ADMIN_KEY, provider);

    const abi = [
        "function setTrustScore(address _creator, uint256 _score) external",
        "function arbiter() view returns (address)"
    ];

    const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, wallet);

    console.log("Arbiter on chain:", await contract.arbiter());
    console.log("My address:", wallet.address);

    console.log(`Setting Trust Score 200 for ${targetAddress}...`);
    try {
        const tx = await contract.setTrustScore(targetAddress, 200);
        await tx.wait();
        console.log("✅ Success!");
    } catch (e) {
        console.error("❌ Failed:", e.message);
    }
}

forceSync();
