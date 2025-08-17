import { useEffect, useState, useCallback } from "react";
import { AudioManager } from "@/lib/audio-manager";

// Global audio component that persists across all pages
export function GlobalAudio() {
  const [isMuted, setIsMuted] = useState(false);
  const [audioManager] = useState(() => AudioManager.getInstance());

  useEffect(() => {
    // Initialize audio on app start
    audioManager.init();
    setIsMuted(audioManager.getMuted());
  }, [audioManager]);

  const toggleMute = useCallback(() => {
    const newMutedState = audioManager.toggleMute();
    setIsMuted(newMutedState);
  }, [audioManager]);

  return (
    <>
      {/* Casino-styled mute button in top left - fixed position across all pages */}
      <button
        onClick={toggleMute}
        className={`fixed top-4 left-4 z-50 w-10 h-10 rounded-md transition-all duration-300 font-mono text-xs font-bold backdrop-blur-sm ${
          isMuted 
            ? 'bg-red-900/80 border-2 border-red-400 text-red-400 shadow-lg hover:bg-red-800/90 hover:shadow-red-400/20' 
            : 'bg-emerald-900/80 border-2 border-emerald-400 text-emerald-400 neon-border hover:bg-emerald-800/90'
        }`}
        style={{
          textShadow: isMuted 
            ? '0 0 8px rgba(248, 113, 113, 0.8)' 
            : '0 0 8px rgba(52, 211, 153, 0.8)',
          boxShadow: isMuted
            ? '0 0 15px rgba(248, 113, 113, 0.3), inset 0 0 8px rgba(248, 113, 113, 0.1)'
            : '0 0 15px rgba(52, 211, 153, 0.3), inset 0 0 8px rgba(52, 211, 153, 0.1)'
        }}
        data-testid="button-mute-music"
      >
        {isMuted ? '🔇' : '♪'}
      </button>
    </>
  );
}