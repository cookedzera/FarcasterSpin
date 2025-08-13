import { ethers } from "ethers";

async function checkWallet() {
  console.log("🔍 Checking wallet setup...");
  
  if (!process.env.WALLET_PRIVATE_KEY) {
    console.error("❌ WALLET_PRIVATE_KEY not found in environment");
    return;
  }
  
  try {
    // Clean up the private key (remove spaces, ensure proper format)
    let privateKey = process.env.WALLET_PRIVATE_KEY.trim();
    
    // Add 0x prefix if missing
    if (!privateKey.startsWith('0x')) {
      privateKey = '0x' + privateKey;
    }
    
    console.log("🔑 Private key format:", privateKey.length === 66 ? "✅ Correct" : "❌ Invalid length");
    console.log("📏 Key length:", privateKey.length, "(should be 66)");
    
    if (privateKey.length !== 66) {
      console.error("❌ Private key should be 64 characters + '0x' prefix = 66 total");
      console.log("💡 Your key:", `"${privateKey}"`);
      console.log("💡 Please remove any extra spaces or characters");
      return;
    }
    
    // Test wallet creation
    const wallet = new ethers.Wallet(privateKey);
    console.log("✅ Wallet created successfully");
    console.log("📍 Wallet address:", wallet.address);
    
    // Connect to Arbitrum and check balance
    const provider = new ethers.JsonRpcProvider("https://arb1.arbitrum.io/rpc");
    const walletWithProvider = wallet.connect(provider);
    
    const balance = await provider.getBalance(wallet.address);
    const balanceInEth = ethers.formatEther(balance);
    
    console.log("💰 Balance on Arbitrum:", balanceInEth, "ETH");
    
    if (parseFloat(balanceInEth) < 0.01) {
      console.log("⚠️  Low balance - you need at least 0.01 ETH for contract deployment");
      console.log("💡 Get ETH on Arbitrum:");
      console.log("   - Bridge from mainnet: https://bridge.arbitrum.io/");
      console.log("   - Buy directly on exchanges that support Arbitrum");
    } else {
      console.log("✅ Sufficient balance for deployment!");
      console.log("");
      console.log("🚀 Ready to deploy! Next steps:");
      console.log("1. Go to https://remix.ethereum.org");
      console.log("2. Copy contracts/WheelGameImproved.sol");
      console.log("3. Compile and deploy on Arbitrum network");
    }
    
  } catch (error) {
    console.error("❌ Error:", error.message);
    console.log("💡 This usually means the private key format is incorrect");
    console.log("💡 Make sure your private key:");
    console.log("   - Starts with '0x'");
    console.log("   - Is exactly 64 characters after '0x'");
    console.log("   - Has no spaces or extra characters");
  }
}

checkWallet().catch(console.error);