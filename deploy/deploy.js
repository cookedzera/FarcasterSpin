const { ethers } = require("ethers");
const fs = require("fs");

async function deployWheelGame() {
  // Arbitrum mainnet configuration
  const provider = new ethers.JsonRpcProvider("https://arb1.arbitrum.io/rpc");
  
  if (!process.env.WALLET_PRIVATE_KEY) {
    console.error("WALLET_PRIVATE_KEY environment variable is required");
    process.exit(1);
  }
  
  const wallet = new ethers.Wallet(process.env.WALLET_PRIVATE_KEY, provider);
  
  console.log("Deploying from account:", wallet.address);
  console.log("Account balance:", ethers.formatEther(await provider.getBalance(wallet.address)), "ETH");
  
  // Read the compiled contract (you'll need to compile with solc)
  const contractSource = fs.readFileSync("contracts/WheelGame.sol", "utf8");
  
  console.log("Note: You need to compile the contract first using:");
  console.log("1. Install solc: npm install -g solc");
  console.log("2. Install OpenZeppelin: npm install @openzeppelin/contracts");
  console.log("3. Compile: solc --optimize --abi --bin contracts/WheelGame.sol -o build/");
  console.log("4. Update this deploy script with the compiled bytecode");
  
  // For now, just log the contract address after manual compilation
  console.log("\nContract ready for deployment on Arbitrum mainnet");
  console.log("Token addresses configured:");
  console.log("AIDOGE:", "0x09e18590e8f76b6cf471b3cd75fe1a1a9d2b2c2b");
  console.log("BOOP:", "0x13A7DeDb7169a17bE92B0E3C7C2315B46f4772B3");
  console.log("BOBOTRUM:", "0x60460971a3D79ef265dfafA393ffBCe97d91E8B8");
}

if (require.main === module) {
  deployWheelGame().catch(console.error);
}

module.exports = { deployWheelGame };