const solc = require('solc');
const { ethers } = require('ethers');
const fs = require('fs');
require('dotenv').config();

async function compileAndDeploy() {
    console.log('🔨 Compiling and deploying ARBCasinoWheel...');
    
    // Read contract source
    const contractSource = fs.readFileSync('contracts/ARBCasinoWheel.sol', 'utf8');
    
    // Solidity compiler input
    const input = {
        language: 'Solidity',
        sources: {
            'ARBCasinoWheel.sol': {
                content: contractSource
            }
        },
        settings: {
            outputSelection: {
                '*': {
                    '*': ['*']
                }
            }
        }
    };
    
    console.log('Compiling contract...');
    const output = JSON.parse(solc.compile(JSON.stringify(input)));
    
    if (output.errors) {
        console.log('Compilation warnings/errors:');
        output.errors.forEach(error => console.log(error.formattedMessage));
    }
    
    const contract = output.contracts['ARBCasinoWheel.sol']['ARBCasinoWheel'];
    if (!contract) {
        throw new Error('Contract compilation failed');
    }
    
    console.log('✅ Contract compiled successfully');
    
    // Deploy
    const RPC_URL = "https://sepolia-rollup.arbitrum.io/rpc";
    const PRIVATE_KEY = process.env.WALLET_PRIVATE_KEY;
    
    if (!PRIVATE_KEY) {
        throw new Error('WALLET_PRIVATE_KEY not found');
    }
    
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
    
    console.log('Deploying with account:', wallet.address);
    
    const balance = await provider.getBalance(wallet.address);
    console.log('Balance:', ethers.formatEther(balance), 'ETH');
    
    const contractFactory = new ethers.ContractFactory(
        contract.abi,
        contract.evm.bytecode.object,
        wallet
    );
    
    console.log('🚀 Deploying contract...');
    const deployedContract = await contractFactory.deploy({
        gasLimit: 3000000,
        gasPrice: ethers.parseUnits('0.1', 'gwei')
    });
    
    console.log('⏳ Waiting for deployment...');
    await deployedContract.waitForDeployment();
    
    const contractAddress = await deployedContract.getAddress();
    console.log('✅ Contract deployed to:', contractAddress);
    
    // Test the contract
    console.log('🧪 Testing contract...');
    try {
        const testTx = await deployedContract.spin();
        const receipt = await testTx.wait();
        console.log('✅ Test spin successful! Hash:', receipt.hash);
        
        // Check total spins
        const totalSpins = await deployedContract.totalSpins();
        console.log('Total spins after test:', totalSpins.toString());
        
        // Parse the SpinResult event
        const spinEvent = receipt.logs.find(log => {
            try {
                const parsed = deployedContract.interface.parseLog(log);
                return parsed.name === "SpinResult";
            } catch {
                return false;
            }
        });
        
        if (spinEvent) {
            const parsed = deployedContract.interface.parseLog(spinEvent);
            console.log('Spin result:', {
                segment: parsed.args.segment,
                isWin: parsed.args.isWin,
                tokenAddress: parsed.args.tokenAddress,
                rewardAmount: ethers.formatEther(parsed.args.rewardAmount)
            });
        }
        
    } catch (testError) {
        console.log('⚠️  Test spin failed:', testError.message);
        console.log('But contract deployed successfully!');
    }
    
    // Update deployment info
    const deploymentInfo = {
        network: "arbitrumSepolia",
        chainId: 421614,
        deployer: wallet.address,
        deploymentTime: new Date().toISOString(),
        contracts: {
            wheelGame: {
                address: contractAddress,
                name: "ARBCasinoWheel",
                abi: contract.abi
            },
            tokens: {
                TOKEN1: {
                    address: "0x287396E90c5febB4dC1EDbc0EEF8e5668cdb08D4",
                    name: "AIDOGE Test",
                    symbol: "AIDOGE"
                },
                TOKEN2: {
                    address: "0x0E1CD6557D2BA59C61c75850E674C2AD73253952",
                    name: "BOOP Test",
                    symbol: "BOOP"
                },
                TOKEN3: {
                    address: "0xaeA5bb4F5b5524dee0E3F931911c8F8df4576E19",
                    name: "BOBOTRUM Test",
                    symbol: "BOBOTRUM"
                }
            }
        }
    };
    
    fs.writeFileSync('deployment-info.json', JSON.stringify(deploymentInfo, null, 2));
    console.log('✅ Updated deployment-info.json');
    
    console.log('\n🎉 SUCCESS! 🎉');
    console.log('🔥 NEW CONTRACT ADDRESS:', contractAddress);
    console.log('🔥 UPDATE YOUR DEPLOYED_CONTRACT_ADDRESS SECRET TO:', contractAddress);
    console.log('\nYour ARBCasino wheel game is now live on Arbitrum Sepolia!');
    
    return contractAddress;
}

compileAndDeploy()
    .then((address) => {
        console.log('✅ Deployment complete:', address);
        process.exit(0);
    })
    .catch((error) => {
        console.error('❌ Failed:', error);
        process.exit(1);
    });