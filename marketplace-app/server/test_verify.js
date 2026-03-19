const { verifyMessage } = require('ethers');

const address = "0xab6dc48a422eac98aee5e757ce7f6844cece5327";
const nonce = "test-nonce";
const message = `Sign this message to prove you own this wallet and to log in to SAW.\n\nNonce: ${nonce}`;

// Simulated signature from a known wallet if possible, but I don't have one here.
// I'll just check if verifyMessage is available.
console.log("verifyMessage defined:", typeof verifyMessage);
