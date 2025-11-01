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
}

export {};
