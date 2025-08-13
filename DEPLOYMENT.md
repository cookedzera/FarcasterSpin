# ArbCasino Deployment Guide

## Quick Deploy on Replit

1. **Import Project**
   - Upload the zip file to Replit
   - Or fork this repository

2. **Configure Environment**
   - Add your PostgreSQL database URL
   - Add your Arbitrum wallet private key for token distribution
   - Ensure all dependencies are installed

3. **Deploy**
   - Click the "Deploy" button in Replit
   - Your app will be available at `your-app-name.replit.app`

## Manual Deployment

### Prerequisites
- Node.js 18+
- PostgreSQL database
- Arbitrum wallet with tokens for distribution

### Environment Variables
```bash
DATABASE_URL=postgresql://user:password@host:port/database
PRIVATE_KEY=0xyour_private_key_here
```

### Build Commands
```bash
# Install dependencies
npm install

# Build frontend
npm run build

# Start production server
npm start
```

### Database Setup
The app will automatically create tables on first run using Drizzle ORM migrations.

### Contract Deployment & Configuration

**Security Improvements Implemented:**
- ✅ Secure pseudo-randomness using multiple entropy sources
- ✅ Timelock protection for sensitive admin operations (24-hour delay)
- ✅ Gas-optimized reward claiming with batch support
- ✅ Enhanced input validation and safety checks
- ✅ Immutable token addresses for gas efficiency

**Contract Options:**
1. **WheelGame.sol** - Original version (functional but basic randomness)
2. **WheelGameImproved.sol** - Enhanced version with security improvements

**Token Configuration:**
1. Deploy contract to Arbitrum mainnet using Hardhat
2. Fund contract with tokens:
   - AIDOGE: 0x09e18590e8f76b6cf471b3cd75fe1a1a9d2b2c2b
   - BOOP: 0x13a7dedb7169a17be92b0e3c7c2315b46f4772b3  
   - BOBOTRUM: 0x60460971a3D79ef265dfafA393ffBCe97d91E8B8
3. Update blockchain service with deployed contract address
4. Test all functions before going live

### Farcaster Integration
- Frame size: 390px width
- Add to Farcaster app directory
- Configure frame metadata in `index.html`

## Production Checklist

- [ ] Database connected and migrated
- [ ] Private key configured securely
- [ ] Tokens added and activated in admin panel
- [ ] SSL certificate enabled
- [ ] Domain configured (optional)
- [ ] Frame metadata verified
- [ ] Test spins working correctly
- [ ] Token transfers functioning
- [ ] Leaderboard updating
- [ ] Admin panel accessible

## Monitoring

Monitor these endpoints for health:
- `/api/stats` - Game statistics
- `/api/leaderboard` - Active players
- `/api/tokens` - Token configuration

## Support

For deployment issues or questions, check:
1. Server logs for errors
2. Database connectivity
3. Arbitrum network status
4. Token contract addresses