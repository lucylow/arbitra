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
    'process.env.DFX_NETWORK': JSON.stringify('local'),
    'process.env': JSON.stringify({
      DFX_NETWORK: 'local',
      ARBITRA_BACKEND_CANISTER_ID: '',
      EVIDENCE_MANAGER_CANISTER_ID: '',
      AI_ANALYSIS_CANISTER_ID: '',
      BITCOIN_ESCROW_CANISTER_ID: '',
      INTERNET_IDENTITY_CANISTER_ID: 'rdmx6-jaaaa-aaaaa-aaadq-cai',
    }),
  },
})
