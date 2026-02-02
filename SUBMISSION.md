# Live Predict - Submission Documentation

## Project Overview

**Live Predict** is a decentralized prediction market platform built on Linera blockchain for real-time esports betting.

### Key Features:
- Real-time match data integration via PandaScore API
- Decentralized betting markets on Linera blockchain
- Dynamic odds calculation based on pool distribution
- Secure smart contract for bet management and payouts

---

## Linera SDK Features Used

### 1. **Smart Contract Development**
- Rust-based contract with state management
- Custom types for Markets, Bets, and Options
- Application state persistence on-chain

### 2. **GraphQL API Integration**
- **Queries**: `activeMarkets`, `userBets`, `calculatePayout`, `balance`
- **Mutations**: `createMarket`, `placeBet`, `resolveMarket`, `claimWinnings`
- Full CRUD operations via GraphQL endpoint

### 3. **Local Network Development**
- Complete localnet setup with validators
- Faucet integration for wallet initialization
- Dockerized deployment for reproducibility

### 4. **Frontend Integration**
- TypeScript client connecting to Linera GraphQL
- Real-time market updates
- Wallet integration for transactions

---

## Architecture

```
┌─────────────┐      ┌──────────────┐      ┌─────────────┐
│  Frontend   │─────▶│   Linera     │─────▶│   Smart     │
│  (React)    │      │   Service    │      │   Contract  │
│             │◀─────│  (GraphQL)   │◀─────│   (Rust)    │
└─────────────┘      └──────────────┘      └─────────────┘
       │                                           │
       │                                           ▼
       ▼                                    ┌─────────────┐
┌─────────────┐                             │  Linera    │  
│  PandaScore │                             │ Blockchain  │
│     API     │                             └─────────────┘
└─────────────┘
```

---

## Team Information

**Team Name**: [Your Team Name]

**Members**:
- [Name] - Discord: [username#0000] - Wallet: [address]
- [Name] - Discord: [username#0000] - Wallet: [address]

---

## Changelog

### Wave 1 (Initial Submission)
- ✅ Live Predict smart contract implementation
- ✅ GraphQL API for markets and betting
- ✅ Frontend with real-time match integration
- ✅ Docker deployment template
- ✅ Localnet testing setup

---

## Technical Highlights

### Smart Contract Features:
- **Market Creation**: Dynamic market generation for esports matches
- **Betting Logic**: Parimutuel betting with dynamic odds
- **Automated Resolution**: Market settlement with winner payouts
- **Fee Management**: Protocol fee collection (1%)

### Frontend Features:
- **Live Match Display**: Real-time esports data
- **Bet Placement UI**: Intuitive betting interface
- **Portfolio Tracking**: User bet history and winnings
- **Responsive Design**: Mobile-friendly interface

---

## License

MIT License - Open source and properly credited
