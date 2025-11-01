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
cd src/arbitra_frontend
pnpm install
pnpm run build
cd ../..

# Deploy all canisters
echo "📦 Deploying canisters..."
dfx deploy

# Get canister IDs
echo ""
echo "✅ Deployment complete!"
echo ""
echo "📋 Canister IDs:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
dfx canister id arbitra_backend
dfx canister id evidence_manager
dfx canister id ai_analysis
dfx canister id bitcoin_escrow
dfx canister id arbitra_frontend
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🌐 Access your application at:"
FRONTEND_ID=$(dfx canister id arbitra_frontend)
echo "http://localhost:4943?canisterId=$FRONTEND_ID"
echo ""
echo "🎉 Arbitra is now running!"
