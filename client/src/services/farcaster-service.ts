/**
 * Farcaster Integration Service
 * Handles Farcaster Mini App SDK integration and user data fetching via Pinata Hub API
 */

interface FarcasterUser {
  fid: number;
  displayName?: string;
  username?: string;
  avatarUrl?: string;
}

interface PinataUserData {
  data: {
    userDataBody: {
      type: number;
      value: string;
    };
  };
}

// Cache for user data to avoid repeated API calls
const userCache = new Map<number, FarcasterUser>();

// User data types from Farcaster protocol
const USER_DATA_TYPE_PFP = 1;
const USER_DATA_TYPE_DISPLAY = 2;
const USER_DATA_TYPE_BIO = 3;
const USER_DATA_TYPE_URL = 5;
const USER_DATA_TYPE_USERNAME = 6;

/**
 * Initialize Farcaster Mini App SDK and get user context
 */
export async function initializeFarcaster(): Promise<FarcasterUser | null> {
  try {
    // Check if we're in a Farcaster environment
    if (typeof window === 'undefined' || !window.farcasterMiniApp) {
      console.log('Not in Farcaster environment');
      return null;
    }

    // Initialize the SDK
    await window.farcasterMiniApp.init();
    
    // Get user context
    const context = window.farcasterMiniApp.context;
    if (!context?.user?.fid) {
      console.log('No Farcaster user found');
      return null;
    }

    const fid = context.user.fid;
    console.log('Farcaster user detected, FID:', fid);

    // Check cache first
    if (userCache.has(fid)) {
      console.log('Using cached user data for FID:', fid);
      return userCache.get(fid)!;
    }

    // Fetch user data from Pinata Hub API
    const userData = await fetchFarcasterUserData(fid);
    
    // Cache the result
    if (userData) {
      userCache.set(fid, userData);
    }

    return userData;

  } catch (error) {
    console.error('Error initializing Farcaster:', error);
    return null;
  }
}

/**
 * Fetch user data from Pinata Hub API
 */
async function fetchFarcasterUserData(fid: number): Promise<FarcasterUser | null> {
  try {
    console.log('Fetching Farcaster user data for FID:', fid);

    const user: FarcasterUser = { fid };

    // Fetch different types of user data
    const dataTypes = [
      USER_DATA_TYPE_DISPLAY,
      USER_DATA_TYPE_USERNAME,
      USER_DATA_TYPE_PFP
    ];

    for (const dataType of dataTypes) {
      try {
        const response = await fetch(
          `https://hub.pinata.cloud/v1/userDataByFid?fid=${fid}&user_data_type=${dataType}`
        );
        
        if (!response.ok) {
          console.warn(`Failed to fetch data type ${dataType} for FID ${fid}:`, response.status);
          continue;
        }

        const data: PinataUserData = await response.json();
        const value = data.data?.userDataBody?.value;

        if (value) {
          switch (dataType) {
            case USER_DATA_TYPE_DISPLAY:
              user.displayName = value;
              console.log('Found display name:', value);
              break;
            case USER_DATA_TYPE_USERNAME:
              user.username = value;
              console.log('Found username:', value);
              break;
            case USER_DATA_TYPE_PFP:
              user.avatarUrl = value;
              console.log('Found avatar URL:', value);
              break;
          }
        }

        // Small delay between requests to be respectful to the API
        await new Promise(resolve => setTimeout(resolve, 100));

      } catch (error) {
        console.warn(`Error fetching data type ${dataType} for FID ${fid}:`, error);
      }
    }

    console.log('Final user data:', user);
    return user;

  } catch (error) {
    console.error('Error fetching Farcaster user data:', error);
    return null;
  }
}

/**
 * Get cached user data by FID
 */
export function getCachedUserData(fid: number): FarcasterUser | null {
  return userCache.get(fid) || null;
}

/**
 * Clear user cache (useful for testing or logout)
 */
export function clearUserCache(): void {
  userCache.clear();
}

/**
 * Check if we're in a Farcaster environment
 */
export function isFarcasterEnvironment(): boolean {
  return typeof window !== 'undefined' && !!window.farcasterMiniApp;
}

// Global type declaration for Farcaster SDK
declare global {
  interface Window {
    farcasterMiniApp: {
      init(): Promise<void>;
      context: {
        user: {
          fid: number;
        };
      };
    };
  }
}