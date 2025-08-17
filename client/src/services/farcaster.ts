/**
 * Official Farcaster Mini App SDK Integration
 * Using modern ES modules approach instead of script tag
 */

import { sdk as farcasterSDK } from '@farcaster/miniapp-sdk';

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
    
    // Check if we're in a Farcaster environment by trying to access the SDK
    if (!farcasterSDK) {
      console.log('❌ Not in Farcaster environment - SDK not available');
      return null;
    }

    console.log('✅ Farcaster SDK found, initializing...');
    
    // Wait for SDK to be ready with timeout
    const readyPromise = farcasterSDK.actions.ready();
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('SDK ready timeout')), 5000)
    );
    
    await Promise.race([readyPromise, timeoutPromise]);
    console.log('✅ SDK initialized and ready');

    // Get user context with timeout
    const contextPromise = farcasterSDK.context;
    const contextTimeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Context timeout')), 3000)
    );
    
    const context = await Promise.race([contextPromise, contextTimeoutPromise]) as any;
    console.log('📋 Context received:', context);
    
    if (!context || !context.user) {
      console.log('❌ No user context available');
      return null;
    }

    const user = context.user;
    const userFID = user.fid;
    const userName = user.displayName || user.username;
    
    console.log('👤 User data from context:', { fid: userFID, username: user.username, displayName: user.displayName });
    
    if (!userFID) {
      console.log('❌ No user FID in context');
      return null;
    }
    
    console.log('🎉 Farcaster user detected!');
    console.log('User FID:', userFID);
    console.log('User Name:', userName);
    
    // Get additional user data from backend Hub API for better profile info
    let additionalData: any = {};
    try {
      const response = await fetch(`/api/farcaster/user/${userFID}`);
      if (response.ok) {
        additionalData = await response.json();
      }
    } catch (error) {
      console.log('Could not fetch additional user data:', error);
    }
    
    return {
      fid: userFID,
      username: user.username || additionalData.username,
      displayName: user.displayName || additionalData.displayName,
      pfpUrl: user.pfpUrl || additionalData.pfpUrl,
      bio: (user as any).bio || additionalData.bio || ''
    };

  } catch (error) {
    console.error('💥 Error getting Farcaster user:', error);
    console.log('📝 This is expected when not running inside a Farcaster frame');
    return null;
  }
}

/**
 * Check if we're running in a Farcaster Mini App environment
 */
export async function isFarcasterEnvironment(): Promise<boolean> {
  try {
    if (!farcasterSDK) return false;
    const context = await farcasterSDK.context;
    return !!context && !!context.user;
  } catch {
    return false;
  }
}