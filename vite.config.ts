import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  server: {
    port: 8080,
  },
  define: {
    'process.env.DFX_NETWORK': JSON.stringify(process.env.DFX_NETWORK || 'local'),
    // Vite uses import.meta.env, but we keep process.env for compatibility
    'process.env': JSON.stringify({
      DFX_NETWORK: process.env.DFX_NETWORK || 'local',
      // dfx generates CANISTER_ID_<canister_name> variables in .env.local
      ARBITRA_BACKEND_CANISTER_ID: process.env.CANISTER_ID_ARBITRA_BACKEND || '',
      EVIDENCE_MANAGER_CANISTER_ID: process.env.CANISTER_ID_EVIDENCE_MANAGER || '',
      AI_ANALYSIS_CANISTER_ID: process.env.CANISTER_ID_AI_ANALYSIS || '',
      BITCOIN_ESCROW_CANISTER_ID: process.env.CANISTER_ID_BITCOIN_ESCROW || '',
      INTERNET_IDENTITY_CANISTER_ID: process.env.INTERNET_IDENTITY_CANISTER_ID || 'rdmx6-jaaaa-aaaaa-aaadq-cai',
    }),
  },
})
