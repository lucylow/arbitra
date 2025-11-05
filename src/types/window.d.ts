interface Window {
  ic?: {
    plug?: {
      requestConnect: (options: {
        whitelist?: string[]
        host?: string
      }) => Promise<boolean>
      agent: {
        getPrincipal: () => Promise<{ toString: () => string }>
      }
      isConnected: () => Promise<boolean>
      disconnect: () => Promise<void>
    }
  }
}
