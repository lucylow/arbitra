import { Actor, HttpAgent, Identity } from '@dfinity/agent';
import { AuthClient } from '@dfinity/auth-client';
import { Principal } from '@dfinity/principal';
import type { IDL } from '@dfinity/candid';

// Canister IDs (will be populated after deployment)
// dfx generates variables in format: CANISTER_ID_<canister_name>
// For Vite, use import.meta.env, but also check process.env for compatibility
const getEnvVar = (key: string): string => {
  // Try Vite's import.meta.env first (available in browser with Vite)
  try {
    // @ts-ignore - import.meta.env is available in Vite but TypeScript might not recognize it
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      // @ts-ignore
      const value = import.meta.env[key];
      if (value) return String(value);
    }
  } catch {
    // import.meta not available (Node.js environment)
  }
  
  // Fallback to process.env (Vite defines these via define in vite.config.ts)
  // When Vite uses define, it does string replacement, so process.env.VITE_* should work
  try {
    if (typeof process !== 'undefined' && process.env) {
      const value = process.env[key];
      if (value) return String(value);
    }
  } catch {
    // process.env not available
  }
  
  return '';
};

// Function to get canister ID with fallback
const getCanisterId = (canisterName: string): string => {
  // Try Vite env vars first (works in browser)
  const viteKey = `VITE_${canisterName.toUpperCase()}_CANISTER_ID`;
  const nonViteKey = `${canisterName.toUpperCase()}_CANISTER_ID`;
  
  // Try import.meta.env (Vite's preferred way)
  let id = '';
  try {
    // @ts-ignore
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      // @ts-ignore
      id = import.meta.env[viteKey] || import.meta.env[nonViteKey] || '';
      if (id) id = String(id);
    }
  } catch {
    // Continue to fallback
  }
  
  // Fallback to process.env (injected by vite.config.ts via define)
  if (!id && typeof process !== 'undefined' && process.env) {
    id = String(process.env[viteKey] || process.env[nonViteKey] || '');
  }
  
  // Log connection status
  if (!id) {
    console.warn(`⚠️  Canister ID for ${canisterName} not found. Make sure canisters are deployed and IDs are available.`);
    console.warn(`   Tried keys: ${viteKey}, ${nonViteKey}`);
  } else {
    console.log(`✅ ${canisterName} canister ID: ${id}`);
  }
  
  return id || '';
};

// Compute canister IDs dynamically (not at module load time to ensure values are available)
export const CANISTER_IDS = {
  get arbitra_backend() { return getCanisterId('arbitra_backend'); },
  get evidence_manager() { return getCanisterId('evidence_manager'); },
  get ai_analysis() { return getCanisterId('ai_analysis'); },
  get bitcoin_escrow() { return getCanisterId('bitcoin_escrow'); },
};

// Get network setting
const getNetwork = (): string => {
  return getEnvVar('VITE_DFX_NETWORK') || getEnvVar('DFX_NETWORK') || 'local';
};

// Create HTTP agent
export const createAgent = async (identity?: Identity) => {
  const network = getNetwork();
  
  // Determine if we're running on localhost
  // Only consider actual localhost values, not empty strings (which might be production)
  const isLocalhost = typeof window !== 'undefined' && 
                     window.location.hostname !== '' &&
                     (window.location.hostname === 'localhost' || 
                      window.location.hostname === '127.0.0.1' ||
                      window.location.hostname === '[::1]');
  
  // Use production ICP network if on production network or not on localhost
  // Only use localhost agent when actually running locally
  const host = (network === 'ic' || !isLocalhost)
    ? 'https://ic0.app'
    : 'http://localhost:4943';
  
  console.log(`🔌 Creating ICP agent - Host: ${host}, Network: ${network}, Localhost: ${isLocalhost}`);
  
  const agent = new HttpAgent({
    host,
    identity,
  });

  // Fetch root key only for local development
  if (isLocalhost && network !== 'ic') {
    try {
      console.log('🔑 Fetching root key for local development...');
      await agent.fetchRootKey();
      console.log('✅ Root key fetched successfully');
    } catch (err: unknown) {
      console.warn('⚠️  Unable to fetch root key. Check if the local replica is running on http://localhost:4943');
      console.error('Error details:', err);
      // Don't throw - allow connection to proceed, it might still work
    }
  }

  return agent;
};

// Authentication client
let authClient: AuthClient | null = null;

export const getAuthClient = async () => {
  if (!authClient) {
    // Create AuthClient with default options
    // This will use localStorage for identity persistence across browser sessions
    authClient = await AuthClient.create();
  }
  return authClient;
};

export const login = async () => {
  const client = await getAuthClient();
  
  // Explicitly use Internet Identity - prevent wallet extensions from intercepting
  // Some wallet extensions may try to intercept authentication calls
  // We ensure only Internet Identity is used, not wallet connections
  
  // Block wallet extension auto-connect attempts
  // Store original requestConnect if it exists to prevent auto-triggering
  const originalPlugConnect = typeof window !== 'undefined' && window.ic?.plug?.requestConnect;
  if (originalPlugConnect && typeof window !== 'undefined' && window.ic?.plug) {
    // Temporarily override to prevent auto-connect during Internet Identity login
    const plugWallet = window.ic.plug;
    const blockedConnect = async () => {
      console.log('Wallet connection blocked - using Internet Identity instead');
      throw new Error('This application uses Internet Identity for authentication');
    };
    window.ic.plug = {
      ...plugWallet,
      requestConnect: blockedConnect,
    };
  }
  
  return new Promise<void>((resolve, reject) => {
    const network = getNetwork();
    const internetIdentityCanisterId = getEnvVar('VITE_INTERNET_IDENTITY_CANISTER_ID') || 
                                        getEnvVar('INTERNET_IDENTITY_CANISTER_ID') || 
                                        'rdmx6-jaaaa-aaaaa-aaadq-cai'; // Default local II canister ID
    
    // Determine if we're running on localhost
    // Only consider actual localhost values, not empty strings (which might be production)
    const isLocalhost = typeof window !== 'undefined' && 
                       window.location.hostname !== '' &&
                       (window.location.hostname === 'localhost' || 
                        window.location.hostname === '127.0.0.1' ||
                        window.location.hostname === '[::1]');
    
    // Use production Internet Identity if on production network or not on localhost
    // Only use localhost identity provider when actually running locally
    const identityProvider = (network === 'ic' || !isLocalhost)
      ? 'https://identity.ic0.app'
      : `http://localhost:4943?canisterId=${internetIdentityCanisterId}`;
    
    // Use login with explicit Internet Identity provider
    // This should open Internet Identity, not trigger wallet connection modals
    // Set maxTimeToLive to 24 hours for better user experience (optional, but recommended)
    client.login({
      identityProvider,
      maxTimeToLive: BigInt(24 * 60 * 60 * 1000 * 1000 * 1000), // 24 hours in nanoseconds
      onSuccess: () => {
        // Restore original requestConnect after successful login
        if (originalPlugConnect && typeof window !== 'undefined' && window.ic?.plug) {
          window.ic.plug.requestConnect = originalPlugConnect;
        }
        resolve();
      },
      onError: (error: string | number | undefined) => {
        // Restore original requestConnect on error
        if (originalPlugConnect && typeof window !== 'undefined' && window.ic?.plug) {
          window.ic.plug.requestConnect = originalPlugConnect;
        }
        reject(new Error(String(error)));
      },
    });
  });
};

export const logout = async () => {
  const client = await getAuthClient();
  await client.logout();
  window.location.reload();
};

export const isAuthenticated = async () => {
  const client = await getAuthClient();
  return await client.isAuthenticated();
};

export const getIdentity = async () => {
  const client = await getAuthClient();
  return client.getIdentity();
};

export const getPrincipal = async (): Promise<Principal | null> => {
  const identity = await getIdentity();
  return identity.getPrincipal();
};

// Create actor for canister interaction
export const createActor = async (canisterId: string, idlFactory: IDL.InterfaceFactory) => {
  if (!canisterId || canisterId.trim() === '') {
    throw new Error(`Cannot create actor: canister ID is empty. Please ensure canisters are deployed and IDs are configured.`);
  }
  
  try {
    const identity = await getIdentity();
    const agent = await createAgent(identity);
    
    console.log(`🎭 Creating actor for canister: ${canisterId}`);
    
    const actor = Actor.createActor(idlFactory, {
      agent,
      canisterId,
    });
    
    console.log(`✅ Actor created successfully for canister: ${canisterId}`);
    return actor;
  } catch (error) {
    console.error(`❌ Failed to create actor for canister ${canisterId}:`, error);
    throw error;
  }
};
