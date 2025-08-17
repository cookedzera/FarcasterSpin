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

interface PinataResponse {
  messages: Array<{
    data: {
      userDataBody: {
        type: string;
        value: string;
      };
    };
  }>;
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
    console.log('🔍 Checking Farcaster environment...');
    console.log('Window object exists:', typeof window !== 'undefined');
    console.log('farcasterMiniApp exists:', typeof window !== 'undefined' && !!window.farcasterMiniApp);
    
    // Check if we're in a Farcaster environment
    if (typeof window === 'undefined') {
      console.log('❌ No window object (server-side)');
      return null;
    }

    if (!window.farcasterMiniApp) {
      console.log('❌ farcasterMiniApp not found on window');
      console.log('Available properties:', Object.keys(window));
      return null;
    }

    console.log('✅ Farcaster SDK found, initializing...');
    
    // Initialize the SDK
    await window.farcasterMiniApp.init();
    console.log('✅ SDK initialized successfully');
    
    // Get user context
    const context = window.farcasterMiniApp.context;
    console.log('Context object:', context);
    
    if (!context) {
      console.log('❌ No context available');
      return null;
    }
    
    if (!context.user) {
      console.log('❌ No user in context');
      return null;
    }
    
    console.log('User object:', context.user);
    
    if (!context.user.fid) {
      console.log('❌ No FID in user context');
      return null;
    }

    const fid = context.user.fid;
    console.log('🎉 Farcaster user detected! FID:', fid);

    // Check cache first
    if (userCache.has(fid)) {
      console.log('💾 Using cached user data for FID:', fid);
      return userCache.get(fid)!;
    }

    // Fetch user data from Pinata Hub API
    console.log('🌐 Fetching user data from Pinata Hub API...');
    const userData = await fetchFarcasterUserData(fid);
    
    // Cache the result
    if (userData) {
      userCache.set(fid, userData);
      console.log('💾 Cached user data for FID:', fid);
    }

    return userData;

  } catch (error) {
    console.error('💥 Error initializing Farcaster:', error);
    console.error('Error details:', {
      name: error?.name,
      message: error?.message,
      stack: error?.stack
    });
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

    // Fetch all user data at once without specifying data type
    try {
      const response = await fetch(
        `https://hub.pinata.cloud/v1/userDataByFid?fid=${fid}`
      );
      
      if (!response.ok) {
        console.warn(`Failed to fetch user data for FID ${fid}:`, response.status);
        return user;
      }

      const data: PinataResponse = await response.json();
      
      if (!data.messages || !Array.isArray(data.messages)) {
        console.warn('No messages found in response');
        return user;
      }

      // Parse all user data from messages
      data.messages.forEach(message => {
        const userDataBody = message.data?.userDataBody;
        if (!userDataBody) return;

        const { type, value } = userDataBody;
        
        switch (type) {
          case 'USER_DATA_TYPE_DISPLAY':
            user.displayName = value;
            console.log('Found display name:', value);
            break;
          case 'USER_DATA_TYPE_USERNAME':
            user.username = value;
            console.log('Found username:', value);
            break;
          case 'USER_DATA_TYPE_PFP':
            user.avatarUrl = value;
            console.log('Found avatar URL:', value);
            break;
          case 'USER_DATA_TYPE_BIO':
            // Store bio but don't log it as it's not currently used
            break;
        }
      });

    } catch (error) {
      console.warn(`Error fetching user data for FID ${fid}:`, error);
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
  const result = typeof window !== 'undefined' && !!window.farcasterMiniApp;
  console.log('🔍 isFarcasterEnvironment check:', result);
  return result;
}

/**
 * Test function to manually check SDK availability
 */
export function testFarcasterSDK(): void {
  console.log('🧪 Testing Farcaster SDK availability...');
  console.log('Window exists:', typeof window !== 'undefined');
  
  if (typeof window !== 'undefined') {
    console.log('Window keys:', Object.keys(window).filter(key => key.toLowerCase().includes('farcaster')));
    console.log('farcasterMiniApp exists:', !!window.farcasterMiniApp);
    
    if (window.farcasterMiniApp) {
      console.log('SDK object:', window.farcasterMiniApp);
      console.log('SDK methods:', Object.keys(window.farcasterMiniApp));
    }
  }
}

/**
 * Test function to simulate Farcaster environment with a specific FID
 * This helps us test the Pinata integration without being in Farcaster
 */
export async function testWithFID(testFid: number): Promise<FarcasterUser | null> {
  console.log(`🧪 Testing with FID: ${testFid}`);
  
  try {
    // Check cache first
    if (userCache.has(testFid)) {
      console.log('💾 Using cached user data for FID:', testFid);
      return userCache.get(testFid)!;
    }

    // Fetch user data from Pinata Hub API
    console.log('🌐 Testing Pinata Hub API with FID:', testFid);
    const userData = await fetchFarcasterUserData(testFid);
    
    // Cache the result
    if (userData) {
      userCache.set(testFid, userData);
      console.log('💾 Cached test user data for FID:', testFid);
      console.log('✅ Test successful! User data:', {
        fid: userData.fid,
        displayName: userData.displayName,
        username: userData.username,
        avatarUrl: userData.avatarUrl ? 'Present' : 'Missing'
      });
    }

    return userData;
  } catch (error) {
    console.error('💥 Error testing with FID:', testFid, error);
    return null;
  }
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