import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { readFileSync } from 'fs'
import { join } from 'path'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '')
  
  // Try to load .env.local file directly (dfx generates this)
  const dfxEnv: Record<string, string> = {}
  try {
    const envLocalPath = join(process.cwd(), '.env.local')
    const envLocalContent = readFileSync(envLocalPath, 'utf-8')
    envLocalContent.split('\n').forEach(line => {
      const trimmed = line.trim()
      if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
        const [key, ...valueParts] = trimmed.split('=')
        const value = valueParts.join('=').replace(/^["']|["']$/g, '')
        dfxEnv[key.trim()] = value.trim()
      }
    })
  } catch (e) {
    // .env.local doesn't exist yet, that's ok
    console.warn('Could not load .env.local file. Canisters may not be deployed yet.')
  }

  // dfx generates CANISTER_ID_<canister_name> format
  // Canister names with underscores are converted: arbitra_backend -> ARBITRA_BACKEND
  // We need to map them to our expected format
  const getCanisterId = (canisterName: string): string => {
    // DFX converts canister names to uppercase with underscores preserved
    const dfxKey = `CANISTER_ID_${canisterName.toUpperCase().replace(/-/g, '_')}`
    
    // Try multiple sources: dfxEnv (from .env.local), env (loadEnv), process.env
    return dfxEnv[dfxKey] || env[dfxKey] || process.env[dfxKey] || ''
  }

  return {
    plugins: [react()],
    build: {
      outDir: 'dist',
      emptyOutDir: true,
    },
    server: {
      port: 8080,
    },
    define: {
      'process.env.DFX_NETWORK': JSON.stringify(env.DFX_NETWORK || process.env.DFX_NETWORK || 'local'),
      // Vite uses import.meta.env, but we keep process.env for compatibility
      'process.env': JSON.stringify({
        DFX_NETWORK: env.DFX_NETWORK || process.env.DFX_NETWORK || 'local',
        // dfx generates CANISTER_ID_<canister_name> variables in .env.local
        ARBITRA_BACKEND_CANISTER_ID: getCanisterId('arbitra_backend'),
        EVIDENCE_MANAGER_CANISTER_ID: getCanisterId('evidence_manager'),
        AI_ANALYSIS_CANISTER_ID: getCanisterId('ai_analysis'),
        BITCOIN_ESCROW_CANISTER_ID: getCanisterId('bitcoin_escrow'),
        INTERNET_IDENTITY_CANISTER_ID: env.INTERNET_IDENTITY_CANISTER_ID || process.env.INTERNET_IDENTITY_CANISTER_ID || 'rdmx6-jaaaa-aaaaa-aaadq-cai',
      }),
    },
  }
})
