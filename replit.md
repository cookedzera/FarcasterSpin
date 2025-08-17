# Overview

ArbCasino is a web-based Wheel of Fortune game designed as a Farcaster Mini App for the Arbitrum blockchain network (specifically Arbitrum Sepolia testnet). Users can spin a virtual wheel up to 5 times daily to win IARB, JUICE, and ABET tokens. The application features a complete smart contract integration with real token rewards, pending reward tracking, and a comprehensive claiming system.

# User Preferences

Preferred communication style: Simple, everyday language.
Code preferences: Clean, production-ready code without testing/debug code.
Project focus: Fully Replit-compatible without external dependencies like tsx.
Navigation preferences: Fast, smooth transitions without loading animations between pages.
UI preferences: Token collection display with real balances instead of accumulated rewards on profile.
Gas fee preference: Users should pay their own gas fees for both spinning and claiming transactions, not the project wallet.

## Recent Changes (January 17, 2025)

✅ **Fresh Contract Deployment**: Successfully deployed new ARBCasinoWheel contract to Arbitrum Sepolia: `0x9D41F31a28BB06bEA083D88f707046B03fc04B36`
✅ **User Gas Payment Implementation**: Frontend now calls contract directly from user's wallet instead of server wallet, ensuring users pay their own gas fees
✅ **Transaction Parsing**: Added `/api/spin-result` endpoint to parse user transaction receipts and extract spin results
✅ **Wagmi Integration**: Properly integrated user wallet transactions using wagmi `writeContract` with transaction confirmation handling

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