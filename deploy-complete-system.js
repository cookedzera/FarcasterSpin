const { ethers } = require("hardhat");
require("dotenv").config();

async function main() {
  console.log("🚀 Deploying complete ArbCasino system on Arbitrum Sepolia...");
  
  // Get deployer account
  const [deployer] = await ethers.getSigners();
  console.log(`📝 Deploying with account: ${deployer.address}`);
  
  // Check balance
  const balance = await deployer.provider.getBalance(deployer.address);
  console.log(`💰 Account balance: ${ethers.formatEther(balance)} ETH`);
  
  if (balance < ethers.parseEther("0.01")) {
    throw new Error("❌ Insufficient balance. Need at least 0.01 ETH for deployment.");
  }

  // Deploy test tokens
  console.log("\n🪙 Deploying test tokens...");
  
  const TestToken = await ethers.getContractFactory("TestToken");
  
  // Deploy AIDOGE Test Token
  console.log("📤 Deploying AIDOGE Test Token...");
  const aidogeToken = await TestToken.deploy(
    "AIDOGE Test",
    "AIDOGE", 
    18,
    1000000
  );
  await aidogeToken.waitForDeployment();
  const aidogeAddress = await aidogeToken.getAddress();
  console.log(`✅ AIDOGE deployed at: ${aidogeAddress}`);
  
  // Deploy BOOP Test Token
  console.log("📤 Deploying BOOP Test Token...");
  const boopToken = await TestToken.deploy(
    "BOOP Test",
    "BOOP",
    18, 
    1000000
  );
  await boopToken.waitForDeployment();
  const boopAddress = await boopToken.getAddress();
  console.log(`✅ BOOP deployed at: ${boopAddress}`);
  
  // Deploy BOBOTRUM Test Token
  console.log("📤 Deploying BOBOTRUM Test Token...");
  const bobotrumToken = await TestToken.deploy(
    "BOBOTRUM Test", 
    "BOBOTRUM",
    18,
    1000000
  );
  await bobotrumToken.waitForDeployment();
  const bobotrumAddress = await bobotrumToken.getAddress();
  console.log(`✅ BOBOTRUM deployed at: ${bobotrumAddress}`);

  // Deploy main game contract
  console.log("\n🎰 Deploying Wheel Game contract...");
  const WheelGame = await ethers.getContractFactory("WheelGameArbitrumSepolia");
  
  const wheelGame = await WheelGame.deploy(
    aidogeAddress,
    boopAddress,
    bobotrumAddress
  );
  await wheelGame.waitForDeployment();
  const gameAddress = await wheelGame.getAddress();
  console.log(`✅ Wheel Game deployed at: ${gameAddress}`);

  // Fund the game contract with tokens
  console.log("\n💰 Funding game contract with tokens...");
  
  const fundAmount = ethers.parseEther("50000"); // 50k tokens each
  
  // Transfer tokens to game contract
  await aidogeToken.transfer(gameAddress, fundAmount);
  console.log(`✅ Transferred 50,000 AIDOGE to game contract`);
  
  await boopToken.transfer(gameAddress, fundAmount);
  console.log(`✅ Transferred 50,000 BOOP to game contract`);
  
  await bobotrumToken.transfer(gameAddress, fundAmount);
  console.log(`✅ Transferred 50,000 BOBOTRUM to game contract`);

  // Verify contract balances
  console.log("\n📊 Verifying contract balances...");
  const aidogeBalance = await aidogeToken.balanceOf(gameAddress);
  const boopBalance = await boopToken.balanceOf(gameAddress);
  const bobotrumBalance = await bobotrumToken.balanceOf(gameAddress);
  
  console.log(`AIDOGE balance: ${ethers.formatEther(aidogeBalance)}`);
  console.log(`BOOP balance: ${ethers.formatEther(boopBalance)}`);
  console.log(`BOBOTRUM balance: ${ethers.formatEther(bobotrumBalance)}`);

  // Save deployment info
  const deploymentInfo = {
    network: "arbitrumSepolia",
    chainId: 421614,
    deployer: deployer.address,
    deploymentTime: new Date().toISOString(),
    contracts: {
      wheelGame: {
        address: gameAddress,
        name: "WheelGameArbitrumSepolia"
      },
      tokens: {
        AIDOGE: {
          address: aidogeAddress,
          name: "AIDOGE Test",
          symbol: "AIDOGE"
        },
        BOOP: {
          address: boopAddress,
          name: "BOOP Test", 
          symbol: "BOOP"
        },
        BOBOTRUM: {
          address: bobotrumAddress,
          name: "BOBOTRUM Test",
          symbol: "BOBOTRUM"
        }
      }
    }
  };

  // Write deployment info to file
  const fs = require('fs');
  fs.writeFileSync('deployment-info.json', JSON.stringify(deploymentInfo, null, 2));

  console.log("\n🎉 Deployment completed successfully!");
  console.log("📄 Deployment info saved to deployment-info.json");
  console.log("\n📋 Contract Addresses:");
  console.log(`🎰 Wheel Game: ${gameAddress}`);
  console.log(`🪙 AIDOGE: ${aidogeAddress}`);
  console.log(`🪙 BOOP: ${boopAddress}`);
  console.log(`🪙 BOBOTRUM: ${bobotrumAddress}`);
  
  return deploymentInfo;
}

if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error("❌ Deployment failed:", error);
      process.exit(1);
    });
}

module.exports = { main };