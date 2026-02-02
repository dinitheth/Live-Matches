# Linera Backend Service for Railway Deployment
# This Dockerfile creates a container that runs the Linera service

FROM ubuntu:22.04

# Install dependencies
RUN apt-get update && apt-get install -y \
    curl \
    git \
    build-essential \
    pkg-config \
    libssl-dev \
    protobuf-compiler \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Install Rust
RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
ENV PATH="/root/.cargo/bin:${PATH}"

# Install Linera CLI
RUN cargo install linera-service --git https://github.com/linera-io/linera-protocol.git --tag v0.12.1

# Create working directory
WORKDIR /app

# Copy wallet configuration
COPY wallet.json /root/.config/linera/wallet.json
COPY linera.toml /root/.config/linera/linera.toml

# Copy startup script
COPY start.sh /app/start.sh
RUN chmod +x /app/start.sh

# Expose the GraphQL port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:8080/ || exit 1

# Start the Linera service
CMD ["/app/start.sh"]
