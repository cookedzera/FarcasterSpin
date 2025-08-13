import { createClient } from '@farcaster/quick-auth';
import { Errors } from '@farcaster/quick-auth';
import { NeynarAPIClient, Configuration } from "@neynar/nodejs-sdk";

// Initialize Quick Auth client
const client = createClient();

// Initialize Neynar API client (if API key is available)
let neynarClient: NeynarAPIClient | null = null;
try {
  if (process.env.NEYNAR_API_KEY) {
    const config = new Configuration({
      apiKey: process.env.NEYNAR_API_KEY,
    });
    neynarClient = new NeynarAPIClient(config);
  }
} catch (error) {
  console.log('Neynar API not configured - using fallback data');
}

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
      fid: parseInt(fid.toString()),
      username: `fc-user-${fid}`,
      displayName: `Farcaster User ${fid}`,
      bio: 'Authenticated Farcaster user',
      pfpUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${fid}`,
      custody: (payload as any).custody || '',
      verifications: (payload as any).verifications || []
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
    // Try to fetch from Neynar API first
    if (neynarClient) {
      try {
        const { users } = await neynarClient.fetchBulkUsers({ fids: [fid] });
        if (users && users.length > 0) {
          const user = users[0];
          return {
            fid: user.fid,
            username: user.username,
            displayName: user.display_name,
            bio: user.profile?.bio?.text || '',
            pfpUrl: user.pfp_url,
            custody: user.custody_address,
            verifications: user.verified_addresses?.eth_addresses || []
          };
        }
      } catch (neynarError) {
        console.log('Neynar API request failed:', neynarError);
      }
    }

    // Fallback to Farcaster Hub API (free alternative)
    try {
      const response = await fetch(`https://api.farcaster.xyz/v2/user-by-fid?fid=${fid}`);
      if (response.ok) {
        const data = await response.json();
        return {
          fid: data.fid,
          username: data.username,
          displayName: data.display_name,
          bio: data.profile?.bio?.text || '',
          pfpUrl: data.pfp_url,
          custody: data.custody_address,
          verifications: data.verifications || []
        };
      }
    } catch (hubError) {
      console.log('Farcaster Hub API failed:', hubError);
    }

    // Final fallback to mock data
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

// Fetch user by ethereum address
export async function getUserByAddress(address: string): Promise<FarcasterUser | null> {
  try {
    // Try Neynar API first
    if (neynarClient) {
      try {
        const response = await neynarClient.fetchBulkUsersByEthOrSolAddress({
          addresses: [address]
        });
        
        if (response && Object.keys(response).length > 0) {
          const addressData = response[address.toLowerCase()];
          if (addressData && addressData.length > 0) {
            const user = addressData[0];
            return {
              fid: user.fid,
              username: user.username,
              displayName: user.display_name,
              bio: user.profile?.bio?.text || '',
              pfpUrl: user.pfp_url,
              custody: user.custody_address,
              verifications: user.verified_addresses?.eth_addresses || []
            };
          }
        }
      } catch (neynarError) {
        console.log('Neynar address lookup failed:', neynarError);
      }
    }

    // Fallback: Try direct hub lookup
    try {
      const response = await fetch(`https://searchcaster.xyz/api/profiles?connected_address=${address}`);
      if (response.ok) {
        const data = await response.json();
        if (data && data.length > 0) {
          const user = data[0];
          return {
            fid: user.body?.fid || 0,
            username: user.body?.username || '',
            displayName: user.body?.displayName || '',
            bio: user.body?.bio || '',
            pfpUrl: user.body?.pfpUrl || '',
            custody: user.body?.address || address,
            verifications: [address]
          };
        }
      }
    } catch (searchError) {
      console.log('Searchcaster lookup failed:', searchError);
    }

    return null;
  } catch (error) {
    console.error('Error fetching user by address:', error);
    return null;
  }
}