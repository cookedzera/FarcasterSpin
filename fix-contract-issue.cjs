const { ethers } = require('ethers');
require('dotenv').config();

async function diagnoseContractIssue() {
    console.log('🔍 Diagnosing contract issue...');
    
    const privateKey = process.env.WALLET_PRIVATE_KEY;
    const contractAddress = '0x4be6dd3897fd6fbc8a619c69fa6f4bd94531d90a';
    
    if (!privateKey) {
        throw new Error('❌ WALLET_PRIVATE_KEY not set');
    }

    // Setup provider and wallet
    const provider = new ethers.JsonRpcProvider('https://sepolia-rollup.arbitrum.io/rpc');
    const wallet = new ethers.Wallet(privateKey, provider);
    
    console.log('📝 Checking contract with account:', wallet.address);
    console.log('🎯 Contract address:', contractAddress);
    
    // Check if contract exists
    const code = await provider.getCode(contractAddress);
    console.log('📋 Contract code length:', code.length);
    
    if (code === '0x') {
        console.log('❌ Contract not found at this address');
        return;
    }
    
    // Try to call a simple view function first
    const simpleABI = [
        "function DAILY_SPIN_LIMIT() external view returns (uint256)",
        "function playerStats(address) external view returns (uint256, uint256, uint256, uint256)",
        "function paused() external view returns (bool)"
    ];
    
    try {
        const contract = new ethers.Contract(contractAddress, simpleABI, provider);
        
        // Check if contract is paused
        const isPaused = await contract.paused();
        console.log('⏸️  Contract paused:', isPaused);
        
        // Check daily spin limit
        const dailyLimit = await contract.DAILY_SPIN_LIMIT();
        console.log('🎯 Daily spin limit:', dailyLimit.toString());
        
        // Check player stats
        const stats = await contract.playerStats(wallet.address);
        console.log('📊 Player stats:', {
            totalSpins: stats[0].toString(),
            totalWins: stats[1].toString(), 
            lastSpinDate: stats[2].toString(),
            dailySpins: stats[3].toString()
        });
        
        console.log('✅ Contract is accessible and responding');
        
    } catch (error) {
        console.error('❌ Contract call failed:', error.message);
    }
}

diagnoseContractIssue().catch(console.error);