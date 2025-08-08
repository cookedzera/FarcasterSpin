import { createClient } from '@farcaster/quick-auth';
import { Errors } from '@farcaster/quick-auth';

// Initialize Quick Auth client
const client = createClient();

// Interface for Farcaster user data
export interface FarcasterUser {
  fid: number;
  username?: string;
  displayName?: string;
  bio?: string;
  pfpUrl?: string;
  custody?: string;
  verifications?: string[];
}

// Verify JWT token and extract user data
export async function verifyFarcasterToken(token: string, domain: string): Promise<FarcasterUser> {
  try {
    const payload = await client.verifyJwt({
      token,
      domain,
    });

    // The payload.sub contains the user's FID
    const fid = payload.sub;

    // In a real implementation, you would fetch additional user data from:
    // 1. Farcaster Hub API
    // 2. Neynar API
    // 3. Your own database cache
    
    // For now, we'll return the basic verified data
    return {
      fid: parseInt(fid),
      username: `fc-user-${fid}`,
      displayName: `Farcaster User ${fid}`,
      bio: 'Authenticated Farcaster user',
      pfpUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${fid}`,
      custody: payload.custody as string,
      verifications: payload.verifications as string[] || []
    };
  } catch (error) {
    if (error instanceof Errors.InvalidTokenError) {
      throw new Error('Invalid Farcaster token');
    }
    throw error;
  }
}

// Middleware to authenticate Farcaster users
export function createFarcasterAuthMiddleware(domain: string) {
  return async (req: any, res: any, next: any) => {
    try {
      const authorization = req.headers.authorization;
      
      if (!authorization || !authorization.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Missing or invalid authorization header' });
      }

      const token = authorization.split(' ')[1];
      const user = await verifyFarcasterToken(token, domain);
      
      // Attach user data to request
      req.farcasterUser = user;
      next();
    } catch (error) {
      console.error('Farcaster auth error:', error);
      return res.status(401).json({ error: 'Invalid Farcaster authentication' });
    }
  };
}

// Helper function to resolve additional user data from external APIs
export async function resolveUserData(fid: number): Promise<Partial<FarcasterUser>> {
  try {
    // In a real implementation, you would call:
    // 1. Farcaster Hub API for profile data
    // 2. Neynar API for enhanced user information
    // 3. Your database for cached data

    // Example of fetching from Farcaster Hub API:
    /*
    const response = await fetch(`https://api.farcaster.xyz/v1/user?fid=${fid}`);
    if (response.ok) {
      const data = await response.json();
      return {
        username: data.username,
        displayName: data.displayName,
        bio: data.bio,
        pfpUrl: data.pfpUrl
      };
    }
    */

    // For now, return mock data
    return {
      username: `farcaster-${fid}`,
      displayName: `FC User ${fid}`,
      bio: 'Farcaster community member',
      pfpUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${fid}`
    };
  } catch (error) {
    console.error('Error resolving user data:', error);
    return {};
  }
}