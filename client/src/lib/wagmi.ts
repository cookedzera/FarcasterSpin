import { http, createConfig } from 'wagmi'
import { arbitrum, arbitrumSepolia } from 'wagmi/chains'
import { farcasterMiniApp as miniAppConnector } from '@farcaster/miniapp-wagmi-connector'
import { coinbaseWallet, walletConnect, injected } from 'wagmi/connectors'

// WalletConnect project ID - using a demo project ID for testing
const projectId = '2f05a4b1fc5791a6ab9f3a9b5c5a5b4f'

export const config = createConfig({
  chains: [arbitrumSepolia, arbitrum], // Support both testnet and mainnet
  connectors: [
    miniAppConnector(), // Farcaster wallet integration
    injected(), // MetaMask and other injected wallets
    coinbaseWallet({
      appName: 'ArbCasino',
      appLogoUrl: '/logo.png',
    }),
    // Commented out walletConnect to avoid configuration issues during development
    // walletConnect({
    //   projectId,
    //   metadata: {
    //     name: 'ArbCasino',
    //     description: 'Arbitrum Slot Machine Game',
    //     url: window.location.origin,
    //     icons: ['/logo.png']
    //   }
    // }),
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