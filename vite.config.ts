import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { readFileSync } from 'fs'
import { resolve } from 'path'

// Load canister IDs from environment variables (production) or dfx output (local dev)
function getCanisterIds() {
  // Prioritize environment variables for production builds (Lovable, etc.)
  // Fall back to dfx output for local development
  const getEnv = (key: string, defaultValue: string = '') => {
    return process.env[key] || defaultValue;
  };
  
  const envIds = {
    // Vite environment variables (prefixed with VITE_) - these work in production
    VITE_ARBITRA_BACKEND_CANISTER_ID: getEnv('VITE_ARBITRA_BACKEND_CANISTER_ID') || getEnv('ARBITRA_BACKEND_CANISTER_ID'),
    VITE_EVIDENCE_MANAGER_CANISTER_ID: getEnv('VITE_EVIDENCE_MANAGER_CANISTER_ID') || getEnv('EVIDENCE_MANAGER_CANISTER_ID'),
    VITE_AI_ANALYSIS_CANISTER_ID: getEnv('VITE_AI_ANALYSIS_CANISTER_ID') || getEnv('AI_ANALYSIS_CANISTER_ID'),
    VITE_BITCOIN_ESCROW_CANISTER_ID: getEnv('VITE_BITCOIN_ESCROW_CANISTER_ID') || getEnv('BITCOIN_ESCROW_CANISTER_ID'),
    VITE_DFX_NETWORK: getEnv('VITE_DFX_NETWORK') || getEnv('DFX_NETWORK', 'local'),
    VITE_INTERNET_IDENTITY_CANISTER_ID: getEnv('VITE_INTERNET_IDENTITY_CANISTER_ID') || getEnv('INTERNET_IDENTITY_CANISTER_ID', 'rdmx6-jaaaa-aaaaa-aaadq-cai'),
    // Also set non-prefixed for compatibility
    ARBITRA_BACKEND_CANISTER_ID: getEnv('VITE_ARBITRA_BACKEND_CANISTER_ID') || getEnv('ARBITRA_BACKEND_CANISTER_ID'),
    EVIDENCE_MANAGER_CANISTER_ID: getEnv('VITE_EVIDENCE_MANAGER_CANISTER_ID') || getEnv('EVIDENCE_MANAGER_CANISTER_ID'),
    AI_ANALYSIS_CANISTER_ID: getEnv('VITE_AI_ANALYSIS_CANISTER_ID') || getEnv('AI_ANALYSIS_CANISTER_ID'),
    BITCOIN_ESCROW_CANISTER_ID: getEnv('VITE_BITCOIN_ESCROW_CANISTER_ID') || getEnv('BITCOIN_ESCROW_CANISTER_ID'),
    DFX_NETWORK: getEnv('VITE_DFX_NETWORK') || getEnv('DFX_NETWORK', 'local'),
    INTERNET_IDENTITY_CANISTER_ID: getEnv('VITE_INTERNET_IDENTITY_CANISTER_ID') || getEnv('INTERNET_IDENTITY_CANISTER_ID', 'rdmx6-jaaaa-aaaaa-aaadq-cai'),
  };
  
  // If environment variables are set (production), use them
  if (envIds.VITE_ARBITRA_BACKEND_CANISTER_ID) {
    return envIds;
  }
  
  // Otherwise, try to load from dfx output (local development)
  try {
    const canisterIdsJson = readFileSync(
      resolve(__dirname, '.dfx/local/canister_ids.json'),
      'utf-8'
    )
    const canisterIds = JSON.parse(canisterIdsJson)
    return {
      ...envIds,
      // Override with dfx values if env vars not set
      VITE_ARBITRA_BACKEND_CANISTER_ID: envIds.VITE_ARBITRA_BACKEND_CANISTER_ID || canisterIds.arbitra_backend?.local || '',
      VITE_EVIDENCE_MANAGER_CANISTER_ID: envIds.VITE_EVIDENCE_MANAGER_CANISTER_ID || canisterIds.evidence_manager?.local || '',
      VITE_AI_ANALYSIS_CANISTER_ID: envIds.VITE_AI_ANALYSIS_CANISTER_ID || canisterIds.ai_analysis?.local || '',
      VITE_BITCOIN_ESCROW_CANISTER_ID: envIds.VITE_BITCOIN_ESCROW_CANISTER_ID || canisterIds.bitcoin_escrow?.local || '',
      VITE_INTERNET_IDENTITY_CANISTER_ID: envIds.VITE_INTERNET_IDENTITY_CANISTER_ID || canisterIds.__Candid_UI?.local || 'rdmx6-jaaaa-aaaaa-aaadq-cai',
      ARBITRA_BACKEND_CANISTER_ID: envIds.ARBITRA_BACKEND_CANISTER_ID || canisterIds.arbitra_backend?.local || '',
      EVIDENCE_MANAGER_CANISTER_ID: envIds.EVIDENCE_MANAGER_CANISTER_ID || canisterIds.evidence_manager?.local || '',
      AI_ANALYSIS_CANISTER_ID: envIds.AI_ANALYSIS_CANISTER_ID || canisterIds.ai_analysis?.local || '',
      BITCOIN_ESCROW_CANISTER_ID: envIds.BITCOIN_ESCROW_CANISTER_ID || canisterIds.bitcoin_escrow?.local || '',
      INTERNET_IDENTITY_CANISTER_ID: envIds.INTERNET_IDENTITY_CANISTER_ID || canisterIds.__Candid_UI?.local || 'rdmx6-jaaaa-aaaaa-aaadq-cai',
    }
  } catch (e) {
    // No dfx file and no env vars - return defaults
    console.warn('Could not load canister IDs from .dfx/local/canister_ids.json or environment variables')
    return envIds
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
