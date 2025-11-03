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
      '../../declarations/arbitra_backend/service.did.js', // Another alternative
    ];
    
    let lastError: any;
    let triedPaths: string[] = [];
    
    for (const modulePath of paths) {
      triedPaths.push(modulePath);
      try {
        console.log(`🔍 Trying to load IDL from: ${modulePath}`);
        arbitraBackendIdl = await import(modulePath as any);
        if (arbitraBackendIdl?.idlFactory) {
          console.log(`✅ Successfully loaded IDL from: ${modulePath}`);
          return arbitraBackendIdl;
        } else {
          console.warn(`⚠️  IDL loaded but idlFactory not found from: ${modulePath}`);
        }
      } catch (e) {
        lastError = e;
        // Only log if it's not a module not found error (which is expected)
        if (!(e as any)?.message?.includes('Cannot find module')) {
          console.warn(`⚠️  Failed to load from ${modulePath}:`, (e as any)?.message);
        }
        continue;
      }
    }
    
    // Fallback: Use the stub IDL if available
    try {
      console.log('🔄 Trying fallback stub IDL from declarations...');
      // @ts-ignore - declarations file may not have types but exists at runtime
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error - Dynamic import of did.js file
      arbitraBackendIdl = await import('../declarations/arbitra_backend.did.js');
      if (arbitraBackendIdl?.idlFactory) {
        console.log('✅ Using fallback stub IDL');
        return arbitraBackendIdl;
      }
    } catch (e) {
      // Ignore fallback errors
    }
    
    console.error('❌ Failed to load arbitra_backend IDL from all paths:', triedPaths);
    console.error('Last error:', lastError);
    console.warn('💡 Make sure you have run: dfx build or IDL files are bundled');
    throw new Error('Arbitra backend IDL not found. Please ensure IDL files are available. Run "dfx build" to generate them.');
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
    const errorMsg = 'ARBITRA_BACKEND_CANISTER_ID is not set. Please deploy canisters or set environment variables.';
    console.error('❌', errorMsg);
    throw new Error(errorMsg);
  }
  
  console.log('🔌 Creating Arbitra Backend actor with canister ID:', canisterId);
  
  try {
    const idl = await getArbitraBackendIdl();
    if (!idl || !idl.idlFactory) {
      throw new Error('IDL factory not found. Run "dfx build" to generate IDL files.');
    }
    
    const actor = await createActorHelper(canisterId, idl.idlFactory);
    console.log('✅ Arbitra Backend actor created successfully');
    return actor;
  } catch (error) {
    console.error('❌ Failed to create Arbitra Backend actor:', error);
    throw error;
  }
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

