# Linera Backend - DigitalOcean Deployment Guide

This guide will help you deploy the Linera service to a DigitalOcean Droplet using Docker.

## Prerequisites

1. **Create a Droplet** on DigitalOcean
   - Image: Docker (under Marketplace) or Ubuntu 22.04
   - Size: Basic Regular ($6/mo or higher recommended for 1GB+ RAM)
   - Region: Any

2. **Prepare Files** (Local Machine)
   ensure you have the following files in `linera-backend/`:
   - `Dockerfile`
   - `docker-compose.yml`
   - `start.sh`
   - `wallet.json` (Copy from your local Linera setup)
   - `linera.toml` (Copy from your local Linera setup)

## Deployment Steps

### 1. Copy Files to Droplet
Replace `root@your-droplet-ip` with your actual Droplet IP address.

```bash
# Verify you are in the project root
cd G:\linera-real-time-forge

# Copy the linera-backend directory to the server
scp -r linera-backend root@your-droplet-ip:/root/
```

### 2. Connect to Droplet via SSH

```bash
ssh root@your-droplet-ip
```

### 3. Start the Service

On the remote server:

```bash
cd linera-backend

# Build and start the container
docker-compose up -d --build

# Check logs to ensure it started correctly
docker-compose logs -f
```

### 4. Verify Access

Test the endpoint from your browser or curl:
`http://your-droplet-ip:8080`

### 5. Update Frontend

Update your local `.env` file with the new IP:

```
VITE_LINERA_ENDPOINT=http://your-droplet-ip:8080
```

*Note: For production, you should set up Nginx + LetsEncrypt for HTTPS, but HTTP is fine for testing.*
