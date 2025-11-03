#!/bin/bash

# Arbitra ICP Deployment Script
# This script deploys all canisters to the Internet Computer

set -e

echo "🚀 Starting Arbitra deployment..."

# Check if dfx is installed
if ! command -v dfx &> /dev/null; then
    echo "❌ Error: dfx is not installed"
    echo "Please install dfx: https://internetcomputer.org/docs/current/developer-docs/setup/install"
    exit 1
fi

# Check if pnpm is installed
if ! command -v pnpm &> /dev/null; then
    echo "❌ Error: pnpm is not installed"
    echo "Please install pnpm: npm install -g pnpm"
    exit 1
fi

# Start local replica if not running
echo "📡 Checking local replica..."
if ! dfx ping &> /dev/null; then
    echo "Starting local replica..."
    dfx start --background --clean
    sleep 5
fi

# Create canisters
echo "🏗️  Creating canisters..."
dfx canister create --all

# Build backend canisters
echo "🔨 Building backend canisters..."
dfx build arbitra_backend
dfx build evidence_manager
dfx build ai_analysis
dfx build bitcoin_escrow

# Build frontend
echo "🎨 Building frontend..."
if command -v npm &> /dev/null; then
  npm run build
else
  echo "⚠️  npm not found, trying pnpm..."
  if command -v pnpm &> /dev/null; then
    pnpm run build
  else
    echo "❌ Error: Neither npm nor pnpm found. Please install one of them."
    exit 1
  fi
fi

# Deploy all canisters
echo "📦 Deploying canisters..."
dfx deploy

# Get canister IDs
echo ""
echo "✅ Deployment complete!"
echo ""
echo "📋 Canister IDs:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
dfx canister id arbitra_backend || echo "⚠️  arbitra_backend not found"
dfx canister id evidence_manager || echo "⚠️  evidence_manager not found"
dfx canister id ai_analysis || echo "⚠️  ai_analysis not found"
dfx canister id bitcoin_escrow || echo "⚠️  bitcoin_escrow not found"
dfx canister id arbitra_frontend || echo "⚠️  arbitra_frontend not found"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🌐 Access your application at:"
FRONTEND_ID=$(dfx canister id arbitra_frontend 2>/dev/null)
if [ -n "$FRONTEND_ID" ]; then
  echo "http://localhost:4943?canisterId=$FRONTEND_ID"
  echo "or"
  echo "http://$FRONTEND_ID.localhost:8000"
else
  echo "⚠️  Frontend canister ID not found"
fi
echo ""
echo "📝 Note: Canister IDs are saved in .env.local file"
echo "   Restart your dev server after deployment: npm run dev"
echo ""
echo "🎉 Arbitra is now running!"
