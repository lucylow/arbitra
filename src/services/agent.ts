import { Actor, HttpAgent, Identity } from '@dfinity/agent';
import { AuthClient } from '@dfinity/auth-client';
import { Principal } from '@dfinity/principal';
import type { IDL } from '@dfinity/candid';

// Canister IDs (will be populated after deployment)
// dfx generates variables in format: CANISTER_ID_<canister_name>
// We use process.env which is defined in vite.config.ts
export const CANISTER_IDS = {
  arbitra_backend: (process.env.ARBITRA_BACKEND_CANISTER_ID || '') as string,
  evidence_manager: (process.env.EVIDENCE_MANAGER_CANISTER_ID || '') as string,
  ai_analysis: (process.env.AI_ANALYSIS_CANISTER_ID || '') as string,
  bitcoin_escrow: (process.env.BITCOIN_ESCROW_CANISTER_ID || '') as string,
};

// Create HTTP agent
export const createAgent = async (identity?: Identity) => {
  const agent = new HttpAgent({
    host: process.env.DFX_NETWORK === 'ic' 
      ? 'https://ic0.app' 
      : 'http://localhost:4943',
    identity,
  });

  // Fetch root key for local development
  if (process.env.DFX_NETWORK !== 'ic') {
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
    const identityProvider = process.env.DFX_NETWORK === 'ic'
      ? 'https://identity.ic0.app'
      : `http://localhost:4943?canisterId=${process.env.INTERNET_IDENTITY_CANISTER_ID}`;
    
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
