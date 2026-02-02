#!/bin/bash
set -e

echo "Starting Linera Backend Service..."

# Check if wallet exists
if [ ! -f /root/.config/linera/wallet.json ]; then
    echo "Error: wallet.json not found. Please provide wallet configuration."
    exit 1
fi

# Sync with the network
echo "Syncing with Linera network..."
linera sync || echo "Warning: Initial sync had issues, continuing..."

# Start the Linera service
echo "Starting Linera GraphQL service on port 8080..."
exec linera service --port 8080 --external
