import { ethers } from "ethers";

async function testConnection() {
  console.log("🔍 Testing blockchain connection without ENS...");
  
  if (!process.env.WALLET_PRIVATE_KEY) {
    console.log("❌ WALLET_PRIVATE_KEY not found");
    return;
  }
  
  try {
    // Clean up the private key
    let privateKey = process.env.WALLET_PRIVATE_KEY.trim();
    if (!privateKey.startsWith('0x')) {
      privateKey = '0x' + privateKey;
    }
    
    console.log("✅ Private key format is valid");
    
    // Test provider connection
    const provider = new ethers.JsonRpcProvider("https://sepolia-rollup.arbitrum.io/rpc");
    const network = await provider.getNetwork();
    console.log(`✅ Connected to network: ${network.name} (${network.chainId})`);
    
    // Test wallet creation WITHOUT connecting to provider initially
    const wallet = new ethers.Wallet(privateKey);
    console.log(`✅ Wallet created: ${wallet.address}`);
    
    // Connect wallet to provider
    const connectedWallet = wallet.connect(provider);
    console.log(`✅ Wallet connected to provider: ${connectedWallet.address}`);
    
    // Test balance check
    const balance = await provider.getBalance(wallet.address);
    console.log(`✅ Wallet balance: ${ethers.formatEther(balance)} ETH`);
    
    console.log("🎯 Connection test successful - no ENS issues detected");
    
  } catch (error) {
    console.error("❌ Connection test failed:", error.message);
    
    if (error.message.includes("ENS")) {
      console.log("💡 This is the ENS error causing the app to crash");
      console.log("💡 The issue might be in how ethers.js is being used");
    }
  }
}

testConnection().catch(console.error);