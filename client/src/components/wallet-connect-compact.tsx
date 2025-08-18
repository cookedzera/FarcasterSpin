import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { User, Wallet, X, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useFarcaster } from '@/hooks/use-farcaster'

export function WalletConnectCompact() {
  const { isConnected, address } = useAccount()
  const { connect, connectors, isPending } = useConnect()
  const { disconnect } = useDisconnect()
  const { displayName, username, avatarUrl, isAuthenticated } = useFarcaster()
  const [showDetails, setShowDetails] = useState(false)
  const [showWallets, setShowWallets] = useState(false)
  const [showExternalWallets, setShowExternalWallets] = useState(false)

  const handleConnect = async (connector: any) => {
    try {
      // Add error handling for MetaMask detection
      if (connector.id === 'injected' && typeof window?.ethereum === 'undefined') {
        alert('Please install MetaMask to connect with this wallet option.')
        return
      }
      await connect({ connector })
      setShowWallets(false)
    } catch (error) {
      console.error('Failed to connect wallet:', error)
      // Show user-friendly error message
      alert('Failed to connect wallet. Please try again or use a different wallet.')
    }
  }

  const handleExternalClick = () => {
    setShowExternalWallets(!showExternalWallets)
  }

  const handleDisconnect = () => {
    disconnect()
    setShowDetails(false)
  }

  if (isConnected) {
    return (
      <div className="relative">
        {/* Compact connected state */}
        <motion.button
          onClick={() => setShowDetails(!showDetails)}
          className="flex items-center space-x-2 px-3 py-2 rounded-xl text-white/80 hover:text-white transition-all duration-200"
          style={{
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          data-testid="wallet-connected-button"
        >
          {avatarUrl ? (
            <img 
              src={avatarUrl} 
              alt="Profile" 
              className="w-6 h-6 rounded-full border border-purple-400/30"
            />
          ) : (
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
              <User className="w-3 h-3 text-white" />
            </div>
          )}
          <div className="flex flex-col items-start">
            <span className="text-xs font-medium text-white truncate max-w-24">
              {displayName || 'Wallet'}
            </span>
            <span className="text-xs text-white/50 truncate max-w-24">
              {address?.slice(0, 4)}...{address?.slice(-2)}
            </span>
          </div>
        </motion.button>

        {/* Dropdown details */}
        <AnimatePresence>
          {showDetails && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              className="absolute top-full right-0 mt-2 w-64 p-4 rounded-2xl text-white z-50"
              style={{
                background: 'rgba(0, 0, 0, 0.8)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)'
              }}
              data-testid="wallet-details-dropdown"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-sm">Wallet Connected</h3>
                <button
                  onClick={() => setShowDetails(false)}
                  className="text-white/60 hover:text-white p-1"
                  data-testid="close-wallet-details"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              <div className="flex items-center space-x-3 mb-3">
                {avatarUrl ? (
                  <img 
                    src={avatarUrl} 
                    alt="Profile" 
                    className="w-10 h-10 rounded-full border border-purple-400/30"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {displayName || 'Wallet User'}
                  </p>
                  {username && username !== displayName && (
                    <p className="text-xs text-white/60 truncate">@{username}</p>
                  )}
                  <p className="text-xs text-white/50 truncate">
                    {address?.slice(0, 6)}...{address?.slice(-4)}
                  </p>
                </div>
              </div>
              
              <Button 
                onClick={handleDisconnect}
                variant="outline"
                size="sm"
                className="w-full border-red-400/30 text-red-400 hover:bg-red-500/10 text-xs"
                data-testid="disconnect-wallet-button"
              >
                Disconnect
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )
  }

  // Compact connect button with wallet options
  return (
    <div className="relative">
      <motion.button
        onClick={() => setShowWallets(!showWallets)}
        disabled={isPending}
        className="flex items-center space-x-2 px-3 py-2 rounded-xl text-white/80 hover:text-white disabled:opacity-50 transition-all duration-200"
        style={{
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        data-testid="connect-wallet-button"
      >
        <Wallet className="w-4 h-4" />
        <span className="text-xs font-medium">
          {isPending ? 'Connecting...' : 'Connect'}
        </span>
      </motion.button>

      {/* Wallet options dropdown */}
      <AnimatePresence>
        {showWallets && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full right-0 mt-2 w-56 p-3 rounded-2xl text-white z-50"
            style={{
              background: 'rgba(0, 0, 0, 0.9)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)'
            }}
            data-testid="wallet-options-dropdown"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-sm">Choose Wallet</h3>
              <button
                onClick={() => setShowWallets(false)}
                className="text-white/60 hover:text-white p-1"
                data-testid="close-wallet-options"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="space-y-2">
              {/* Farcaster - Primary Option */}
              {connectors
                .filter(connector => connector.id === 'farcasterMiniApp')
                .map((connector) => (
                  <button
                    key={connector.id}
                    onClick={() => handleConnect(connector)}
                    disabled={isPending}
                    className="w-full flex items-center space-x-3 p-3 rounded-lg text-left hover:bg-white/10 disabled:opacity-50 transition-all duration-200 group"
                    data-testid={`wallet-option-${connector.id}`}
                  >
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                      </svg>
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-sm">Farcaster</div>
                      <div className="text-xs text-white/60">External Wallet</div>
                    </div>
                  </button>
                ))
              }

              {/* External Wallets - Secondary Option */}
              <button
                onClick={handleExternalClick}
                className="w-full flex items-center space-x-3 p-3 rounded-lg text-left hover:bg-white/10 transition-all duration-200 group"
                data-testid="external-wallets-toggle"
              >
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gray-600 to-gray-800 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Wallet className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1">
                  <div className="font-medium text-sm">External</div>
                  <div className="text-xs text-white/60">Other Wallets</div>
                </div>
                <ChevronRight 
                  className={`w-4 h-4 text-white/60 transition-transform duration-200 ${
                    showExternalWallets ? 'rotate-90' : ''
                  }`} 
                />
              </button>

              {/* External Wallet Options - Expanded */}
              <AnimatePresence>
                {showExternalWallets && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="ml-11 space-y-2 overflow-hidden"
                  >
                    {/* Auto-detected browser wallets */}
                    {connectors
                      .filter(connector => connector.id === 'injected')
                      .map((connector) => (
                        <button
                          key={connector.id}
                          onClick={() => handleConnect(connector)}
                          disabled={isPending}
                          className="w-full flex items-center space-x-3 p-3 rounded-lg text-left hover:bg-white/10 disabled:opacity-50 transition-all duration-200 group"
                          data-testid={`wallet-option-${connector.id}`}
                        >
                          <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center group-hover:scale-105 transition-transform">
                            <Wallet className="w-3 h-3 text-white" />
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-sm">Injected</div>
                            <div className="text-xs text-white/60">Browser Wallet</div>
                          </div>
                        </button>
                      ))
                    }
                    
                    {/* Coinbase Wallet (Base) */}
                    {connectors
                      .filter(connector => connector.id === 'coinbaseWalletSDK')
                      .map((connector) => (
                        <button
                          key={connector.id}
                          onClick={() => handleConnect(connector)}
                          disabled={isPending}
                          className="w-full flex items-center space-x-3 p-3 rounded-lg text-left hover:bg-white/10 disabled:opacity-50 transition-all duration-200 group"
                          data-testid={`wallet-option-${connector.id}`}
                        >
                          <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center group-hover:scale-105 transition-transform">
                            <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                            </svg>
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-sm">Coinbase Wallet</div>
                            <div className="text-xs text-white/60">External Wallet</div>
                          </div>
                        </button>
                      ))
                    }
                    
                    {/* Rainbow Wallet */}
                    <button
                      onClick={() => window.open('https://rainbow.me/', '_blank')}
                      className="w-full flex items-center space-x-3 p-3 rounded-lg text-left hover:bg-white/10 transition-all duration-200 group"
                      data-testid="wallet-option-rainbow"
                    >
                      <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                        <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 2L13.09 8.26L22 12L13.09 15.74L12 22L10.91 15.74L2 12L10.91 8.26L12 2Z"/>
                        </svg>
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-sm">Rainbow</div>
                        <div className="text-xs text-white/60">Install Wallet</div>
                      </div>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}