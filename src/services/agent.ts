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
  
  return new Promise<void>((resolve, reject) => {
    client.login({
      identityProvider: process.env.DFX_NETWORK === 'ic'
        ? 'https://identity.ic0.app'
        : `http://localhost:4943?canisterId=${process.env.INTERNET_IDENTITY_CANISTER_ID}`,
      onSuccess: () => resolve(),
      onError: (error: string | number | undefined) => reject(new Error(String(error))),
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
