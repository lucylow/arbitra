/// <reference types="vite/client" />

declare global {
  interface Window {
    ic?: {
      plug?: {
        requestConnect: (options?: any) => Promise<void>;
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
    }
  }
}

export {};
