const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying WheelGame contract to Arbitrum...");

  // Get the contract factory
  const WheelGame = await ethers.getContractFactory("WheelGame");
  
  // Deploy the contract
  const wheelGame = await WheelGame.deploy();
  
  // Wait for deployment to finish
  await wheelGame.deployed();
  
  console.log("✅ WheelGame deployed to:", wheelGame.address);
  console.log("🔗 View on Arbiscan:", `https://arbiscan.io/address/${wheelGame.address}`);
  
  // Log important information
  console.log("\n📋 Next Steps:");
  console.log("1. Update WHEEL_GAME_ADDRESS in server/blockchain.ts with:", wheelGame.address);
  console.log("2. Fund the contract with reward tokens:");
  console.log("   - AIDOGE: ~500,000 tokens");
  console.log("   - BOOP: ~200,000 tokens");
  console.log("   - BOBOTRUM: ~150,000 tokens");
  console.log("3. Test the integration with a small spin");
  
  return wheelGame.address;
}

main()
  .then((address) => {
    console.log(`\n🎉 Deployment successful! Contract: ${address}`);
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });