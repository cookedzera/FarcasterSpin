# Overview

ArbCasino is a web-based slot machine game built exclusively for the Arbitrum blockchain network (currently configured for Arbitrum Sepolia testnet). The application is a single-page Farcaster Mini App designed to run within a 390px width frame. Users can spin a virtual slot machine up to 5 times per day (resets at UTC midnight) to win AIDOGE, BOOP, and BOBOTRUM tokens, with a leaderboard system to track player performance and encourage engagement.

# User Preferences

Preferred communication style: Simple, everyday language.
Code preferences: Clean, production-ready code without testing/debug code.
Project focus: Fully Replit-compatible without external dependencies like tsx.
Navigation preferences: Fast, smooth transitions without loading animations between pages.
UI preferences: Token collection display with real balances instead of accumulated rewards on profile.

# Recent Changes
- **August 14, 2025**: Complete testnet token system implementation and testing ready
  - Resolved tsx dependency issue and installed all required packages 
  - Created PostgreSQL database and pushed schema successfully
  - Server running properly on port 5000 with Express and Vite integration
  - Successfully deployed test tokens to Arbitrum Sepolia testnet:
    - AIDOGE: 0x287396E90c5febB4dC1EDbc0EEF8e5668cdb08D4 (1M tokens funded)
    - BOOP: 0xaeA5bb4F5b5524dee0E3F931911c8F8df4576E19 (1M tokens funded)
    - BOBOTRUM: 0x0E1CD6557D2BA59C61c75850E674C2AD73253952 (1M tokens funded)
  - Fixed TypeScript errors and WalletConnect configuration issues
  - Farcaster wallet integration with fallback user creation working
  - Database configured with correct token addresses and reward amounts
  - Blockchain service ready for real testnet token transfers
  - Complete testnet token winning and claiming system operational
  - Enabled unlimited spins for testing (removed daily 5-spin limit)
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