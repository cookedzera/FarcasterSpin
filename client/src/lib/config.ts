// Client-side configuration for contract addresses and settings
// These should be set as VITE_ environment variables or hardcoded for development

export const CONTRACT_CONFIG = {
  // Wheel Game Contract Address on Arbitrum Sepolia
  // TODO: Replace with your deployed contract address to enable blockchain functionality
  WHEEL_GAME_ADDRESS: (import.meta.env.VITE_CONTRACT_ADDRESS || '0x') as `0x${string}`,
  
  // Token addresses on Arbitrum Sepolia testnet
  TOKEN_ADDRESSES: {
    AIDOGE: "0x287396E90c5febB4dC1EDbc0EEF8e5668cdb08D4" as `0x${string}`,
    BOOP: "0xaeA5bb4F5b5524dee0E3F931911c8F8df4576E19" as `0x${string}`,
    BOBOTRUM: "0x0E1CD6557D2BA59C61c75850E674C2AD73253952" as `0x${string}`,
  },
  
  // Network configuration
  CHAIN_ID: 421614, // Arbitrum Sepolia
} as const

// Function to check if contract is properly configured
export function isContractConfigured(): boolean {
  return CONTRACT_CONFIG.WHEEL_GAME_ADDRESS !== '0x' && CONTRACT_CONFIG.WHEEL_GAME_ADDRESS.length > 2
}