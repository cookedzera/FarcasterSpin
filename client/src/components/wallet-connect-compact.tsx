import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { LinkIcon, User, Wallet, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface FarcasterUser {
  fid: number
  username?: string
  displayName?: string
  bio?: string
  pfpUrl?: string
  custody?: string
  verifications?: string[]
}

export function WalletConnectCompact() {
  const { isConnected, address } = useAccount()
  const { connect, connectors, isPending } = useConnect()
  const { disconnect } = useDisconnect()
  const [user, setUser] = useState<FarcasterUser | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const [showWallets, setShowWallets] = useState(false)

  // Get Farcaster user data when connected
  useEffect(() => {
    const fetchUserData = async () => {
      if (!isConnected) return

      try {
        setIsLoading(true)
        
        try {
          const response = await fetch('/api/farcaster/user-by-address', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ address })
          })
          
          if (response.ok) {
            const userData = await response.json()
            setUser(userData)
            localStorage.setItem('farcaster_user', JSON.stringify(userData))
          } else {
            const safeAddress = address || '0x0000000000000000000000000000000000000000';
            const fallbackUser = {
              fid: parseInt(safeAddress.slice(-6), 16) % 100000 + 1000,
              username: `user-${safeAddress.slice(-4)}`,
              displayName: `Wallet User`,
              bio: 'Wallet connected',
              pfpUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${safeAddress}`,
              custody: safeAddress,
              verifications: [safeAddress]
            }
            setUser(fallbackUser)
            localStorage.setItem('farcaster_user', JSON.stringify(fallbackUser))
          }
        } catch (apiError) {
          const fallbackUser = {
            fid: parseInt((address || '').slice(-6), 16) % 100000 + 1000,
            username: `user-${(address || '').slice(-4)}`,
            displayName: `Wallet User`,
            bio: 'Connected wallet',
            pfpUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${address || ''}`,
            custody: address || '',
            verifications: [address || '']
          }
          setUser(fallbackUser)
          localStorage.setItem('farcaster_user', JSON.stringify(fallbackUser))
        }
      } catch (error) {
        console.log('Failed to fetch Farcaster user data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserData()
  }, [isConnected, address])

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

  const handleDisconnect = () => {
    disconnect()
    setUser(null)
    setShowDetails(false)
  }

  if (isConnected && user) {
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
          {user.pfpUrl ? (
            <img 
              src={user.pfpUrl} 
              alt="Profile" 
              className="w-6 h-6 rounded-full"
            />
          ) : (
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
              <User className="w-3 h-3 text-white" />
            </div>
          )}
          <LinkIcon className="w-4 h-4 text-green-400" />
        </motion.button>

        {/* Dropdown details */}
        <AnimatePresence>
          {showDetails && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 top-12 z-50 p-4 rounded-2xl text-white min-w-64"
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
                {user.pfpUrl ? (
                  <img 
                    src={user.pfpUrl} 
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
                    {user.displayName || user.username || 'Wallet User'}
                  </p>
                  {user.username && (
                    <p className="text-xs text-white/60 truncate">@{user.username}</p>
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
        disabled={isPending || isLoading}
        className="flex items-center space-x-2 px-3 py-2 rounded-xl text-white/80 hover:text-white disabled:opacity-50 transition-all duration-200"
        style={{
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        data-testid="wallet-connect-button"
      >
        <Wallet className="w-4 h-4" />
        <span className="text-xs font-medium">
          {isPending || isLoading ? 'Connecting...' : 'Connect'}
        </span>
      </motion.button>

      {/* Wallet selection dropdown */}
      <AnimatePresence>
        {showWallets && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 top-12 z-50 p-3 rounded-2xl text-white min-w-48"
            style={{
              background: 'rgba(0, 0, 0, 0.9)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)'
            }}
            data-testid="wallet-selection-dropdown"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-sm">Choose Wallet</h3>
              <button
                onClick={() => setShowWallets(false)}
                className="text-white/60 hover:text-white p-1"
                data-testid="close-wallet-selection"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="space-y-2">
              {connectors.map((connector) => (
                <button
                  key={connector.id}
                  onClick={() => {
                    handleConnect(connector);
                    setShowWallets(false);
                  }}
                  disabled={isPending}
                  className="w-full flex items-center space-x-3 p-2 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-all duration-200 disabled:opacity-50"
                  data-testid={`connector-${connector.id}`}
                >
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                    <Wallet className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-sm font-medium">{connector.name}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}