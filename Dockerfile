FROM rust:1.86-slim

SHELL ["bash", "-c"]

# Install system dependencies
RUN apt-get update && apt-get install -y \
    pkg-config \
    protobuf-compiler \
    clang \
    make \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Linera CLI (version 0.15.5 as required by buildathon)
RUN cargo install --locked linera-service@0.15.5 linera-storage-service@0.15.5

# Install wasm32-unknown-unknown target for contract compilation
RUN rustup target add wasm32-unknown-unknown

# Install Node.js and pnpm for frontend
RUN curl https://raw.githubusercontent.com/creationix/nvm/v0.40.3/install.sh | bash \
    && . ~/.nvm/nvm.sh \
    && nvm install lts/krypton \
    && npm install -g pnpm

# Set working directory
WORKDIR /build

# Healthcheck - wait for frontend to be ready
HEALTHCHECK CMD ["curl", "-s", "http://localhost:5173"]

# Run the build and start script
ENTRYPOINT bash /build/run.bash
