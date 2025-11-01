import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { readFileSync } from 'fs'
import { join } from 'path'

// Load DFX configuration
const DFX_NETWORK = process.env.DFX_NETWORK || 'local'
const dfxJsonPath = join(process.cwd(), '..', '..', 'dfx.json')
const dfxJson = JSON.parse(readFileSync(dfxJsonPath, 'utf8'))

// Get canister IDs
let canisterIds: { [key: string]: { [key: string]: string } } = {}
try {
  const canisterIdsPath = join(process.cwd(), '..', '..', '.dfx', DFX_NETWORK, 'canister_ids.json')
  canisterIds = JSON.parse(readFileSync(canisterIdsPath, 'utf8'))
} catch (e) {
  console.error('Could not find canister_ids.json:', e)
}

// List of all canisters to expose
const canisters = Object.keys(dfxJson.canisters)

// Generate environment variables for the frontend
const env: { [key: string]: string } = canisters.reduce((acc: { [key: string]: string }, canisterName) => {
  const canisterId = canisterIds[canisterName]?.[DFX_NETWORK] || ''
  acc[`VITE_${canisterName.toUpperCase()}_CANISTER_ID`] = canisterId
  return acc
}, {})

// Add Internet Identity Canister ID
env['VITE_INTERNET_IDENTITY_CANISTER_ID'] = process.env.INTERNET_IDENTITY_CANISTER_ID || 'rdmx6-jaaaa-aaaaa-aaadq-cai'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:4943',
        changeOrigin: true,
      },
    },
  },
  define: {
    // Expose canister IDs to the frontend
    'process.env': {
      ...env,
      DFX_NETWORK: DFX_NETWORK,
    },
  },
})
