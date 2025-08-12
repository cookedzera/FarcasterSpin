# Overview

ArbCasino is a web-based slot machine game built exclusively for the Base blockchain network (currently configured for Base Sepolia testnet). The application is a single-page Farcaster Mini App designed to run within a 390px width frame. Users can spin a virtual slot machine up to 2 times per day (resets at UTC midnight) to win PEPE tokens, with a leaderboard system to track player performance and encourage engagement.

# User Preferences

Preferred communication style: Simple, everyday language.
Code preferences: Clean, production-ready code without testing/debug code.
Project focus: Fully Replit-compatible without external dependencies like tsx.
Navigation preferences: Fast, smooth transitions without loading animations between pages.
UI preferences: Token collection display with real balances instead of accumulated rewards on profile.

# Recent Changes
- **August 12, 2025**: Successfully migrated project from Replit agent to Replit environment
  - Fixed missing tsx dependency installation
  - Created PostgreSQL database and configured environment variables
  - Pushed database schema to create all required tables
  - Fixed TypeScript errors in routes.ts
  - Verified all API endpoints are working correctly
  - Project is now fully functional in Replit environment

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
- **Network Configuration**: Base Sepolia testnet for safe development and testing

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