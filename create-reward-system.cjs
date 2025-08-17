const { ethers } = require("ethers");
require("dotenv").config();

async function createRewardSystem() {
  console.log("🎁 Setting up reward system...");
  
  const RPC_URL = process.env.ARBITRUM_SEPOLIA_RPC || "https://sepolia-rollup.arbitrum.io/rpc";
  const PRIVATE_KEY = process.env.WALLET_PRIVATE_KEY;
  
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  let privateKey = PRIVATE_KEY.trim();
  if (!privateKey.startsWith('0x')) {
    privateKey = '0x' + privateKey;
  }
  
  const signer = new ethers.Wallet(privateKey, provider);
  const WHEEL_GAME_ADDRESS = "0x4be6dd3897fd6fbc8a619c69fa6f4bd94531d90a";
  
  // ERC20 ABI for token interactions
  const ERC20_ABI = [
    "function name() view returns (string)",
    "function symbol() view returns (string)",
    "function decimals() view returns (uint8)",
    "function balanceOf(address) view returns (uint256)",
    "function transfer(address to, uint256 amount) returns (bool)"
  ];
  
  const contract = new ethers.Contract(WHEEL_GAME_ADDRESS, [
    "function getPendingRewards(address player) external view returns (uint256, uint256, uint256)",
    "function spin() external returns (string memory, bool, address, uint256)"
  ], signer);
  
  console.log(`📝 Working with account: ${signer.address}`);
  
  try {
    // Get token contracts from the wheel game's spin results
    console.log("\n🎰 Testing spin to get token addresses...");
    
    const tx = await contract.spin();
    const receipt = await tx.wait();
    
    console.log(`Spin transaction: ${tx.hash}`);
    
    // Parse events to get token addresses
    const events = receipt.logs.map(log => {
      try {
        return contract.interface.parseLog(log);
      } catch {
        return null;
      }
    }).filter(Boolean);
    
    const spinEvent = events.find(event => event.name === "SpinResult");
    if (spinEvent) {
      console.log("Spin result:", {
        segment: spinEvent.args.segment,
        isWin: spinEvent.args.isWin,
        tokenAddress: spinEvent.args.tokenAddress,
        rewardAmount: ethers.formatEther(spinEvent.args.rewardAmount)
      });
      
      // If we got a token address, let's check its info
      if (spinEvent.args.tokenAddress !== "0x0000000000000000000000000000000000000000") {
        const tokenContract = new ethers.Contract(spinEvent.args.tokenAddress, ERC20_ABI, provider);
        
        try {
          const [name, symbol, decimals] = await Promise.all([
            tokenContract.name(),
            tokenContract.symbol(),
            tokenContract.decimals()
          ]);
          
          console.log(`Token info: ${name} (${symbol}) - ${decimals} decimals`);
        } catch (error) {
          console.log("Could not get token info, might be native token reward");
        }
      }
    }
    
    // Check current pending rewards
    console.log("\n💰 Current pending rewards:");
    const pendingRewards = await contract.getPendingRewards(signer.address);
    console.log({
      token1: ethers.formatEther(pendingRewards[0]),
      token2: ethers.formatEther(pendingRewards[1]),
      token3: ethers.formatEther(pendingRewards[2])
    });
    
    // Create reward configuration
    const rewardConfig = {
      contractAddress: WHEEL_GAME_ADDRESS,
      chainId: 421614,
      network: "arbitrumSepolia",
      rewardSystem: {
        type: "pending_rewards", // Rewards accumulate in contract
        claimMethod: "individual", // Claim each token separately
        minClaimAmount: "100000000000000000", // 0.1 tokens
      },
      tokenMappings: {
        TOKEN1: {
          name: "IARB Token",
          symbol: "IARB",
          baseReward: "1000000000000000000", // 1 token
          color: "#FF6B6B"
        },
        TOKEN2: {
          name: "JUICE Token", 
          symbol: "JUICE",
          baseReward: "2000000000000000000", // 2 tokens
          color: "#4ECDC4"
        },
        TOKEN3: {
          name: "ABET Token",
          symbol: "ABET", 
          baseReward: "500000000000000000", // 0.5 tokens
          color: "#45B7D1"
        }
      },
      wheelSegments: [
        "IARB", "BUST", "JUICE", "BONUS", "ABET", "BUST", "IARB", "JACKPOT"
      ],
      multipliers: {
        BONUS: 2,
        JACKPOT: 10
      }
    };
    
    // Save configuration
    const fs = require('fs');
    fs.writeFileSync('reward-system-config.json', JSON.stringify(rewardConfig, null, 2));
    
    console.log("\n✅ Reward system configuration created!");
    console.log("📄 Config saved to reward-system-config.json");
    
    return rewardConfig;
    
  } catch (error) {
    console.error("❌ Failed to create reward system:", error.message);
    throw error;
  }
}

createRewardSystem();