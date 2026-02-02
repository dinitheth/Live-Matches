# Live Predict - Decentralized Esports Betting Platform

A decentralized application (dApp) built on the Linera blockchain that enables real-time betting on esports matches with live data from the PandaScore API.

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Current Implementation Status](#current-implementation-status)
- [Technology Stack](#technology-stack)
- [Prerequisites](#prerequisites)
- [Installation and Setup](#installation-and-setup)
- [Usage](#usage)
- [Project Structure](#project-structure)
- [Known Issues](#known-issues)
- [Development Notes](#development-notes)
- [Contributing](#contributing)

## Overview

Live Predict is a blockchain-based prediction market platform for esports betting. Users can create markets for ongoing esports matches, place bets on match outcomes, and claim winnings when markets resolve. The platform fetches live match data from PandaScore API and maintains betting markets on the Linera blockchain.

### Key Features

- Real-time esports match data integration via PandaScore API
- Decentralized betting markets on Linera blockchain
- Support for multiple esports titles (CS2, Valorant, League of Legends, Dota 2)
- Automated market resolution
- Transparent odds calculation using Automated Market Maker (AMM) logic
- CheCko wallet integration for blockchain transactions

## Architecture

### System Components

1. **Frontend (React + TypeScript + Vite)**
   - User interface for viewing matches and betting
   - React Query for data fetching and caching
   - CheCko wallet integration for blockchain interactions
   - Real-time match data display

2. **Linera Smart Contract (Rust)**
   - Market creation and management
   - Bet placement and tracking
   - Odds calculation using constant product AMM
   - Market resolution and payout distribution
   - Balance management

3. **PandaScore API Integration**
   - Live match data fetching
   - Tournament and team information
   - Match status updates

4. **GraphQL Service**
   - Exposes contract state via GraphQL API
   - Query interface for markets and bets
   - Mutation interface for blockchain operations

### Data Flow

```
┌─────────────┐         ┌──────────────┐         ┌─────────────────┐
│  PandaScore │────────>│   Frontend   │────────>│  Linera Contract│
│     API     │  Match  │  (React UI)  │ GraphQL │   (Rust WASM)   │
└─────────────┘  Data   └──────────────┘         └─────────────────┘
                              │                           │
                              │                           │
                              v                           v
                        ┌──────────┐              ┌──────────────┐
                        │  CheCko  │              │   Blockchain │
                        │  Wallet  │              │    Storage   │
                        └──────────┘              └──────────────┘
```

## Current Implementation Status

### Functional Features

#### Contract Level (Fully Implemented)
- Market creation with customizable options
- Bet placement with automatic odds calculation
- Market status management (OPEN, LOCKED, RESOLVED, CANCELLED)
- Constant product AMM for fair odds
- Fee collection mechanism (1% protocol fee)
- Balance tracking and management
- Market resolution with winner selection
- Automated payout calculation
- Market cancellation with refunds

#### Frontend (Fully Implemented)
- Live match browsing from PandaScore API
- Match filtering by game type
- Match detail pages with team statistics
- Market creation interface
- Betting interface with odds display
- Wallet connection via CheCko
- Balance display
- Transaction status notifications

### Non-Functional/Incomplete Features

#### Backend/Infrastructure
- **Supabase Edge Function**: Implemented but requires API key configuration in Supabase dashboard for production deployment
- **Market Auto-Resolution**: Logic exists in contract but requires external oracle/trigger service
- **Historical Data Persistence**: No permanent storage of resolved markets beyond blockchain state

#### Frontend
- **Bet History Display**: UI exists but may have data transformation issues
- **Market Statistics**: Limited aggregated statistics display
- **User Portfolio**: No comprehensive view of all user positions
- **Live Updates**: Polling-based rather than WebSocket/real-time

#### Known Bugs/Limitations
- **Timestamp Validation**: Contract timestamp validation disabled due to blockchain clock synchronization issues
- **GraphQL Response Mapping**: Snake_case to camelCase transformation required due to Rust/TypeScript naming conventions
- **Docker Environment Variables**: `.env` file management needs improvement to prevent overwrites
- **CORS Issues**: Direct PandaScore API calls require Vite proxy configuration

### Working Components

1. **Match Data Fetching**: Successfully retrieves live and upcoming matches from PandaScore
2. **Market Creation**: Users can create betting markets on blockchain
3. **Bet Placement**: Functional bet submission with CheCko wallet
4. **Odds Calculation**: Automated market maker calculates fair odds
5. **GraphQL API**: Contract state accessible via GraphQL queries
6. **Wallet Integration**: CheCko wallet connects and signs transactions
7. **Docker Deployment**: Full stack runs in containerized environment

### Non-Working/Problematic Components

1. **Market Display**: Transformation layer between GraphQL (snake_case) and TypeScript (camelCase) may need verification
2. **Timestamp Synchronization**: Blockchain timestamp validation causes market creation failures
3. **Auto-Resolution**: No automated service to resolve markets when matches end
4. **Production Deployment**: Not configured for public deployment (local development only)
5. **User Balance Sync**: May require manual refresh to update after transactions

## Technology Stack

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type-safe JavaScript
- **Vite** - Build tool and dev server
- **TanStack Query (React Query)** - Data fetching and caching
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Icon library

### Blockchain
- **Linera Protocol** - Microchain blockchain platform
- **Rust** - Smart contract language
- **WebAssembly (WASM)** - Contract compilation target
- **GraphQL** - Contract query interface

### External Services
- **PandaScore API** - Esports match data
- **CheCko Wallet** - Linera wallet browser extension
- **Docker** - Containerization

## Prerequisites

- **Docker Desktop** (Windows/Mac) or Docker Engine (Linux)
- **Docker Compose** v2.0+
- **Node.js** 18+ (for local development outside Docker)
- **CheCko Wallet** browser extension
- **PandaScore API Key** (get from https://developers.pandascore.co/)

## Installation and Setup

### 1. Clone Repository

```bash
git clone https://github.com/dinitheth/Live-Matches.git
cd Live-Matches
```

### 2. Configure Environment Variables

Create/update `.env` file in project root:

```env
# Supabase Configuration (Optional - for production)
VITE_SUPABASE_PROJECT_ID=your_project_id
VITE_SUPABASE_PUBLISHABLE_KEY=your_publishable_key
VITE_SUPABASE_URL=https://your-project.supabase.co

# PandaScore API (Required)
PANDASCORE_API_KEY=your_pandascore_api_key
VITE_PANDASCORE_API_KEY=your_pandascore_api_key

# Linera Configuration (Auto-generated by Docker)
VITE_LINERA_ENDPOINT=http://localhost:8081
VITE_LINERA_APP_ID=auto_generated_on_deployment
VITE_LINERA_CHAIN_ID=auto_generated_on_deployment
```

**Important**: The Linera configuration values are automatically set during Docker deployment. Do not manually edit these values unless you know the correct Application ID and Chain ID from your deployment.

### 3. Start the Application

```bash
docker compose up --build
```

This will:
1. Build the Linera smart contract
2. Deploy contract to local Linera network
3. Start the GraphQL service on port 8081
4. Start the frontend development server on port 5173
5. Configure environment variables automatically

### 4. Access the Application

- **Frontend**: http://localhost:5173
- **GraphQL API**: http://localhost:8081
- **Faucet Service**: http://localhost:8080

### 5. Install CheCko Wallet

1. Install CheCko browser extension
2. Create or import a wallet
3. Connect to local Linera network
4. Request test tokens from faucet if needed

## Usage

### Creating a Market

1. Navigate to the Matches page
2. Click on any live or upcoming match
3. Click "Create Market" button
4. Confirm transaction in CheCko wallet
5. Wait for market to be created on blockchain

### Placing a Bet

1. View any match with active markets
2. Select your prediction from available options
3. Enter bet amount
4. Confirm odds and potential payout
5. Submit bet via CheCko wallet
6. Wait for transaction confirmation

### Viewing Markets

- **Live Markets**: Shows all currently open betting markets
- **Match Markets**: Filter markets by specific match
- **User Bets**: View your betting history (if implemented)

## Project Structure

```
linera-real-time-forge/
├── linera-contracts/
│   └── live-predict/
│       ├── src/
│       │   ├── contract.rs      # Core contract logic
│       │   ├── service.rs       # GraphQL service
│       │   ├── state.rs         # Blockchain state management
│       │   └── lib.rs           # Type definitions and ABI
│       └── Cargo.toml
├── src/
│   ├── components/              # React components
│   ├── hooks/                   # React hooks
│   │   ├── useMatches.ts        # PandaScore API integration
│   │   └── useLinera.ts         # Linera blockchain hooks
│   ├── lib/
│   │   ├── linera.ts            # GraphQL client and API
│   │   └── checko.ts            # Wallet integration
│   ├── pages/                   # Page components
│   └── types/                   # TypeScript type definitions
├── supabase/
│   └── functions/
│       └── esports-data/        # Supabase Edge Function (optional)
├── compose.yaml                 # Docker Compose configuration
├── run.bash                     # Contract deployment script
├── Dockerfile                   # Container definition
└── vite.config.ts              # Vite configuration
```

## Known Issues

### Critical Issues

1. **Timestamp Synchronization**
   - **Problem**: Blockchain rejects operations with "block timestamp is in the future" error
   - **Cause**: Strict timestamp validation in contract vs. blockchain clock sync
   - **Workaround**: Timestamp validation disabled in contract
   - **Impact**: Markets can be created with any lock time

2. **GraphQL Field Name Mismatch**
   - **Problem**: Rust contracts use snake_case, TypeScript expects camelCase
   - **Solution**: Transformation layer implemented to convert responses
   - **Impact**: May cause display issues if transformation fails

3. **Environment Variable Persistence**
   - **Problem**: Docker deployment overwrites `.env` file
   - **Solution**: Script now preserves non-Linera variables
   - **Impact**: Requires manual restoration of API keys after first run

### Non-Critical Issues

1. **Market Auto-Resolution**
   - Markets must be manually resolved by contract admin
   - No automated oracle service implemented

2. **Limited Error Handling**
   - Some blockchain errors not user-friendly
   - Transaction failures may require manual investigation

3. **Performance**
   - GraphQL queries refetch every 5 seconds
   - No WebSocket support for real-time updates

4. **CORS Configuration**
   - Direct PandaScore API calls blocked by CORS
   - Requires Vite proxy or Supabase Edge Function

## Development Notes

### Smart Contract Development

To rebuild contract after changes:

```bash
docker compose up --build
```

Contract is automatically deployed to local Linera network on startup.

### Frontend Development

For hot-reload development without Docker:

```bash
npm install
npm run dev
```

Ensure Docker containers are running for blockchain access.

### GraphQL Schema

Access GraphiQL interface at:
```
http://localhost:8081/chains/{CHAIN_ID}/applications/{APP_ID}
```

Replace `{CHAIN_ID}` and `{APP_ID}` with values from `.env` file.

### Adding New Market Types

1. Update `MarketType` enum in `lib.rs`
2. Implement validation in `contract.rs`
3. Add UI support in frontend
4. Update GraphQL queries if needed

## Contributing

This project was developed for the Linera buildathon. Contributions are welcome for:

- Bug fixes
- Performance improvements
- Additional market types
- UI/UX enhancements
- Documentation improvements

## License

MIT License - see LICENSE file for details

## Acknowledgments

- Linera Protocol team for blockchain infrastructure
- PandaScore for esports data API
- Buildathon organizers and community

## Contact

For questions or support, please open an issue on GitHub.

---

**Note**: This is a development version intended for local testing and buildathon demonstration. Not recommended for production use without additional security audits and infrastructure improvements.
