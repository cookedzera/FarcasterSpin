# Overview

ArbCasino is a web-based slot machine game built exclusively for the Arbitrum blockchain network (currently configured for Arbitrum Sepolia testnet). The application is a single-page Farcaster Mini App designed to run within a 390px width frame. Users can spin a virtual slot machine up to 5 times per day (resets at UTC midnight) to win AIDOGE, BOOP, and BOBOTRUM tokens, with a leaderboard system to track player performance and encourage engagement.

# User Preferences

Preferred communication style: Simple, everyday language.
Code preferences: Clean, production-ready code without testing/debug code.
Project focus: Fully Replit-compatible without external dependencies like tsx.
Navigation preferences: Fast, smooth transitions without loading animations between pages.
UI preferences: Token collection display with real balances instead of accumulated rewards on profile.
Gas fee preference: Users should pay their own gas fees for both spinning and claiming transactions, not the project wallet.

# Migration Guide: Replit Agent to Standard Replit

When importing projects from Replit Agent to standard Replit environment, follow this **exact checklist** to prevent common issues:

## Critical Migration Steps (Always Required)
1. **Install all packages immediately** - Even though package.json exists, node_modules don't transfer
   - Run the package installer for your language (nodejs, python, etc.)
   - This resolves "command not found" errors for tsx, tsx, and other dev dependencies
2. **Create database if needed** - PostgreSQL databases don't transfer from Agent environment
   - Use the database creation tool to provision a fresh database
   - Run `npm run db:push` to setup schema and tables
3. **Verify environment variables** - Some secrets may need reconfiguration
   - Check that DATABASE_URL is available after database creation
   - Blockchain secrets (WALLET_PRIVATE_KEY, DEPLOYED_CONTRACT_ADDRESS) need manual setup

## Common Import Issues & Solutions
- **"tsx: not found" error** → Install nodejs packages immediately after import
- **"DATABASE_URL must be set" error** → Create PostgreSQL database and push schema
- **Dependencies missing** → Package manager installation is always required for imports
- **Server won't start** → Check both package installation and database setup

## Why This Happens
Replit Agent environment packages and databases are isolated and don't transfer during import. The migration creates a clean slate that requires explicit setup of all dependencies and services.

# Recent Changes
- **August 15, 2025**: Successfully completed project migration from Replit Agent to standard Replit environment
  - Fixed tsx dependency installation issues completely
  - Created PostgreSQL database and pushed schema successfully  
  - Resolved browser buffer compatibility warnings for blockchain dependencies
  - Configured blockchain secrets (WALLET_PRIVATE_KEY, DEPLOYED_CONTRACT_ADDRESS)
  - Server running stable on port 5000 with all APIs functional
  - Migration completed with clean startup and blockchain services ready
- **August 15, 2025**: Successfully completed project migration from Replit Agent to standard Replit environment
  - Fixed tsx dependency installation issues completely
  - Created PostgreSQL database and pushed schema successfully  
  - Resolved browser buffer compatibility warnings for blockchain dependencies
  - Added global polyfill to handle Node.js modules in browser environment
  - Server running stable on port 5000 with all APIs functional
  - Configured blockchain secrets (WALLET_PRIVATE_KEY, DEPLOYED_CONTRACT_ADDRESS)
  - Enhanced wallet connection with MetaMask, Coinbase, WalletConnect, and Farcaster support
  - Fixed wallet connect button to show proper wallet selection dropdown
  - Created client-side Web3 hooks for gas popup functionality
  - Updated spin mechanism to use wagmi for proper blockchain transactions
  - Migration completed with clean startup and no errors
- **August 14, 2025**: Successfully completed project migration from Replit Agent to standard Replit environment
  - Fixed tsx dependency installation and PostgreSQL database setup
  - Database schema pushed successfully with all tables created
  - Server running properly on port 5000 with Express and Vite integration
  - Blockchain service configured with proper WALLET_PRIVATE_KEY and DEPLOYED_CONTRACT_ADDRESS secrets
  - All core APIs functional and ready for use
  - Migration completed successfully with full blockchain functionality enabled
- **August 14, 2025**: Implemented user-pays-gas system for proper decentralized casino experience
  - Created useWheelGame hook for client-side contract interactions
  - Users now pay their own gas fees for both spinning and claiming transactions
  - Removed server-side gas payment system to make it a proper Web3 dApp
  - Integrated wagmi hooks for wallet transactions with gas fee popups
  - Updated UI with "Pay Gas" indicators to set proper expectations
  - Fixed TypeScript BigInt literal errors for ES2020 compatibility
  - Complete user-controlled transaction system ready for testing
- **August 13, 2025**: Successfully completed project migration from Replit Agent to standard Replit environment
  - Fixed tsx dependency installation and PostgreSQL database setup
  - Database schema pushed successfully with all tables created
  - Server running properly on port 5000 with Express and Vite integration
  - All core APIs functional and ready for use
- **August 13, 2025**: Successfully completed project migration from Replit Agent to standard Replit environment
  - Fixed tsx dependency installation and PostgreSQL database setup
  - Updated Farcaster authentication to handle JWT payload properly 
  - Enhanced wagmi configuration to support both Base and Arbitrum networks
  - Verified contract readiness for Arbitrum mainnet deployment with real token addresses
  - Confirmed wallet address capture through Farcaster miniapp connector
  - All APIs working correctly, project fully functional and ready for deployment
- **August 13, 2025**: Contract events-based leaderboard system implemented with improved security
  - Enhanced WheelGame.sol contract with Remix IDE security suggestions: SafeERC20, immutable variables, admin event emissions
  - Implemented Option 1 leaderboard system using contract events (SpinResult, RewardsClaimed) from Arbitrum mainnet
  - Created comprehensive leaderboard service that syncs real player data from blockchain events
  - Added leaderboard API routes: /api/leaderboard, /api/leaderboard/weekly, /api/player/:address/rank
  - Built responsive leaderboard UI with tabs for Most Wins, Most Spins, Biggest Rewards, and Weekly Champions
  - Added leaderboard navigation button to main app navigation bar with trophy icon and golden styling
  - Leaderboard displays authentic on-chain player statistics, rankings, and achievement tracking
- **August 13, 2025**: Successfully completed project migration and enhanced wheel mechanics
  - Completed migration from Replit Agent to standard Replit environment
  - Fixed missing tsx dependency installation and PostgreSQL database setup
  - Enhanced spin wheel to behave like proper roulette wheel - only segments rotate while arrow stays fixed
  - Improved wheel UI with premium styling: gradient arrow, drop shadows, golden rings, and depth effects
  - Fixed center "SPIN" text to remain stationary instead of rotating with wheel
  - Added professional visual enhancements: outer rings, gradient overlays, and shadow effects
  - All APIs working correctly, project fully functional and ready for deployment
- **August 12, 2025**: Initial development work
  - Fixed reward type collision by assigning unique IDs to wheelSegments array 
  - Resolved black screen issue and created clean SVG spin wheel component
  - Cleaned up old unused code and optimized component structure

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript using Vite as the build tool
- **Routing**: Wouter for lightweight client-side routing
- **UI Framework**: Tailwind CSS with shadcn/ui components for consistent design
- **Styling**: Custom casino-themed dark mode with neon effects and retro gaming aesthetics
- **Animations**: Framer Motion for slot machine spin animations and visual feedback
- **State Management**: TanStack Query (React Query) for server state management
- **Form Handling**: React Hook Form with Zod validation schemas

## Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Language**: TypeScript with ES modules
- **API Design**: RESTful endpoints for user management, spinning mechanics, and leaderboard
- **Session Management**: In-memory storage with planned PostgreSQL migration
- **Request Logging**: Custom middleware for API request/response logging
- **Error Handling**: Centralized error handling with proper HTTP status codes

## Database Schema
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Tables**:
  - `users`: Player profiles with spin counts, wins, and wallet addresses
  - `game_stats`: Daily aggregated statistics for total claims and contract transactions
  - `spin_results`: Individual spin outcomes with symbols, wins, and rewards
- **Data Validation**: Zod schemas for type-safe database operations

## Game Logic
- **Spin Mechanics**: Random symbol generation with configurable win conditions
- **Rate Limiting**: 5 spins per user per day with UTC midnight reset
- **Reward System**: Real token rewards (TOKEN1, TOKEN2, TOKEN3) for winning combinations
- **Wallet Integration**: Automatic token distribution via Arbitrum network
- **Leaderboard**: Real-time ranking based on total wins

## Farcaster Integration
- **Mini App SDK**: Integrated @farcaster/miniapp-sdk for native Farcaster functionality
- **Authentication**: Quick Auth implementation with JWT token verification
- **User Profiles**: Real Farcaster user data (FID, username, display name, profile pictures)
- **Backend Verification**: Server-side token validation and user data resolution
- **Database Schema**: Extended user table with Farcaster-specific fields
- **Connection Management**: Connect/disconnect functionality with persistent storage

## Development Environment
- **Hot Reload**: Vite dev server with custom Replit integration
- **TypeScript**: Strict type checking across frontend, backend, and shared schemas
- **Path Aliases**: Configured for clean imports (@/, @shared/, @assets/)
- **Build Process**: Separate frontend (Vite) and backend (esbuild) build pipelines

## Mobile Optimization
- **Frame Constraints**: Optimized for 390px width Farcaster Mini App standard
- **Responsive Design**: Mobile-first approach with touch-friendly interactions
- **Performance**: Lightweight bundle with minimal dependencies for fast loading

# External Dependencies

## Database
- **Neon Database**: Serverless PostgreSQL with connection pooling via @neondatabase/serverless
- **Drizzle Kit**: Database migrations and schema management
- **Connection**: Environment-based DATABASE_URL configuration

## Security
- **Private Key Management**: Wallet private key stored securely in WALLET_PRIVATE_KEY environment variable
- **Network Configuration**: Arbitrum Sepolia testnet for safe development and testing

## UI Components
- **Radix UI**: Comprehensive set of accessible, unstyled React components for complex UI patterns
- **Class Variance Authority**: Type-safe utility for managing component variants
- **Tailwind CSS**: Utility-first CSS framework with custom casino theme configuration

## Development Tools
- **Replit Integration**: Custom Vite plugins for development environment integration
- **ESBuild**: Fast TypeScript compilation for production builds
- **PostCSS**: CSS processing with Tailwind and Autoprefixer

## Animation Libraries
- **Framer Motion**: Production-ready motion library for slot machine animations
- **React Spring**: Additional animation utilities for enhanced visual effects

## Utility Libraries
- **date-fns**: Date manipulation for countdown timers and UTC reset logic
- **clsx**: Conditional className utility for dynamic styling
- **nanoid**: Secure random ID generation for entities