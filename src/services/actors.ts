import { createActor as createActorHelper } from './agent';
import { CANISTER_IDS } from './agent';

// Import IDL factories from generated files
// Note: These paths work when dfx generates the files
// For production, you may need to copy these to src/declarations/
let arbitraBackendIdl: any;
let evidenceManagerIdl: any;
let aiAnalysisIdl: any;
let bitcoinEscrowIdl: any;

// Dynamically import IDL factories from dfx output
// Using relative paths that work with both dev and build
// Type assertion to handle dynamic imports that TypeScript can't resolve at compile time
async function getArbitraBackendIdl() {
  if (!arbitraBackendIdl) {
    try {
      // Try relative path import - using @ts-ignore to handle dynamic imports
      // @ts-ignore - Dynamic import path not resolvable at compile time
      arbitraBackendIdl = await import(
        '../../../.dfx/local/canisters/arbitra_backend/service.did.js'
      );
    } catch (e) {
      console.error('Failed to load arbitra_backend IDL:', e);
      console.warn('Make sure you have run: dfx build');
      throw new Error('Arbitra backend IDL not found. Please run: dfx build');
    }
  }
  return arbitraBackendIdl;
}

async function getEvidenceManagerIdl() {
  if (!evidenceManagerIdl) {
    try {
      // @ts-ignore - Dynamic import path not resolvable at compile time
      evidenceManagerIdl = await import(
        '../../../.dfx/local/canisters/evidence_manager/service.did.js'
      );
    } catch (e) {
      console.error('Failed to load evidence_manager IDL:', e);
      console.warn('Make sure you have run: dfx build');
      throw new Error('Evidence manager IDL not found. Please run: dfx build');
    }
  }
  return evidenceManagerIdl;
}

async function getAIAnalysisIdl() {
  if (!aiAnalysisIdl) {
    try {
      // @ts-ignore - Dynamic import path not resolvable at compile time
      aiAnalysisIdl = await import(
        '../../../.dfx/local/canisters/ai_analysis/service.did.js'
      );
    } catch (e) {
      console.error('Failed to load ai_analysis IDL:', e);
      console.warn('Make sure you have run: dfx build');
      throw new Error('AI analysis IDL not found. Please run: dfx build');
    }
  }
  return aiAnalysisIdl;
}

async function getBitcoinEscrowIdl() {
  if (!bitcoinEscrowIdl) {
    try {
      // @ts-ignore - Dynamic import path not resolvable at compile time
      bitcoinEscrowIdl = await import(
        '../../../.dfx/local/canisters/bitcoin_escrow/service.did.js'
      );
    } catch (e) {
      console.error('Failed to load bitcoin_escrow IDL:', e);
      console.warn('Make sure you have run: dfx build');
      throw new Error('Bitcoin escrow IDL not found. Please run: dfx build');
    }
  }
  return bitcoinEscrowIdl;
}

// Actor type exports
export type ArbitraBackendActor = Awaited<ReturnType<typeof createArbitraBackendActor>>;
export type EvidenceManagerActor = Awaited<ReturnType<typeof createEvidenceManagerActor>>;
export type AIAnalysisActor = Awaited<ReturnType<typeof createAIAnalysisActor>>;
export type BitcoinEscrowActor = Awaited<ReturnType<typeof createBitcoinEscrowActor>>;

// Create actors for each canister
export async function createArbitraBackendActor() {
  const canisterId = CANISTER_IDS.arbitra_backend;
  if (!canisterId) {
    throw new Error('ARBITRA_BACKEND_CANISTER_ID is not set');
  }
  
  const idl = await getArbitraBackendIdl();
  return await createActorHelper(canisterId, (idl as any).idlFactory);
}

export async function createEvidenceManagerActor() {
  const canisterId = CANISTER_IDS.evidence_manager;
  if (!canisterId) {
    throw new Error('EVIDENCE_MANAGER_CANISTER_ID is not set');
  }
  
  const idl = await getEvidenceManagerIdl();
  return await createActorHelper(canisterId, (idl as any).idlFactory);
}

export async function createAIAnalysisActor() {
  const canisterId = CANISTER_IDS.ai_analysis;
  if (!canisterId) {
    throw new Error('AI_ANALYSIS_CANISTER_ID is not set');
  }
  
  const idl = await getAIAnalysisIdl();
  return await createActorHelper(canisterId, (idl as any).idlFactory);
}

export async function createBitcoinEscrowActor() {
  const canisterId = CANISTER_IDS.bitcoin_escrow;
  if (!canisterId) {
    throw new Error('BITCOIN_ESCROW_CANISTER_ID is not set');
  }
  
  const idl = await getBitcoinEscrowIdl();
  return await createActorHelper(canisterId, (idl as any).idlFactory);
}

