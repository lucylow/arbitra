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
      return import.meta.env[key] || '';
    }
  } catch {
    // import.meta not available (Node.js environment)
  }
  
  // Fallback to process.env (Node.js/server-side)
  if (typeof process !== 'undefined' && process.env) {
    return process.env[key] || '';
  }
  
  return '';
};

export const CANISTER_IDS = {
  arbitra_backend: getEnvVar('VITE_ARBITRA_BACKEND_CANISTER_ID') || getEnvVar('ARBITRA_BACKEND_CANISTER_ID') || '',
  evidence_manager: getEnvVar('VITE_EVIDENCE_MANAGER_CANISTER_ID') || getEnvVar('EVIDENCE_MANAGER_CANISTER_ID') || '',
  ai_analysis: getEnvVar('VITE_AI_ANALYSIS_CANISTER_ID') || getEnvVar('AI_ANALYSIS_CANISTER_ID') || '',
  bitcoin_escrow: getEnvVar('VITE_BITCOIN_ESCROW_CANISTER_ID') || getEnvVar('BITCOIN_ESCROW_CANISTER_ID') || '',
};

// Get network setting
const getNetwork = (): string => {
  return getEnvVar('VITE_DFX_NETWORK') || getEnvVar('DFX_NETWORK') || 'local';
};

// Create HTTP agent
export const createAgent = async (identity?: Identity) => {
  const network = getNetwork();
  
  // Determine if we're running on localhost
  const isLocalhost = typeof window !== 'undefined' && 
                     (window.location.hostname === 'localhost' || 
                      window.location.hostname === '127.0.0.1' ||
                      window.location.hostname === '');
  
  // Use production ICP network if on production network or not on localhost
  // Only use localhost agent when actually running locally
  const host = (network === 'ic' || !isLocalhost)
    ? 'https://ic0.app'
    : 'http://localhost:4943';
  
  const agent = new HttpAgent({
    host,
    identity,
  });

  // Fetch root key only for local development
  if (isLocalhost && network !== 'ic') {
    await agent.fetchRootKey().catch((err: unknown) => {
      console.warn('Unable to fetch root key. Check if the local replica is running');
      console.error(err);
    });
  }

  return agent;
};

// Authentication client
let authClient: AuthClient | null = null;

export const getAuthClient = async () => {
  if (!authClient) {
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
    const isLocalhost = typeof window !== 'undefined' && 
                       (window.location.hostname === 'localhost' || 
                        window.location.hostname === '127.0.0.1' ||
                        window.location.hostname === '');
    
    // Use production Internet Identity if on production network or not on localhost
    // Only use localhost identity provider when actually running locally
    const identityProvider = (network === 'ic' || !isLocalhost)
      ? 'https://identity.ic0.app'
      : `http://localhost:4943?canisterId=${internetIdentityCanisterId}`;
    
    // Use login with explicit Internet Identity provider
    // This should open Internet Identity, not trigger wallet connection modals
    client.login({
      identityProvider,
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
  const identity = await getIdentity();
  const agent = await createAgent(identity);
  
  return Actor.createActor(idlFactory, {
    agent,
    canisterId,
  });
};
