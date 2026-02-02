# Live Predict: Decentralized Esports Betting on Linera - Speaker Script

**Target Audience:** Technical Judges, Developers, and Crypto Enthusiasts
**Tone:** Professional, Transparent, Technical but accessible
**Duration:** Approx. 3-5 minutes

---

## 1. Introduction (0:00 - 0:45)

"Hello everyone! Welcome to the demo of **Live Predict**, a decentralized, real-time esports betting platform built on the **Linera Protocol**.

The problem with current betting platforms is lack of transparency and high fees. We're solving this by building a **fully transparent, on-chain Automated Market Maker (AMM)** for prediction markets.

Today, I’m going to show you how we utilize Linera’s microchain architecture to handle real-time betting updates, walk you through the tech stack, and—most importantly—be completely transparent about the engineering challenges we faced and solved during this build."

---

## 2. The Tech Stack (0:45 - 1:30)

"First, let's look under the hood. This isn't just a simple UI; it's a full-stack dApp integrating Web2 data with Web3 state.

*   **The Blockchain Layer:** We are running a **Linera smart contract** written in **Rust** and compiled to **WebAssembly (WASM)**. This lives in `linera-contracts/live-predict`. It handles market creation, funds management, and the AMM logic for calculating odds.
*   **The Frontend:** We utilize **React 18** with **TypeScript** and **Vite**. UI components are built with **Tailwind CSS** for that sleek, dark-mode 'gaming' aesthetic.
*   **Data Integration:** Real-time match data comes from the **PandaScore API**. We fetch live CS2, Dota 2, and LoL matches directly into the dApp.
*   **State Management:** We use **TanStack Query (React Query)** to handle the complex state synchronization between the blockchain's GraphQL service and our UI.
*   **Wallet:** We integrated the **CheCko Wallet** for signing transactions."

---

## 3. How It Works (The "Happy Path") (1:30 - 2:30)

*(Visual: Show the 'Matches' page with live games)*

"Here's the workflow:
1.  **Data Ingestion:** The frontend queries PandaScore for live matches. You can see currently running games right here.
2.  **Market Creation:** When a user creates a market for a match, we don't just store it in a database. We submit a transaction to the Linera blockchain.
    *(Visual: Click 'Create Market' button)*
3.  **The Transaction:** This triggers the `create_market` operation in our Rust contract. The contract allocates a Market ID and initializes the betting pools.
4.  **Verification:** Once the block is finalized, the GraphQL service updates, and our frontend reflects the new market instantly.
5.  **Betting:** Users place bets, and our AMM algorithm dynamically adjusts the odds based on the pool ratio. Winners claim payouts directly from the smart contract."

---

## 4. Engineering Challenges & "The Bugs" (2:30 - 3:45)

"Now, let's talk about the hard stuff. Building on bleeding-edge tech like Linera came with specific challenges."

### Challenge 1: The GraphQL Schema Mismatch
"This was our biggest headache.
*   **The Issue:** Our Rust smart contract automatically generates a GraphQL schema using **snake_case** field names (like `market_id`, `winning_option`). However, our TypeScript frontend enforces **camelCase** (like `marketId`).
*   **The Symptom:** Markets were being created successfully on-chain, but the UI was completely blank because the data parser was failing silently.
*   **The Fix:** We had to implement a custom **Transformation Layer** in the frontend. We wrote mapping functions that intercept every GraphQL response and convert `snake_case` properties to `camelCase` objects before they hit our React components."

### Challenge 2: The "Time Travel" Error
"We encountered a critical blockchain error: `Operation failed: the block timestamp is in the future`.
*   **The Issue:** Our contract had strict validation specifically checking if the market lock time was in the future relative to the *block time*. Due to slight synchronization differences between the local node and the Docker environment timestamps, valid transactions were being rejected.
*   **The Fix:** We temporarily relaxed the strict timestamp validation in the contract for this MVP demo to ensure smooth market creation functionality."

### Challenge 3: Environment Persistence
"Using Docker Compose for the local Linera network meant our environment variables—specifically the dynamic `CHAIN_ID` and `APP_ID`—were being overwritten every restart. We wrote a custom `run.bash` script to intelligently append these new IDs without wiping our API keys."

---

## 5. What Works vs. What Doesn't (3:45 - 4:45)

"Transparency is key. Here is the current status of the build:

**✅ What is Fully Functional:**
*   **Live Data:** Integration with PandaScore is working perfectly.
*   **Contract Operations:** `Create Market`, `Place Bet`, and `Lock Market` are fully implemented in Rust and deployed.
*   **Wallet Integration:** Signing and funding works via CheCko.
*   **GraphQL Queries:** We are successfully reading complex application state from the chain.

**⚠️ Current Limitations (Future Roadmap):**
*   **Auto-Resolution:** Right now, market resolution is triggered manually. In production, we need a decentralized Oracle to push PandaScore results directly to the chain to settle bets automatically.
*   **Historical Data:** We rely on live chain state. Ideally, we would need an indexer for a permanent historical record of settled bets.
*   **CORS Issues:** We are currently proxying API requests through Vite to bypass browser CORS restrictions on the PandaScore API."

---

## 6. Conclusion (4:45 - 5:00)

"Live Predict demonstrates the power of Linera’s microchains for high-frequency applications like betting. We've built a functional, full-stack dApp that marries Web2 live data with Web3 trustlessness.

Despite the integration heavy-lifting, the result is a platform where **you don't trust the house—you trust the code.**

Thank you for watching!"
