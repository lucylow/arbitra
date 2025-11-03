/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ARBITRA_BACKEND_CANISTER_ID?: string;
  readonly VITE_EVIDENCE_MANAGER_CANISTER_ID?: string;
  readonly VITE_AI_ANALYSIS_CANISTER_ID?: string;
  readonly VITE_BITCOIN_ESCROW_CANISTER_ID?: string;
  readonly VITE_DFX_NETWORK?: string;
  readonly VITE_INTERNET_IDENTITY_CANISTER_ID?: string;
  // Also support non-prefixed versions for compatibility
  readonly ARBITRA_BACKEND_CANISTER_ID?: string;
  readonly EVIDENCE_MANAGER_CANISTER_ID?: string;
  readonly AI_ANALYSIS_CANISTER_ID?: string;
  readonly BITCOIN_ESCROW_CANISTER_ID?: string;
  readonly DFX_NETWORK?: string;
  readonly INTERNET_IDENTITY_CANISTER_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare global {
  interface Window {
    ic?: {
      plug?: {
        requestConnect: (options?: Record<string, unknown>) => Promise<void>;
        getPrincipal: () => Promise<import('@dfinity/principal').Principal>;
        disconnect: () => void;
        isConnected: () => Promise<boolean>;
      };
    };
  }
  
  namespace NodeJS {
    interface ProcessEnv {
      ARBITRA_BACKEND_CANISTER_ID?: string;
      EVIDENCE_MANAGER_CANISTER_ID?: string;
      AI_ANALYSIS_CANISTER_ID?: string;
      BITCOIN_ESCROW_CANISTER_ID?: string;
      DFX_NETWORK?: string;
      INTERNET_IDENTITY_CANISTER_ID?: string;
      VITE_ARBITRA_BACKEND_CANISTER_ID?: string;
      VITE_EVIDENCE_MANAGER_CANISTER_ID?: string;
      VITE_AI_ANALYSIS_CANISTER_ID?: string;
      VITE_BITCOIN_ESCROW_CANISTER_ID?: string;
      VITE_DFX_NETWORK?: string;
      VITE_INTERNET_IDENTITY_CANISTER_ID?: string;
    }
  }
}

// Module declarations for dynamically imported IDL files from dfx build output
// These files are generated at runtime and may not exist at compile time
declare module '../../../.dfx/local/canisters/arbitra_backend/service.did.js' {
  import type { IDL } from '@dfinity/candid';
  export const idlFactory: IDL.InterfaceFactory;
  export const canisterId: string;
}

declare module '../../../.dfx/local/canisters/evidence_manager/service.did.js' {
  import type { IDL } from '@dfinity/candid';
  export const idlFactory: IDL.InterfaceFactory;
  export const canisterId: string;
}

declare module '../../../.dfx/local/canisters/ai_analysis/service.did.js' {
  import type { IDL } from '@dfinity/candid';
  export const idlFactory: IDL.InterfaceFactory;
  export const canisterId: string;
}

declare module '../../../.dfx/local/canisters/bitcoin_escrow/service.did.js' {
  import type { IDL } from '@dfinity/candid';
  export const idlFactory: IDL.InterfaceFactory;
  export const canisterId: string;
}

// Fallback declarations for src/declarations IDL files
declare module '../declarations/arbitra_backend.did.js' {
  import type { IDL } from '@dfinity/candid';
  export const idlFactory: IDL.InterfaceFactory;
  export const canisterId: string;
}

declare module '../declarations/evidence_manager.did.js' {
  import type { IDL } from '@dfinity/candid';
  export const idlFactory: IDL.InterfaceFactory;
  export const canisterId: string;
}

declare module '../declarations/ai_analysis.did.js' {
  import type { IDL } from '@dfinity/candid';
  export const idlFactory: IDL.InterfaceFactory;
  export const canisterId: string;
}

declare module '../declarations/bitcoin_escrow.did.js' {
  import type { IDL } from '@dfinity/candid';
  export const idlFactory: IDL.InterfaceFactory;
  export const canisterId: string;
}

export {};
