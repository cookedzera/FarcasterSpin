import { ethers } from "ethers";

const ERC20_ABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)", 
  "function decimals() view returns (uint8)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address) view returns (uint256)"
];

async function checkTokens() {
  console.log("🔍 Checking testnet tokens...");
  
  const provider = new ethers.JsonRpcProvider("https://sepolia-rollup.arbitrum.io/rpc");
  
  const tokens = [
    "0x06d8c3f0e1cfb7e9d3f5b51d17dcd623acc1b3b7",
    "0x1842887de1c7fdd59e3948a93cd41aad48a19cb2", 
    "0x0ba7a82d415500bebfa254502b655732cd678d07"
  ];
  
  for (let i = 0; i < tokens.length; i++) {
    const address = tokens[i];
    console.log(`\n📋 Token ${i + 1}: ${address}`);
    
    try {
      const contract = new ethers.Contract(address, ERC20_ABI, provider);
      
      const [name, symbol, decimals, totalSupply] = await Promise.all([
        contract.name(),
        contract.symbol(),
        contract.decimals(),
        contract.totalSupply()
      ]);
      
      console.log(`✅ Name: ${name}`);
      console.log(`🏷️  Symbol: ${symbol}`);
      console.log(`🔢 Decimals: ${decimals}`);
      console.log(`💰 Total Supply: ${ethers.formatUnits(totalSupply, decimals)}`);
      
      // Check if we can get some of these tokens
      console.log(`🎯 This token looks valid for testing!`);
      
    } catch (error) {
      console.log(`❌ Error checking token: ${error.message}`);
      console.log(`⚠️  This token might not be a valid ERC20 or contract doesn't exist`);
    }
  }
  
  console.log(`\n🎮 Next steps:`);
  console.log(`1. Use valid tokens in the wheel contract`);
  console.log(`2. Get some of these tokens to fund the contract`);
  console.log(`3. Deploy the wheel contract with these token addresses`);
}

checkTokens().catch(console.error);