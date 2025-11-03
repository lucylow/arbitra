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

export {};
