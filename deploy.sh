#!/bin/bash

# Arbitra ICP Deployment Script
# This script deploys all canisters to the Internet Computer

set -e

echo "🚀 Deploying Arbitra Backend to ICP..."

# Check if dfx is installed
if ! command -v dfx &> /dev/null; then
    echo "❌ Error: dfx is not installed"
    echo "Please install dfx: https://internetcomputer.org/docs/current/developer-docs/setup/install"
    exit 1
fi

# Start local replica if not running (for local deployment)
if [ "$1" != "--network=ic" ]; then
    echo "📡 Checking local replica..."
    if ! dfx ping &> /dev/null; then
        echo "Starting local replica..."
        dfx start --background --clean
        sleep 5
    fi
fi

# Create canisters if they don't exist
echo "🏗️  Creating canisters..."
dfx canister create --all 2>/dev/null || echo "Canisters may already exist, continuing..."

# Build backend canisters
echo "🔨 Building backend canisters..."
dfx build arbitra_backend
dfx build evidence_manager
dfx build ai_analysis
dfx build bitcoin_escrow
dfx build legal_framework
dfx build arbitrator_registry
dfx build evidence_chain

# Build frontend
echo "🎨 Building frontend..."
if command -v npm &> /dev/null; then
  npm run build
else
  if command -v pnpm &> /dev/null; then
    pnpm run build
  else
    echo "⚠️  Warning: Neither npm nor pnpm found. Frontend build skipped."
  fi
fi

# Deploy all canisters
echo "📦 Deploying canisters..."
if [ "$1" = "--network=ic" ]; then
    dfx deploy --network ic
else
    dfx deploy
fi

# Get canister IDs
echo ""
echo "✅ Deployment complete!"
echo ""
echo "🔧 Backend Canister IDs:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "   - Arbitra Backend: $(dfx canister id arbitra_backend 2>/dev/null || echo 'N/A')"
echo "   - Evidence Manager: $(dfx canister id evidence_manager 2>/dev/null || echo 'N/A')"
echo "   - AI Analysis: $(dfx canister id ai_analysis 2>/dev/null || echo 'N/A')"
echo "   - Bitcoin Escrow: $(dfx canister id bitcoin_escrow 2>/dev/null || echo 'N/A')"
echo "   - Legal Framework: $(dfx canister id legal_framework 2>/dev/null || echo 'N/A')"
echo "   - Arbitrator Registry: $(dfx canister id arbitrator_registry 2>/dev/null || echo 'N/A')"
echo "   - Evidence Chain: $(dfx canister id evidence_chain 2>/dev/null || echo 'N/A')"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

FRONTEND_ID=$(dfx canister id arbitra_frontend 2>/dev/null)
if [ -n "$FRONTEND_ID" ]; then
    if [ "$1" = "--network=ic" ]; then
        echo "🌐 Frontend URL: https://${FRONTEND_ID}.ic0.app"
    else
        echo "🌐 Frontend URL: http://localhost:4943/?canisterId=$FRONTEND_ID"
        echo "   Alternative: http://${FRONTEND_ID}.localhost:8000"
    fi
else
    echo "⚠️  Frontend canister ID not found"
fi
echo ""
echo "📝 Note: Canister IDs are saved in .env.local file"
echo ""
echo "🎉 Arbitra is now running!"
