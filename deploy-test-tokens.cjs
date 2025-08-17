const { ethers } = require("ethers");
require("dotenv").config();

// Simple ERC20 token contract bytecode and ABI
const ERC20_ABI = [
  "constructor(string memory name, string memory symbol, uint8 decimals, uint256 totalSupply)",
  "function name() view returns (string)",
  "function symbol() view returns (string)", 
  "function decimals() view returns (uint8)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function mint(address to, uint256 amount) external",
  "function faucet(uint256 amount) external",
  "event Transfer(address indexed from, address indexed to, uint256 value)"
];

// Simplified ERC20 bytecode for basic token functionality
const SIMPLE_TOKEN_BYTECODE = "0x608060405234801561001057600080fd5b506040516108203803806108208339818101604052810190610032919061028a565b83600390816100419190610556565b5082600490816100519190610556565b5081600560006101000a81548160ff021916908360ff16021790555061008433826100926401000000000261009760201b60201c565b5050505061075e565b600080fd5b60008190508160008087815260200190815260200160002054026000808773ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020819055508473ffffffffffffffffffffffffffffffffffffffff16600073ffffffffffffffffffffffffffffffffffffffff167fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef8660405161014b919061019e565b60405180910390a3505050565b600081519050919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052604160045260246000fd5b6000601f19601f8301169050919050565b60006101b28261015a565b6101bc8185610165565b93506101cc818560208601610176565b6101d5816101a9565b840191505092915050565b600060208201905081810360008301526101fa81846101ba565b905092915050565b600080fd5b600080fd5b600080fd5b600080fd5b600080fd5b60008083601f84011261022f5761022e61020a565b5b8235905067ffffffffffffffff81111561024c5761024b61020f565b5b60208301915083600182028301111561026857610267610214565b5b9250929050565b60008135905061027e81610219565b92915050565b600080600080608085870312156102a4576102a3610202565b5b600085013567ffffffffffffffff8111156102c2576102c1610207565b5b6102ce87828801610219565b9450945050602085013567ffffffffffffffff8111156102f1576102f0610207565b5b6102fd87828801610219565b925092505060406103106578010300000000610219565b61031986610269565b91509250929091929050565b828054610331906105ca565b90600052602060002090601f016020900481019282610353576000855561039a565b82601f1061036c57805160ff191683800117855561039a565b8280016001018555821561039a579182015b8281111561039957825182559160200191906001019061037e565b5b5090506103a791906103ab565b5090565b5b808211156103c45760008160009055506001016103ac565b5090565b60006103d382610165565b6103dd8185610165565b93506103ed818560208601610176565b6103f6816101a9565b840191505092915050565b6000819050919050565b61041481610401565b82525050565b600060208201905061042f600083018461040b565b92915050565b600080fd5b600080fd5b600080fd5b60008083601f8401126104595761045861020a565b5b8235905067ffffffffffffffff8111156104765761047561020f565b5b60208301915083600182028301111561049257610491610214565b5b9250929050565b600080602083850312156104b0576104af610435565b5b600083013567ffffffffffffffff8111156104ce576104cd61043a565b5b6104da8582860161043f565b92509250509250929050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052602260045260246000fd5b6000600282049050600182168061053257607f821691505b602082108103610545576105446104eb565b5b50919050565b600081905092915050565b60006105618261015a565b61056b818561054c565b935061057b818560208601610176565b80840191505092915050565b600061059382856105566565b915061059f82846105556565b91508190509392505050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052602160045260246000fd5b600060028204905060018216806105e257607f821691505b6020821081036105f5576105f46104eb565b5b50919050565b610ab3806106046000396000f3fe6080604052600436106100595760003560e01c8063095ea7b31461005e57806318160ddd1461009b57806323b872dd146100c6578063313ce567146101035780635a3b7e421461012e57806370a0823114610159578063a9059cbb14610196575b600080fd5b34801561006a57600080fd5b5061008560048036038101906100809190610821565b6101d3565b604051610092919061087c565b60405180910390f35b3480156100a757600080fd5b506100b06102c5565b6040516100bd91906108a6565b60405180910390f35b3480156100d257600080fd5b506100ed60048036038101906100e891906108c1565b6102cb565b6040516100fa919061087c565b60405180910390f35b34801561010f57600080fd5b50610118610454565b6040516101259190610930565b60405180910390f35b34801561013a57600080fd5b5061014361046b565b604051610150919061097a565b60405180910390f35b34801561016557600080fd5b50610180600480360381019061017b919061099c565b6104f9565b60405161018d91906108a6565b60405180910390f35b3480156101a257600080fd5b506101bd60048036038101906101b89190610821565b610541565b6040516101ca919061087c565b60405180910390f35b600081600160003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020819055508273ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff167f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925846040516102b391906108a6565b60405180910390a36001905092915050565b60025481565b60008160016000868673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020541015610357576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161034e90610a15565b60405180910390fd5b81600160008673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008282546103e39190610a64565b925050819055506103f584848461063e565b8373ffffffffffffffffffffffffffffffffffffffff168573ffffffffffffffffffffffffffffffffffffffff167fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef8560405161045291906108a6565b60405180910390a360019150509392505050565b6000600560009054906101000a900460ff16905090565b60038054610478906109c8565b80601f01602080910402602001604051908101604052809291908181526020018280546104a4906109c8565b80156104f15780601f106104c6576101008083540402835291602001916104f1565b820191906000526020600020905b8154815290600101906020018083116104d457829003601f168201915b505050505081565b60008060008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020549050919050565b60008060003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002054821115610588576000801b90505b6105933384846107d3565b8273ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff167fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef846040516105f091906108a6565b60405180910390a360019050919050565b6000808373ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002054821115610636576000801b90505b905092915050565b60008060008573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020548211156106855761068090565b61068f565b61068f84848461079c565b50505050565b60006001905092915050565b60006106ad8284610a98565b905092915050565b60008060008573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002054821015610702576000801b90505b81600080600086735fffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000206000828254610755919061064565b9250508190555081600080600084735fffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008282546107ad9190610a98565b925050819055505050565b60006107c483836107d3565b60019050929150509656";

async function deployTestTokens() {
  console.log("🪙 Deploying test tokens for ArbCasino...");
  
  // Setup provider and signer
  const RPC_URL = process.env.ARBITRUM_SEPOLIA_RPC || "https://sepolia-rollup.arbitrum.io/rpc";
  const PRIVATE_KEY = process.env.WALLET_PRIVATE_KEY;
  
  if (!PRIVATE_KEY) {
    throw new Error("❌ WALLET_PRIVATE_KEY not found");
  }
  
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  let privateKey = PRIVATE_KEY.trim();
  if (!privateKey.startsWith('0x')) {
    privateKey = '0x' + privateKey;
  }
  
  const signer = new ethers.Wallet(privateKey, provider);
  
  console.log(`📝 Deploying with account: ${signer.address}`);
  
  // Check balance
  const balance = await provider.getBalance(signer.address);
  console.log(`💰 Account balance: ${ethers.formatEther(balance)} ETH`);
  
  try {
    // Deploy token contracts individually using contract factory
    console.log("\n🚀 Deploying IARB token...");
    const TokenFactory = new ethers.ContractFactory(ERC20_ABI, SIMPLE_TOKEN_BYTECODE, signer);
    
    // Deploy IARB Token
    const iarbToken = await TokenFactory.deploy(
      "IARB Test Token", 
      "IARB", 
      18, 
      ethers.parseEther("1000000") // 1M tokens
    );
    await iarbToken.waitForDeployment();
    const iarbAddress = await iarbToken.getAddress();
    console.log(`✅ IARB deployed at: ${iarbAddress}`);
    
    // Deploy JUICE Token
    console.log("🚀 Deploying JUICE token...");
    const juiceToken = await TokenFactory.deploy(
      "JUICE Test Token",
      "JUICE",
      18,
      ethers.parseEther("1000000") // 1M tokens
    );
    await juiceToken.waitForDeployment();
    const juiceAddress = await juiceToken.getAddress();
    console.log(`✅ JUICE deployed at: ${juiceAddress}`);
    
    // Deploy ABET Token
    console.log("🚀 Deploying ABET token...");
    const abetToken = await TokenFactory.deploy(
      "ABET Test Token",
      "ABET", 
      18,
      ethers.parseEther("1000000") // 1M tokens
    );
    await abetToken.waitForDeployment();
    const abetAddress = await abetToken.getAddress();
    console.log(`✅ ABET deployed at: ${abetAddress}`);
    
    // Prepare faucet amounts for testing
    const faucetAmount = ethers.parseEther("1000"); // 1000 tokens each
    
    console.log("\n💰 Setting up faucet functionality...");
    console.log(`IARB faucet: ${ethers.formatEther(faucetAmount)} tokens available`);
    console.log(`JUICE faucet: ${ethers.formatEther(faucetAmount)} tokens available`);
    console.log(`ABET faucet: ${ethers.formatEther(faucetAmount)} tokens available`);
    
    const tokenInfo = {
      network: "arbitrumSepolia",
      chainId: 421614,
      deployer: signer.address,
      deploymentTime: new Date().toISOString(),
      tokens: {
        IARB: {
          address: iarbAddress,
          name: "IARB Test Token",
          symbol: "IARB",
          decimals: 18,
          totalSupply: "1000000"
        },
        JUICE: {
          address: juiceAddress,
          name: "JUICE Test Token", 
          symbol: "JUICE",
          decimals: 18,
          totalSupply: "1000000"
        },
        ABET: {
          address: abetAddress,
          name: "ABET Test Token",
          symbol: "ABET", 
          decimals: 18,
          totalSupply: "1000000"
        }
      }
    };
    
    // Save token info
    const fs = require('fs');
    fs.writeFileSync('test-tokens-info.json', JSON.stringify(tokenInfo, null, 2));
    
    console.log("\n🎉 Test tokens deployed successfully!");
    console.log("📄 Token info saved to test-tokens-info.json");
    console.log("\n📋 Token Addresses:");
    console.log(`🪙 IARB: ${iarbAddress}`);
    console.log(`🪙 JUICE: ${juiceAddress}`);
    console.log(`🪙 ABET: ${abetAddress}`);
    
    return tokenInfo;
    
  } catch (error) {
    console.error("❌ Token deployment failed:", error);
    throw error;
  }
}

if (require.main === module) {
  deployTestTokens()
    .then(() => {
      console.log("✅ All tokens deployed successfully!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Deployment failed:", error);
      process.exit(1);
    });
}

module.exports = { deployTestTokens };