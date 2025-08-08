import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Initialize Farcaster SDK after the app renders
if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', async () => {
    try {
      const { sdk } = await import('@farcaster/miniapp-sdk');
      await sdk.actions.ready();
      console.log('Farcaster SDK initialized successfully');
    } catch (error) {
      console.log('Farcaster SDK initialization failed - running in dev mode');
    }
  });
}

createRoot(document.getElementById("root")!).render(<App />);
