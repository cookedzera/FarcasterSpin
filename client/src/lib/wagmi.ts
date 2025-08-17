import { http, createConfig } from 'wagmi'
import { arbitrum, arbitrumSepolia } from 'wagmi/chains'
import { farcasterMiniApp as miniAppConnector } from '@farcaster/miniapp-wagmi-connector'
import { coinbaseWallet, walletConnect, injected } from 'wagmi/connectors'

// Simplified wallet config - remove WalletConnect to fix connection issues
export const config = createConfig({
  chains: [arbitrumSepolia, arbitrum], // Support both testnet and mainnet
  connectors: [
    miniAppConnector(), // Farcaster wallet integration
    injected(), // MetaMask and other injected wallets
    coinbaseWallet({
      appName: 'ArbCasino',
    }),
  ],
  transports: {
    [arbitrumSepolia.id]: http('https://sepolia-rollup.arbitrum.io/rpc'),
    [arbitrum.id]: http('https://arb1.arbitrum.io/rpc'),
  },
})

declare module 'wagmi' {
  interface Register {
    config: typeof config
  }
}