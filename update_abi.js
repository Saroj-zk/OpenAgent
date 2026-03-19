const fs = require('fs');
const artifact = JSON.parse(fs.readFileSync('artifacts/contracts/SAWRegistry.sol/SAWRegistry.json', 'utf8'));

let contractsFile = fs.readFileSync('marketplace-app/src/contracts.js', 'utf8');

const abiString = JSON.stringify(artifact.abi, null, 4);

// Replace everything between export const REGISTRY_ABI = ... and export const CONTRACT_ADDRESS
const regex = /export const REGISTRY_ABI = \[[\s\S]*?\];[\s]*export const CONTRACT_ADDRESS/;
const newContent = contractsFile.replace(regex, `export const REGISTRY_ABI = ${abiString};\n\nexport const CONTRACT_ADDRESS`);

fs.writeFileSync('marketplace-app/src/contracts.js', newContent);
console.log('ABI updated in contracts.js');
