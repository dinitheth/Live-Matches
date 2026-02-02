#!/usr/bin/env bash

set -eu

echo "🚀 Starting Live Predict dApp on Linera localnet..."

# Set up Linera environment helpers
eval "$(linera net helper)"

# Start local Linera network with faucet
echo "📡 Starting local network..."
linera_spawn linera net up --with-faucet

# Wait for the network to be ready
echo "⏳ Waiting for network to start..."
sleep 10

# Initialize wallet from faucet
export LINERA_FAUCET_URL=http://localhost:8080
echo "💰 Initializing wallet from faucet..."
linera wallet init --faucet="$LINERA_FAUCET_URL" || true
linera wallet request-chain --faucet="$LINERA_FAUCET_URL" || true

# Get Chain ID from wallet
echo "📋 Getting Chain ID..."
CHAIN_ID=$(linera wallet show 2>/dev/null | grep -oE 'e[a-f0-9]{63}' | head -1 || echo "")
if [ -z "$CHAIN_ID" ]; then
    # Try alternative format
    CHAIN_ID=$(linera wallet show 2>/dev/null | grep -oE '[a-f0-9]{64}' | head -1 || echo "")
fi
echo "Chain ID: $CHAIN_ID"

# Build the Live Predict contract
echo "🔨 Building Live Predict contract..."
cd /build/linera-contracts/live-predict
cargo build --release --target wasm32-unknown-unknown

# Publish and create the application
echo "📦 Publishing contract to localnet..."
cd /build

APP_OUTPUT=$(linera publish-and-create \
    linera-contracts/live-predict/target/wasm32-unknown-unknown/release/live-predict_contract.wasm \
    linera-contracts/live-predict/target/wasm32-unknown-unknown/release/live-predict_service.wasm \
    --json-argument "100" 2>&1) || {
        echo "⚠️ Deployment output: $APP_OUTPUT"
    }

echo "Deployment output:"
echo "$APP_OUTPUT"

# Extract Application ID from output (it's a long hex string after the publish-and-create)
APP_ID=$(echo "$APP_OUTPUT" | grep -oE '[a-f0-9]{64}' | tail -1 || echo "")
echo "Application ID extracted: $APP_ID"

# Export environment variables for Vite frontend
if [ -n "$APP_ID" ]; then
    export VITE_LINERA_APP_ID="$APP_ID"
    echo "✅ VITE_LINERA_APP_ID set to: $APP_ID"
fi

if [ -n "$CHAIN_ID" ]; then
    export VITE_LINERA_CHAIN_ID="$CHAIN_ID"
    echo "✅ VITE_LINERA_CHAIN_ID set to: $CHAIN_ID"
fi

# Update .env file with Linera values (preserve other values)
echo "🔧 Updating .env with deployed Application ID..."

# Create .env if it doesn't exist
if [ ! -f /build/.env ]; then
    touch /build/.env
fi

# Remove old Linera values and add new ones
grep -v "^VITE_LINERA_" /build/.env > /build/.env.tmp || true
cat >> /build/.env.tmp << EOF

# Linera Local Network - Live Predict Application (Docker)
VITE_LINERA_ENDPOINT=http://localhost:8081
VITE_LINERA_APP_ID=$APP_ID
VITE_LINERA_CHAIN_ID=$CHAIN_ID
EOF
mv /build/.env.tmp /build/.env

echo "📋 .env Linera values:"
grep "VITE_LINERA" /build/.env

# Start the Linera service for the application GraphQL API
echo "🌐 Requesting application on chain..."
linera wallet show || true
linera request-application --target-chain-id="$CHAIN_ID" "$APP_ID" || true
sleep 3

echo "🌐 Syncing chain data..."
linera sync || true
sleep 3

echo "🌐 Starting Linera GraphQL service for the application..."
linera service --port 8081 &
SERVICE_PID=$!
sleep 5

echo "✅ Linera localnet is running!"
echo "   Faucet endpoint: http://localhost:8080"
echo "   GraphQL service: http://localhost:8081"

# Install frontend dependencies and run dev server
echo "🎨 Starting frontend..."
cd /build
. ~/.nvm/nvm.sh
pnpm install --frozen-lockfile || pnpm install

# Run Vite with environment variables
VITE_LINERA_APP_ID="$APP_ID" VITE_LINERA_CHAIN_ID="$CHAIN_ID" pnpm run dev --host 0.0.0.0 --port 5173 &
FRONTEND_PID=$!

echo ""
echo "=========================================="
echo "🎮 Live Predict dApp is running!"
echo "=========================================="
echo "Frontend:    http://localhost:5173"
echo "GraphQL:     http://localhost:8081"
if [ -n "$APP_ID" ]; then
    echo "App ID:      $APP_ID"
fi
if [ -n "$CHAIN_ID" ]; then
    echo "Chain ID:    $CHAIN_ID"
fi
echo "=========================================="
echo ""

# Keep container running
wait $FRONTEND_PID
