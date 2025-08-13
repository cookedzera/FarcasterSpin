import { http, createConfig } from 'wagmi'
import { base, arbitrum } from 'wagmi/chains'
import { farcasterMiniApp as miniAppConnector } from '@farcaster/miniapp-wagmi-connector'

export const config = createConfig({
  chains: [base, arbitrum],
  transports: {
    [base.id]: http(),
    [arbitrum.id]: http(),
  },
  connectors: [
    miniAppConnector()
  ]
})