import { Actor, HttpAgent } from '@dfinity/agent';
import { AuthClient } from '@dfinity/auth-client';
import { Principal } from '@dfinity/principal';

// Canister IDs (will be populated after deployment)
export const CANISTER_IDS = {
  arbitra_backend: process.env.ARBITRA_BACKEND_CANISTER_ID || '',
  evidence_manager: process.env.EVIDENCE_MANAGER_CANISTER_ID || '',
  ai_analysis: process.env.AI_ANALYSIS_CANISTER_ID || '',
  bitcoin_escrow: process.env.BITCOIN_ESCROW_CANISTER_ID || '',
};

// Create HTTP agent
export const createAgent = async (identity?: any) => {
  const agent = new HttpAgent({
    host: process.env.DFX_NETWORK === 'ic' 
      ? 'https://ic0.app' 
      : 'http://localhost:4943',
    identity,
  });

  // Fetch root key for local development
  if (process.env.DFX_NETWORK !== 'ic') {
    await agent.fetchRootKey().catch(err => {
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
      onError: (error) => reject(error),
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
export const createActor = async (canisterId: string, idlFactory: any) => {
  const identity = await getIdentity();
  const agent = await createAgent(identity);
  
  return Actor.createActor(idlFactory, {
    agent,
    canisterId,
  });
};
