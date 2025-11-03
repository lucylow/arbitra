import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { readFileSync } from 'fs'
import { resolve } from 'path'

// Load canister IDs from dfx output
function getCanisterIds() {
  try {
    const canisterIdsJson = readFileSync(
      resolve(__dirname, '.dfx/local/canister_ids.json'),
      'utf-8'
    )
    const canisterIds = JSON.parse(canisterIdsJson)
    const ids = {
      // Vite environment variables (prefixed with VITE_)
      VITE_ARBITRA_BACKEND_CANISTER_ID: canisterIds.arbitra_backend?.local || '',
      VITE_EVIDENCE_MANAGER_CANISTER_ID: canisterIds.evidence_manager?.local || '',
      VITE_AI_ANALYSIS_CANISTER_ID: canisterIds.ai_analysis?.local || '',
      VITE_BITCOIN_ESCROW_CANISTER_ID: canisterIds.bitcoin_escrow?.local || '',
      VITE_DFX_NETWORK: process.env.DFX_NETWORK || 'local',
      VITE_INTERNET_IDENTITY_CANISTER_ID: canisterIds.__Candid_UI?.local || 'rdmx6-jaaaa-aaaaa-aaadq-cai',
      // Also set non-prefixed for compatibility
      ARBITRA_BACKEND_CANISTER_ID: canisterIds.arbitra_backend?.local || '',
      EVIDENCE_MANAGER_CANISTER_ID: canisterIds.evidence_manager?.local || '',
      AI_ANALYSIS_CANISTER_ID: canisterIds.ai_analysis?.local || '',
      BITCOIN_ESCROW_CANISTER_ID: canisterIds.bitcoin_escrow?.local || '',
      DFX_NETWORK: process.env.DFX_NETWORK || 'local',
      INTERNET_IDENTITY_CANISTER_ID: canisterIds.__Candid_UI?.local || 'rdmx6-jaaaa-aaaaa-aaadq-cai',
    }
    return ids
  } catch (e) {
    console.warn('Could not load canister IDs from .dfx/local/canister_ids.json')
    return {
      VITE_ARBITRA_BACKEND_CANISTER_ID: '',
      VITE_EVIDENCE_MANAGER_CANISTER_ID: '',
      VITE_AI_ANALYSIS_CANISTER_ID: '',
      VITE_BITCOIN_ESCROW_CANISTER_ID: '',
      VITE_DFX_NETWORK: process.env.DFX_NETWORK || 'local',
      VITE_INTERNET_IDENTITY_CANISTER_ID: 'rdmx6-jaaaa-aaaaa-aaadq-cai',
      ARBITRA_BACKEND_CANISTER_ID: '',
      EVIDENCE_MANAGER_CANISTER_ID: '',
      AI_ANALYSIS_CANISTER_ID: '',
      BITCOIN_ESCROW_CANISTER_ID: '',
      DFX_NETWORK: process.env.DFX_NETWORK || 'local',
      INTERNET_IDENTITY_CANISTER_ID: 'rdmx6-jaaaa-aaaaa-aaadq-cai',
    }
  }
}

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
    'process.env': {
      ...getCanisterIds(),
      NODE_ENV: process.env.NODE_ENV || 'development',
    },
  },
  envPrefix: ['VITE_', 'ARBITRA_', 'EVIDENCE_', 'AI_', 'BITCOIN_', 'DFX_', 'INTERNET_IDENTITY_'],
  resolve: {
    alias: {
      // Allow importing from .dfx directory
      '@': resolve(__dirname, './src'),
    },
  },
  optimizeDeps: {
    exclude: [
      // Exclude .dfx generated files from optimization
      '.dfx',
    ],
  },
})
