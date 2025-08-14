import { createRoot } from "react-dom/client";
import { WagmiProvider } from 'wagmi';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from "./lib/queryClient";
import { config } from './lib/wagmi';
import App from "./App";
import TestApp from "./test-app";
import "./index.css";

// Initialize Farcaster SDK after the app renders - simplified for debugging
if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', async () => {
    try {
      console.log('Farcaster SDK initialization skipped for debugging');
    } catch (error) {
      console.log('Farcaster SDK initialization failed - running in dev mode');
    }
  });
}

// Render with error boundary for debugging
try {
  createRoot(document.getElementById("root")!).render(
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </WagmiProvider>
  );
  console.log('App rendered successfully');
} catch (error) {
  console.error('Error rendering app:', error);
  // Fallback to test app if main app fails
  createRoot(document.getElementById("root")!).render(<TestApp />);
}
