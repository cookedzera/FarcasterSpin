const { ethers } = require('ethers');
const fs = require('fs');
require('dotenv').config();

async function deployARBCasino() {
    console.log('🎰 Deploying ARBCasinoWheel contract to Arbitrum Sepolia...');
    
    const RPC_URL = "https://sepolia-rollup.arbitrum.io/rpc";
    const PRIVATE_KEY = process.env.WALLET_PRIVATE_KEY;
    
    if (!PRIVATE_KEY) {
        throw new Error('WALLET_PRIVATE_KEY not found in environment');
    }

    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
    
    console.log('Deploying with account:', wallet.address);
    
    // Check balance
    const balance = await provider.getBalance(wallet.address);
    console.log('Balance:', ethers.formatEther(balance), 'ETH');
    
    if (balance < ethers.parseEther('0.001')) {
        throw new Error('Insufficient balance for deployment');
    }

    // Contract ABI from ChatGPT
    const abi = [
        {
            "inputs": [],
            "stateMutability": "nonpayable",
            "type": "constructor"
        },
        {
            "anonymous": false,
            "inputs": [
                { "indexed": true, "internalType": "address", "name": "player", "type": "address" },
                { "indexed": false, "internalType": "string", "name": "segment", "type": "string" },
                { "indexed": false, "internalType": "bool", "name": "isWin", "type": "bool" },
                { "indexed": false, "internalType": "address", "name": "tokenAddress", "type": "address" },
                { "indexed": false, "internalType": "uint256", "name": "rewardAmount", "type": "uint256" },
                { "indexed": false, "internalType": "uint256", "name": "randomSeed", "type": "uint256" }
            ],
            "name": "SpinResult",
            "type": "event"
        },
        {
            "inputs": [],
            "name": "spin",
            "outputs": [
                { "internalType": "string", "name": "segment", "type": "string" },
                { "internalType": "bool", "name": "isWin", "type": "bool" },
                { "internalType": "address", "name": "tokenAddress", "type": "address" },
                { "internalType": "uint256", "name": "rewardAmount", "type": "uint256" }
            ],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [
                { "internalType": "address", "name": "player", "type": "address" }
            ],
            "name": "getPlayerStats",
            "outputs": [
                { "internalType": "uint256", "name": "totalSpins_", "type": "uint256" },
                { "internalType": "uint256", "name": "totalWins_", "type": "uint256" },
                { "internalType": "uint256", "name": "lastSpinDate_", "type": "uint256" },
                { "internalType": "uint256", "name": "dailySpins_", "type": "uint256" }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "totalSpins",
            "outputs": [
                { "internalType": "uint256", "name": "", "type": "uint256" }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
                { "internalType": "address", "name": "", "type": "address" }
            ],
            "name": "playerSpins",
            "outputs": [
                { "internalType": "uint256", "name": "totalSpins", "type": "uint256" },
                { "internalType": "uint256", "name": "totalWins", "type": "uint256" },
                { "internalType": "uint256", "name": "lastSpinDate", "type": "uint256" },
                { "internalType": "uint256", "name": "dailySpins", "type": "uint256" }
            ],
            "stateMutability": "view",
            "type": "function"
        }
    ];

    // I need to compile the contract to get bytecode. Let me use solc directly
    try {
        // For now, let me try with a pre-compiled version or use online compilation
        console.log('Attempting to deploy using online compilation approach...');
        
        // Since we don't have solc installed, let me use the Remix approach
        console.log('Please compile the contract in Remix IDE and get the bytecode.');
        console.log('Contract source is available in: contracts/ARBCasinoWheel.sol');
        console.log('');
        console.log('STEP 1: Go to https://remix.ethereum.org/');
        console.log('STEP 2: Create new file ARBCasinoWheel.sol and paste the contract code');
        console.log('STEP 3: Compile the contract');
        console.log('STEP 4: Deploy using Injected Provider (MetaMask)');
        console.log('STEP 5: Connect to Arbitrum Sepolia network');
        console.log('STEP 6: Copy the deployed contract address');
        console.log('');
        console.log('Network Details:');
        console.log('- Name: Arbitrum Sepolia');
        console.log('- RPC: https://sepolia-rollup.arbitrum.io/rpc');
        console.log('- Chain ID: 421614');
        console.log('- Currency: ETH');
        console.log('');
        console.log('After deployment, update DEPLOYED_CONTRACT_ADDRESS secret with the new address.');
        
        return null;
        
    } catch (error) {
        console.error('Deployment preparation error:', error);
        throw error;
    }
}

deployARBCasino()
    .then((result) => {
        if (result) {
            console.log('✅ Contract deployed successfully:', result);
        } else {
            console.log('📋 Follow the Remix IDE instructions above to deploy');
        }
        process.exit(0);
    })
    .catch((error) => {
        console.error('❌ Deployment failed:', error);
        process.exit(1);
    });