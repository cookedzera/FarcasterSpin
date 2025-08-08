import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Initialize Farcaster Mini App SDK (conditionally)
if (typeof window !== 'undefined') {
  // Only initialize SDK if we're in a Farcaster environment
  try {
    // Dynamic import to prevent errors in non-Farcaster environments
    import('@farcaster/miniapp-sdk').then(({ sdk }) => {
      // Check if we're actually in a Farcaster context
      if (window.parent !== window || window.location !== window.parent.location) {
        sdk.actions.ready();
      }
    }).catch(() => {
      // SDK not available or we're not in a Farcaster context
      console.log('Farcaster SDK not available - running in standalone mode');
    });
  } catch (error) {
    console.log('Farcaster SDK initialization failed - running in standalone mode');
  }
}

createRoot(document.getElementById("root")!).render(<App />);
