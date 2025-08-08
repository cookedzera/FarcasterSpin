import { motion, AnimatePresence } from "framer-motion";
import { X, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { type SpinResult } from "@shared/schema";

interface WinPopupProps {
  isOpen: boolean;
  onClose: () => void;
  winResult: SpinResult | null;
  tokenInfo?: {
    name: string;
    symbol: string;
    logo: string;
    address: string;
  };
}

export default function WinPopup({ isOpen, onClose, winResult, tokenInfo }: WinPopupProps) {
  if (!winResult || !isOpen) return null;

  const readableAmount = Number(winResult.rewardAmount) / Math.pow(10, 18);
  const shortTxHash = winResult.transactionHash?.slice(0, 8) + "..." + winResult.transactionHash?.slice(-6);
  const baseScanUrl = `https://sepolia.basescan.org/tx/${winResult.transactionHash}`;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={onClose}
          />
          
          {/* Popup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="relative bg-card rounded-2xl border-2 border-green-400 p-6 max-w-sm w-full mx-4 shadow-2xl"
            style={{
              background: "linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%)",
              boxShadow: "0 0 30px rgba(34, 197, 94, 0.3), inset 0 0 30px rgba(34, 197, 94, 0.1)"
            }}
          >
            {/* Close button */}
            <Button
              onClick={onClose}
              variant="ghost"
              size="sm"
              className="absolute top-2 right-2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </Button>

            {/* Celebration header */}
            <div className="text-center mb-6">
              <motion.div
                className="text-6xl mb-2"
                animate={{ 
                  scale: [1, 1.2, 1],
                  rotate: [0, 10, -10, 0] 
                }}
                transition={{ 
                  duration: 1,
                  repeat: Infinity,
                  repeatDelay: 2
                }}
              >
                🎉 WINNER! 🎉
              </motion.div>
              <h2 className="font-pixel text-2xl text-green-400 mb-1 winning-glow">
                YOU WON!
              </h2>
              <p className="text-muted-foreground text-sm">
                Congratulations on your lucky spin!
              </p>
            </div>

            {/* Token info */}
            <div className="bg-background/50 rounded-xl p-4 mb-4 border border-border">
              <div className="flex items-center justify-center space-x-3 mb-3">
                {tokenInfo?.logo ? (
                  <img 
                    src={tokenInfo.logo} 
                    alt={tokenInfo.name}
                    className="w-8 h-8 rounded-full"
                    onError={(e) => {
                      const current = e.currentTarget as HTMLImageElement;
                      current.style.display = 'none';
                      const sibling = current.nextElementSibling as HTMLDivElement;
                      if (sibling) sibling.style.display = 'block';
                    }}
                  />
                ) : null}
                <div 
                  className="w-8 h-8 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm"
                  style={{ display: tokenInfo?.logo ? 'none' : 'block' }}
                >
                  🪙
                </div>
                <div className="text-center">
                  <div className="font-bold text-lg text-green-400">
                    {readableAmount.toFixed(6)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {tokenInfo?.symbol || 'TOKENS'}
                  </div>
                </div>
              </div>
              
              {tokenInfo?.name && (
                <div className="text-center text-xs text-muted-foreground">
                  {tokenInfo.name}
                </div>
              )}
            </div>

            {/* Transaction info */}
            {winResult.transactionHash && (
              <div className="bg-background/30 rounded-lg p-3 mb-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Transaction:</span>
                  <div className="flex items-center space-x-1">
                    <code className="bg-background px-2 py-1 rounded text-green-400">
                      {shortTxHash}
                    </code>
                    <Button
                      onClick={() => window.open(baseScanUrl, '_blank')}
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 text-primary hover:text-primary/80"
                      title="View on BaseScan"
                    >
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Success message */}
            <div className="text-center">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-sm text-green-400 mb-4"
              >
                ✅ Tokens sent to your wallet!
              </motion.div>
              
              <Button
                onClick={onClose}
                className="w-full bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white font-medium"
              >
                Continue Playing
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}