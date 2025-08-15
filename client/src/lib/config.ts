// Client-side configuration - will be updated from API
let dynamicConfig = {
  contractAddress: '' as `0x${string}`,
  tokenAddresses: {
    TOKEN1: '' as `0x${string}`,
    TOKEN2: '' as `0x${string}`,
    TOKEN3: '' as `0x${string}`,
  },
  chainId: 421614
}

// Static fallback configuration
export const CONTRACT_CONFIG = {
  // Will be updated dynamically from API config endpoint
  WHEEL_GAME_ADDRESS: '' as `0x${string}`,
  
  // Testnet token addresses - will be updated from API
  TOKEN_ADDRESSES: {
    TOKEN1: "0x06d8c3f0e1cfb7e9d3f5B51D17DcD623AcC1B3b7" as `0x${string}`, // IARB
    TOKEN2: "0x1842887De1C7fDD59e3948A93CD41aad48a19cB2" as `0x${string}`, // JUICE
    TOKEN3: "0x0BA7A82d415500BebFA254502B655732Cd678D07" as `0x${string}`, // ABET
  },
  
  // Network configuration
  CHAIN_ID: 421614, // Arbitrum Sepolia
} as const

// Function to fetch and update configuration from API
export async function updateConfig() {
  try {
    const response = await fetch('/api/config')
    if (response.ok) {
      const config = await response.json()
      dynamicConfig = config
      // @ts-ignore - Update the contract config dynamically
      CONTRACT_CONFIG.WHEEL_GAME_ADDRESS = config.contractAddress
      CONTRACT_CONFIG.TOKEN_ADDRESSES.TOKEN1 = config.tokenAddresses.TOKEN1
      CONTRACT_CONFIG.TOKEN_ADDRESSES.TOKEN2 = config.tokenAddresses.TOKEN2
      CONTRACT_CONFIG.TOKEN_ADDRESSES.TOKEN3 = config.tokenAddresses.TOKEN3
      console.log('✅ Contract configuration updated from API:', config)
    }
  } catch (error) {
    console.warn('⚠️ Failed to fetch config from API, using fallback')
  }
}

// Function to check if contract is properly configured
export function isContractConfigured(): boolean {
  return CONTRACT_CONFIG.WHEEL_GAME_ADDRESS !== '' && CONTRACT_CONFIG.WHEEL_GAME_ADDRESS !== '0x'
}