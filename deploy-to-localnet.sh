#!/bin/bash
set -e

echo "📦 Deploying Live Predict Contract to Localnet..."

# Navigate to contract directory
cd ~/live-predict-build

# Build the contract
echo "Building contract..."
cargo build --release

# Publish the application
echo "Publishing application..."
PUBLISHED_OUTPUT=$(linera publish-and-create live-predict/target/wasm32-unknown-unknown/release/live_predict_{contract,service}.wasm)

# Extract Application ID
APP_ID=$(echo "$PUBLISHED_OUTPUT" | grep -oP 'Application ID: \K[a-f0-9]+')

# Get the current default chain ID
CHAIN_ID=$(linera wallet show | grep -oP 'Public Key.*?\K[a-f0-9]+' | head -1)

echo ""
echo "✅ Contract deployed successfully!"
echo ""
echo "📝 Update your .env file with:"
echo "LINERA_APPLICATION_ID=$APP_ID"
echo "LINERA_CHAIN_ID=$CHAIN_ID"
echo ""
echo "Then update src/lib/linera.ts with these values."
