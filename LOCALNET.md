# Linera Localnet Setup Guide

This guide will help you set up a completely local Linera network for development, removing dependency on the unstable testnet.

## Why Localnet?

- ✅ **No external dependencies** - runs entirely on your machine
- ✅ **Fast & reliable** - no network issues or validator downtime
- ✅ **Instant resets** - easily restart with fresh state
- ✅ **Perfect for development** - test mutations without worrying about testnet

## Quick Start

### 1. Start Local Network

```bash
# In WSL
cd ~/linera-real-time-forge
bash setup-localnet.sh
```

This will:
- Stop any existing local network
- Start 4 local validator nodes
- Create 2 extra wallets for testing
- Show your default chain info

### 2. Deploy Contract to Localnet

```bash
# In WSL
bash deploy-to-localnet.sh
```

This will:
- Build your Live Predict contract
- Publish it to the local network  
- Output the new Application ID and Chain ID

### 3. Update Frontend Config

Copy the Application ID and Chain ID from the deploy script output, then update:

**`src/lib/linera.ts`**:
```typescript
export const LINERA_CONFIG = {
  graphqlEndpoint: 'http://localhost:8080',
  applicationId: 'YOUR_NEW_APP_ID_HERE',
  chainId: 'YOUR_NEW_CHAIN_ID_HERE',
};
```

### 4. Start Linera Service

```bash
# In WSL
linera service --port 8080
```

### 5. Test Your dApp

Navigate to `http://localhost:3000` - your dApp should now work with the local network!

## Useful Commands

```bash
# View wallet and chains
linera wallet show

# Stop local network
linera net down

# Restart from scratch
linera net down && bash setup-localnet.sh
```

## Troubleshooting

**"Connection refused" errors**: Make sure `linera service --port 8080` is running

**"Application not found" errors**: Redeploy with `bash deploy-to-localnet.sh`

**Need fresh state?**: Run `linera net down && bash setup-localnet.sh` to reset
