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
async function getArbitraBackendIdl() {
  if (!arbitraBackendIdl) {
    // Try multiple paths for different environments
    const paths = [
      '../../../.dfx/local/canisters/arbitra_backend/service.did.js', // Local dev
      '/declarations/arbitra_backend/service.did.js', // Production bundled
      './declarations/arbitra_backend/service.did.js', // Alternative production path
    ];
    
    let lastError: any;
    for (const modulePath of paths) {
      try {
        arbitraBackendIdl = await import(modulePath as any);
        if (arbitraBackendIdl?.idlFactory) {
          return arbitraBackendIdl;
        }
      } catch (e) {
        lastError = e;
        continue;
      }
    }
    
    console.error('Failed to load arbitra_backend IDL from all paths:', lastError);
    console.warn('Make sure you have run: dfx build or IDL files are bundled');
    throw new Error('Arbitra backend IDL not found. Please ensure IDL files are available.');
  }
  return arbitraBackendIdl;
}

async function getEvidenceManagerIdl() {
  if (!evidenceManagerIdl) {
    // Try multiple paths for different environments
    const paths = [
      '../../../.dfx/local/canisters/evidence_manager/service.did.js', // Local dev
      '/declarations/evidence_manager/service.did.js', // Production bundled
      './declarations/evidence_manager/service.did.js', // Alternative production path
    ];
    
    let lastError: any;
    for (const modulePath of paths) {
      try {
        evidenceManagerIdl = await import(modulePath as any);
        if (evidenceManagerIdl?.idlFactory) {
          return evidenceManagerIdl;
        }
      } catch (e) {
        lastError = e;
        continue;
      }
    }
    
    console.error('Failed to load evidence_manager IDL from all paths:', lastError);
    console.warn('Make sure you have run: dfx build or IDL files are bundled');
    throw new Error('Evidence manager IDL not found. Please ensure IDL files are available.');
  }
  return evidenceManagerIdl;
}

async function getAIAnalysisIdl() {
  if (!aiAnalysisIdl) {
    // Try multiple paths for different environments
    const paths = [
      '../../../.dfx/local/canisters/ai_analysis/service.did.js', // Local dev
      '/declarations/ai_analysis/service.did.js', // Production bundled
      './declarations/ai_analysis/service.did.js', // Alternative production path
    ];
    
    let lastError: any;
    for (const modulePath of paths) {
      try {
        aiAnalysisIdl = await import(modulePath as any);
        if (aiAnalysisIdl?.idlFactory) {
          return aiAnalysisIdl;
        }
      } catch (e) {
        lastError = e;
        continue;
      }
    }
    
    console.error('Failed to load ai_analysis IDL from all paths:', lastError);
    console.warn('Make sure you have run: dfx build or IDL files are bundled');
    throw new Error('AI analysis IDL not found. Please ensure IDL files are available.');
  }
  return aiAnalysisIdl;
}

async function getBitcoinEscrowIdl() {
  if (!bitcoinEscrowIdl) {
    // Try multiple paths for different environments
    const paths = [
      '../../../.dfx/local/canisters/bitcoin_escrow/service.did.js', // Local dev
      '/declarations/bitcoin_escrow/service.did.js', // Production bundled
      './declarations/bitcoin_escrow/service.did.js', // Alternative production path
    ];
    
    let lastError: any;
    for (const modulePath of paths) {
      try {
        bitcoinEscrowIdl = await import(modulePath as any);
        if (bitcoinEscrowIdl?.idlFactory) {
          return bitcoinEscrowIdl;
        }
      } catch (e) {
        lastError = e;
        continue;
      }
    }
    
    console.error('Failed to load bitcoin_escrow IDL from all paths:', lastError);
    console.warn('Make sure you have run: dfx build or IDL files are bundled');
    throw new Error('Bitcoin escrow IDL not found. Please ensure IDL files are available.');
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
  return await createActorHelper(canisterId, idl.idlFactory);
}

export async function createEvidenceManagerActor() {
  const canisterId = CANISTER_IDS.evidence_manager;
  if (!canisterId) {
    throw new Error('EVIDENCE_MANAGER_CANISTER_ID is not set');
  }
  
  const idl = await getEvidenceManagerIdl();
  return await createActorHelper(canisterId, idl.idlFactory);
}

export async function createAIAnalysisActor() {
  const canisterId = CANISTER_IDS.ai_analysis;
  if (!canisterId) {
    throw new Error('AI_ANALYSIS_CANISTER_ID is not set');
  }
  
  const idl = await getAIAnalysisIdl();
  return await createActorHelper(canisterId, idl.idlFactory);
}

export async function createBitcoinEscrowActor() {
  const canisterId = CANISTER_IDS.bitcoin_escrow;
  if (!canisterId) {
    throw new Error('BITCOIN_ESCROW_CANISTER_ID is not set');
  }
  
  const idl = await getBitcoinEscrowIdl();
  return await createActorHelper(canisterId, idl.idlFactory);
}

