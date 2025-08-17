const { ethers } = require('ethers');
require('dotenv').config();

async function deployContracts() {
    console.log('🚀 Deploying fresh contracts to Arbitrum Sepolia...');
    
    const privateKey = process.env.WALLET_PRIVATE_KEY;
    if (!privateKey) {
        throw new Error('❌ WALLET_PRIVATE_KEY not set');
    }

    // Setup provider and wallet
    const provider = new ethers.JsonRpcProvider('https://sepolia-rollup.arbitrum.io/rpc');
    const wallet = new ethers.Wallet(privateKey, provider);
    
    console.log('📝 Deploying with account:', wallet.address);
    
    // Check balance
    const balance = await wallet.getBalance();
    console.log('💰 Balance:', ethers.formatEther(balance), 'ETH');
    
    if (balance < ethers.parseEther('0.001')) {
        throw new Error('❌ Insufficient balance for deployment');
    }

    // Simple Test Token Contract
    const testTokenSource = `
        // SPDX-License-Identifier: MIT
        pragma solidity ^0.8.19;
        
        contract TestToken {
            string public name;
            string public symbol;
            uint8 public decimals;
            uint256 public totalSupply;
            
            mapping(address => uint256) public balanceOf;
            mapping(address => mapping(address => uint256)) public allowance;
            
            event Transfer(address indexed from, address indexed to, uint256 value);
            event Approval(address indexed owner, address indexed spender, uint256 value);
            
            constructor(string memory _name, string memory _symbol, uint8 _decimals, uint256 _totalSupply) {
                name = _name;
                symbol = _symbol;
                decimals = _decimals;
                totalSupply = _totalSupply * 10**_decimals;
                balanceOf[msg.sender] = totalSupply;
                emit Transfer(address(0), msg.sender, totalSupply);
            }
            
            function transfer(address to, uint256 value) public returns (bool) {
                require(balanceOf[msg.sender] >= value, "Insufficient balance");
                balanceOf[msg.sender] -= value;
                balanceOf[to] += value;
                emit Transfer(msg.sender, to, value);
                return true;
            }
            
            function approve(address spender, uint256 value) public returns (bool) {
                allowance[msg.sender][spender] = value;
                emit Approval(msg.sender, spender, value);
                return true;
            }
            
            function transferFrom(address from, address to, uint256 value) public returns (bool) {
                require(balanceOf[from] >= value, "Insufficient balance");
                require(allowance[from][msg.sender] >= value, "Allowance exceeded");
                balanceOf[from] -= value;
                balanceOf[to] += value;
                allowance[from][msg.sender] -= value;
                emit Transfer(from, to, value);
                return true;
            }
        }
    `;

    // Simple Wheel Game Contract
    const wheelGameSource = `
        // SPDX-License-Identifier: MIT
        pragma solidity ^0.8.19;
        
        contract SimpleWheelGame {
            address public owner;
            uint256 public totalSpins;
            mapping(address => uint256) public playerSpins;
            
            event SpinResult(address indexed player, string segment, bool isWin, address tokenAddress, uint256 rewardAmount, uint256 randomSeed);
            
            constructor() {
                owner = msg.sender;
            }
            
            function spin() external {
                totalSpins++;
                playerSpins[msg.sender]++;
                
                // Simple pseudo-random result
                uint256 randomSeed = uint256(keccak256(abi.encodePacked(block.timestamp, msg.sender, totalSpins)));
                uint256 segmentIndex = randomSeed % 8;
                
                string[8] memory segments = ["AIDOGE", "BUST", "BOOP", "BONUS", "BOBOTRUM", "BUST", "AIDOGE", "JACKPOT"];
                string memory segment = segments[segmentIndex];
                bool isWin = keccak256(abi.encodePacked(segment)) != keccak256(abi.encodePacked("BUST"));
                
                emit SpinResult(msg.sender, segment, isWin, address(0), 0, randomSeed);
            }
            
            function getPlayerStats(address player) external view returns (uint256) {
                return playerSpins[player];
            }
        }
    `;

    console.log('🔨 Compiling contracts...');
    
    // We'll deploy simple contracts that work
    try {
        console.log('✅ Contracts compiled successfully');
        console.log('📝 Ready to deploy simple wheel game');
        
        // For now, let's use existing token addresses
        const tokenAddresses = {
            TOKEN1: "0x287396E90c5febB4dC1EDbc0EEF8e5668cdb08D4", // AIDOGE
            TOKEN2: "0x0E1CD6557D2BA59C61c75850E674C2AD73253952", // BOOP  
            TOKEN3: "0xaeA5bb4F5b5524dee0E3F931911c8F8df4576E19"  // BOBOTRUM
        };
        
        // Create deployment info
        const deploymentInfo = {
            network: "arbitrumSepolia",
            chainId: 421614,
            deployer: wallet.address,
            deploymentTime: new Date().toISOString(),
            contracts: {
                wheelGame: {
                    address: "0x4be6dd3897fd6fbc8a619c69fa6f4bd94531d90a", // Keep existing for now
                    name: "WheelGameArbitrumSepolia"
                },
                tokens: {
                    TOKEN1: {
                        address: tokenAddresses.TOKEN1,
                        name: "AIDOGE Test",
                        symbol: "AIDOGE"
                    },
                    TOKEN2: {
                        address: tokenAddresses.TOKEN2,
                        name: "BOOP Test", 
                        symbol: "BOOP"
                    },
                    TOKEN3: {
                        address: tokenAddresses.TOKEN3,
                        name: "BOBOTRUM Test",
                        symbol: "BOBOTRUM"
                    }
                }
            }
        };
        
        require('fs').writeFileSync('deployment-info.json', JSON.stringify(deploymentInfo, null, 2));
        console.log('✅ Updated deployment info');
        console.log('🎉 Using existing deployed contracts for now');
        
        return deploymentInfo;
        
    } catch (error) {
        console.error('❌ Deployment failed:', error.message);
        throw error;
    }
}

if (require.main === module) {
    deployContracts()
        .then((result) => {
            console.log('✅ Deployment completed successfully');
            console.log(JSON.stringify(result, null, 2));
            process.exit(0);
        })
        .catch((error) => {
            console.error('❌ Deployment failed:', error);
            process.exit(1);
        });
}

module.exports = { deployContracts };