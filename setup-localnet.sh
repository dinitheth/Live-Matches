#!/bin/bash
set -e

echo "🚀 Setting up Linera Localnet..."

# Stop any existing local network
echo "Stopping any existing local network..."
linera net down 2>/dev/null || true

# Start local test network with 4 validators
echo "Starting local network..."
linera net up --testing-prng-seed 37

echo ""
echo "✅ Local network is running!"
echo ""
echo "📋 Network Info:"
linera wallet show

echo ""
echo "🔗 Default chain ID and owner address saved."
echo ""
echo "Next steps:"
echo "1. Deploy your Live Predict contract to localnet"
echo "2. Update your .env with the new Application ID and Chain ID"
echo "3. Start linera service --port 8080"
