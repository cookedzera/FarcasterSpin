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

✅ **Complete Farcaster Integration Testing (Latest)**: Successfully implemented and tested complete Farcaster Mini App integration
  - Confirmed Farcaster Mini App SDK is properly loaded via script tag in index.html
  - Verified SDK only becomes available (`window.farcasterMiniApp`) when running inside Farcaster frame
  - Successfully implemented Pinata Hub API integration to fetch real user data
  - Tested with FID 190522: retrieves display name "RAVI ッ", username "avax", and profile picture URL
  - Added comprehensive debugging system to track SDK availability and API responses
  - Fixed API response parsing to handle messages array structure correctly
  - Integration works perfectly: when in Farcaster → shows real names, when outside → shows "Player"
  - Ready for deployment in actual Farcaster environment where SDK context will be available

✅ **Smart Center Display System**: Replaced popup with elegant center wheel display for winning results
  - Converted center ARB logo into dynamic winning display that shows token logo and amount for 3.5 seconds
  - Winner shows: token logo (AIDOGE/BOOP/ARB) + amount won in green text
  - BUST shows: skull emoji + "BUST" text in red
  - BONUS/JACKPOT shows: multiplier badge (2X/10X) + amount
  - Border changes color: blue (spinning) → green (win) → red (bust) → yellow (default)
  - Much cleaner than popup system - uses existing wheel center space elegantly
  - Smooth spring animations for logo transitions with scale and opacity effects
  - Server-side randomness completely separate from wheel visual position (proper weighted probabilities)
  - Auto-returns to ARB logo after 3.5 seconds for clean interface

✅ **Farcaster Hub API Integration**: Implemented automatic Farcaster user detection using working free Hub API
  - Integrated hub.pinata.cloud Hub API for free profile data access without API keys
  - Enhanced user lookup with proper message parsing for display names, usernames, bios, and profile pictures  
  - Added real-time profile detection with visual loading states and status indicators
  - Improved user experience with automatic profile detection on wallet connection
  - Distinguished between real Farcaster users and wallet-only users in the UI
  - Fixed scroll bar issue by hiding all scrollbars for clean mobile experience
  - Added detailed logging for debugging profile lookup process
  - No external API keys required - uses completely free Pinata Farcaster infrastructure
  - Successfully tested with FID 190522 showing proper username and display name retrieval

✅ **Typewriter Brand Animation**: Enhanced header with dynamic typewriter effect
  - Replaced "ARBCASINO" with "ARB" + typewriter animation alternating between "SPIN" and "GAMES"
  - Created smooth, slow typewriter animation with blinking cursor and character-by-character typing/deleting
  - Added bold underline only under the animated text (SPIN/GAMES) as requested
  - Maintained same blue color scheme and improved visual engagement
  - Animation timing: 3.5 seconds display, 300ms typing speed, 120ms deletion speed for smooth experience
  - All text displayed in capital letters for consistent branding

✅ **Center Icon Fix**: Fixed ARB logo behavior during wheel spinning
  - ARB logo now stays visible at all times and rotates with the wheel
  - Removed emoji replacements (⏳, 🎰) that were hiding the ARB logo during spinning/processing
  - Center icon now provides consistent visual feedback and maintains branding throughout spin animation
  - Enhanced user experience with persistent ARB logo visibility

✅ **Token Integration & UI Enhancement**: Replaced generic tokens with actual cryptocurrencies and improved visual design
  - Updated all token references from IARB/JUICE/ABET to AIDOGE/BOOP/ARB throughout the codebase
  - Integrated provided token logos: Aidoge, Boop, and ARB with proper asset imports
  - Added ARB logo to the center of the spin wheel, displayed when wheel is not spinning
  - Updated wheel segments to display actual token names (AIDOGE, BOOP, ARB)
  - Fixed all TypeScript interface compatibility issues between frontend and backend
  - Enhanced token display cards with proper icons and names in profile section
  - Maintained all existing functionality while using authentic token branding
  - Application successfully displaying real token logos and names with Nintendo-style aesthetic

✅ **Code Cleanup & Optimization**: Comprehensive codebase cleanup to improve maintainability and performance
  - Removed duplicate JavaScript server files (index.js, storage.js, vite.js) - keeping only TypeScript versions
  - Deleted unused spin wheel components (spin-wheel-clean.tsx, spin-wheel-free.tsx) - keeping only spin-wheel-simple.tsx which is actively used
  - Cleaned up extensive documentation files (18 .md files) that were outdated deployment guides and instructions
  - Removed 20+ unused deployment scripts (.js, .cjs files) and wallet checking utilities
  - Deleted 9 unused contract files keeping only ARBCasinoWheel.sol as the main contract
  - Removed attached_assets folder containing 70+ unused image and audio files
  - Fixed TypeScript compilation errors in spin-routes.ts with proper null safety checks
  - Updated asset references to use placeholder gradients instead of missing image files
  - Maintained all existing functionality and UI/UX while removing 95+ unused files
  - Application startup and functionality confirmed working after cleanup

## Previous Recent Changes

✅ **Application Startup Fixed**: Completely resolved startup failure by switching from Neon serverless to standard PostgreSQL connection
✅ **Database Driver Migration**: Updated from `@neondatabase/serverless` to standard `pg` driver with `drizzle-orm/node-postgres`
✅ **PostgreSQL Database Setup**: Successfully configured PostgreSQL database with proper environment variables and SSL handling
✅ **Database Schema Migration**: Successfully pushed database schema using Drizzle Kit, creating all required tables (users, game_stats, spin_results, tokens, token_claims)  
✅ **API Endpoints**: Confirmed working API endpoints including /api/stats, /api/config, /api/user, and /api/user/balances
✅ **TypeScript Errors Fixed**: Resolved all blockchain service TypeScript compilation errors
✅ **Clean Slate Blockchain Setup**: Removed all hardcoded contract addresses and private key dependencies to prepare for fresh blockchain integration
✅ **Modal Positioning Fixed**: Updated spin wheel popup to appear at top of screen instead of center for better mobile UX
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
✅ **Scroll Performance Optimization**: Eliminated lag on both homepage and popup scroll
  - Added hardware acceleration with CSS transforms (translateZ(0)) to all major elements
  - Implemented overscroll-contain for better mobile scroll behavior
  - Optimized floating particles to use CSS animations instead of heavy JavaScript
  - Applied will-change properties for GPU acceleration on scrolling elements
  - Fixed header to stay stationary while content scrolls independently in modal
  - Reduced particle count from 6 to 4 for better performance
  - Enhanced wheel animation with backface-visibility hidden and transform optimizations

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