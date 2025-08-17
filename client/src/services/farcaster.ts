/**
 * Official Farcaster Mini App SDK Integration
 * Using Method 1: Auto FID from Context (No Auth Required)
 * Official Docs: https://miniapps.farcaster.xyz/docs/sdk/context
 */

// Extend the window interface for the Farcaster SDK
declare global {
  interface Window {
    sdk?: {
      init: () => Promise<void>;
      context: {
        user: {
          fid: number;
          username?: string;
          displayName?: string;
          pfpUrl?: string;
          bio?: string;
          location?: {
            placeId: string;
            description: string;
          }
        }
      }
    }
  }
}

export interface FarcasterUser {
  fid: number;
  username?: string;
  displayName?: string;
  pfpUrl?: string;
  bio?: string;
}

/**
 * Initialize Farcaster SDK and get user context
 * Returns user data if in Farcaster environment, null otherwise
 */
export async function getFarcasterUser(): Promise<FarcasterUser | null> {
  try {
    console.log('🔍 Checking Farcaster SDK availability...');
    
    // Check if we're in a Farcaster environment
    if (typeof window === 'undefined' || !window.sdk) {
      console.log('❌ Not in Farcaster environment - SDK not available');
      return null;
    }

    console.log('✅ Farcaster SDK found, initializing...');
    
    // Initialize SDK using official method
    await window.sdk.init();
    console.log('✅ SDK initialized');

    // Get FID automatically from context - no auth required!
    const userFID = window.sdk.context.user.fid;
    const userName = window.sdk.context.user.displayName || window.sdk.context.user.username;
    
    if (!userFID) {
      console.log('❌ No user FID in context');
      return null;
    }

    const user = window.sdk.context.user;
    
    console.log('🎉 Farcaster user detected!');
    console.log('User FID:', userFID);
    console.log('User Name:', userName);
    
    return {
      fid: userFID,
      username: user.username,
      displayName: user.displayName,
      pfpUrl: user.pfpUrl,
      bio: user.bio
    };

  } catch (error) {
    console.error('💥 Error getting Farcaster user:', error);
    return null;
  }
}

/**
 * Check if we're running in a Farcaster Mini App environment
 */
export function isFarcasterEnvironment(): boolean {
  return typeof window !== 'undefined' && !!window.sdk;
}