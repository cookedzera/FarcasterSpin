# Overview

ArbCasino is a web-based Wheel of Fortune game designed as a Farcaster Mini App for the Arbitrum blockchain network (specifically Arbitrum Sepolia testnet). Users can spin a virtual wheel up to 5 times daily to win IARB, JUICE, and ABET tokens. The application features a complete smart contract integration with real token rewards, pending reward tracking, and a comprehensive claiming system.

# User Preferences

Preferred communication style: Simple, everyday language.
Code preferences: Clean, production-ready code without testing/debug code.
Project focus: Fully Replit-compatible without external dependencies like tsx.
Navigation preferences: Fast, smooth transitions without loading animations between pages.
UI preferences: Token collection display with real balances instead of accumulated rewards on profile.
Gas fee preference: Users should pay their own gas fees for both spinning and claiming transactions, not the project wallet.

## Recent Changes (August 17, 2025)

✅ **Database Connection Fixed**: Resolved startup issues by creating PostgreSQL database and adding dotenv configuration to load DATABASE_URL environment variable
✅ **PostgreSQL Database Setup**: Successfully configured PostgreSQL database with proper environment variables (DATABASE_URL, PGPORT, PGUSER, PGPASSWORD, PGDATABASE, PGHOST)
✅ **Database Schema Migration**: Successfully pushed database schema using Drizzle Kit, creating all required tables (users, game_stats, spin_results, tokens, token_claims)
✅ **API Endpoints**: Confirmed working API endpoints including /api/health, /api/stats, /api/config, and /api/user
✅ **TypeScript Errors Fixed**: Resolved all blockchain service TypeScript compilation errors
✅ **Clean Slate Blockchain Setup**: Removed all hardcoded contract addresses and private key dependencies to prepare for fresh blockchain integration
✅ **Wheel Mechanics Improvements**: Enhanced game mechanics for better user experience
  - Fixed arrow positioning to point correctly at center of wheel segments
  - Reduced BUST probability from 45% to 25% (15% + 10% instead of 25% + 20%)
  - Increased winning token probabilities: IARB (20%), JUICE (18%), ABET (20%), BONUS (12%)
  - Replaced popup winning animations with mobile-friendly overlay display on wheel
  - Added clear balance update notifications showing exact token amounts won
  - Improved mobile responsiveness for winning status display
✅ **Gas Fee Optimization**: Streamlined claiming process to reduce transaction costs
  - Removed individual token claim buttons to prevent multiple gas fees
  - Users must complete all 3 daily spins before claiming any rewards
  - Single "Claim All" button appears only after finishing all spins
  - Encourages users to accumulate rewards and claim in one transaction

## Previous Changes (January 17, 2025)

✅ **Contract Deployment with Daily Limits**: Successfully deployed ARBCasinoWheel contract to Arbitrum Sepolia: `0xa6555dfA38538cFd853051DafA2E33898E0D7C06`
✅ **User Gas Payment Implementation**: Frontend now calls contract directly from user's wallet instead of server wallet, ensuring users pay their own gas fees
✅ **Transaction Parsing**: Added `/api/spin-result` endpoint to parse user transaction receipts and extract spin results
✅ **Wagmi Integration**: Properly integrated user wallet transactions using wagmi `writeContract` with transaction confirmation handling
✅ **Gas Estimation Fix**: Fixed high gas estimation errors by adding proper daily spin limit enforcement in the smart contract (5 spins per day per user)

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript using Vite.
- **Routing**: Wouter.
- **UI Framework**: Tailwind CSS with shadcn/ui components.
- **Styling**: Casino-themed dark mode with neon effects and retro gaming aesthetics.
- **Animations**: Framer Motion for slot machine spin animations and visual feedback.
- **State Management**: TanStack Query (React Query) for server state management.
- **Form Handling**: React Hook Form with Zod validation.

## Backend Architecture
- **Runtime**: Node.js with Express.js server.
- **Language**: TypeScript with ES modules.
- **API Design**: RESTful endpoints for user management, spinning mechanics, and leaderboard.
- **Session Management**: In-memory storage with PostgreSQL migration.
- **Error Handling**: Centralized error handling.

## Database Schema
- **ORM**: Drizzle ORM with PostgreSQL dialect via Neon serverless.
- **Tables**: `users` (player profiles, Farcaster data, spin counts, wallet addresses, token balances), `tokens` (configurations), `game_stats` (daily aggregated statistics), `spin_results` (individual spin outcomes), `token_claims` (token claim requests).
- **Data Validation**: Zod schemas for type-safe operations.

## Game Logic
- **Spin Mechanics**: Smart contract-based wheel spinning with 8 segments (IARB, JUICE, ABET, BONUS, JACKPOT, BUST).
- **Rate Limiting**: 5 spins per user per day enforced by smart contract.
- **Reward System**: Real token rewards with contract-managed pending balances and individual token claiming.
- **Token Types**: IARB (1 token), JUICE (2 tokens), ABET (0.5 tokens) with BONUS (2x) and JACKPOT (10x) multipliers.
- **Claim System**: Users can claim accumulated rewards directly from smart contract to their wallet.
- **Leaderboard**: Real-time ranking based on total wins, implemented using contract events.

## Farcaster Integration
- **Mini App SDK**: @farcaster/miniapp-sdk for native Farcaster functionality.
- **Authentication**: Quick Auth with JWT verification.
- **User Profiles**: Utilizes Farcaster user data (FID, username, display name, profile pictures).
- **Backend Verification**: Server-side token validation.

## Development Environment
- **Hot Reload**: Vite dev server.
- **TypeScript**: Strict type checking.
- **Build Process**: Separate frontend (Vite) and backend (esbuild) pipelines.

## Mobile Optimization
- **Frame Constraints**: Optimized for 390px width Farcaster Mini App standard.
- **Responsive Design**: Mobile-first approach.

# External Dependencies

## Database
- **Neon Database**: Serverless PostgreSQL.
- **Drizzle Kit**: Database migrations and schema management.

## Security
- **Private Key Management**: Wallet private key stored securely in environment variables.
- **Network Configuration**: Arbitrum Sepolia testnet.

## UI Components
- **Radix UI**: Accessible, unstyled React components.
- **Class Variance Authority**: Type-safe utility for component variants.
- **Tailwind CSS**: Utility-first CSS framework.

## Development Tools
- **ESBuild**: Fast TypeScript compilation.
- **PostCSS**: CSS processing.

## Animation Libraries
- **Framer Motion**: Production-ready motion library for slot machine animations.

## Utility Libraries
- **date-fns**: Date manipulation.
- **clsx**: Conditional className utility.
- **nanoid**: Secure random ID generation.