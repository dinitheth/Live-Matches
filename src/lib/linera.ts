// Linera GraphQL Client Integration
// Connects React frontend to Linera Live-Predict smart contract

// Configuration - reads from environment variables or uses defaults for local development
export const LINERA_CONFIG = {
  // GraphQL endpoint - uses environment variable for hosted service, falls back to local
  // Port 8081 is where linera service runs (8080 is the faucet)
  graphqlEndpoint: import.meta.env.VITE_LINERA_ENDPOINT || 'http://localhost:8081',

  // Application and Chain IDs from deployment
  // These are set via environment variables in Docker, or fallback to local values
  applicationId: import.meta.env.VITE_LINERA_APP_ID || 'c313c1749a4604d49a5922ff25ffe0602f759f08104111ffba563ac6ef3299ed',
  chainId: import.meta.env.VITE_LINERA_CHAIN_ID || 'e20b5234a6207b9ad6337454b488199dc54c33feb9469ef2928dca467d1448fa',
};

// Build full GraphQL URL for the application
export function getGraphQLUrl(): string {
  return `${LINERA_CONFIG.graphqlEndpoint}/chains/${LINERA_CONFIG.chainId}/applications/${LINERA_CONFIG.applicationId}`;
}

// Types matching our Rust contract
export interface LineraMarket {
  id: number;
  matchId: string;
  marketType: string;
  title: string;
  options: LineraMarketOption[];
  status: 'OPEN' | 'LOCKED' | 'RESOLVED' | 'CANCELLED';
  createdAt: number;
  locksAt: number;
  winningOption: number | null;
}

export interface LineraMarketOption {
  id: number;
  label: string;
  pool: number;
}

export interface LineraBet {
  id: number;
  owner: string;
  marketId: number;
  optionId: number;
  amount: number;
  odds: number;
  placedAt: number;
  settled: boolean;
  payout: number | null;
}

export interface PotentialPayout {
  odds: number;
  potentialPayout: number;
  feeRate: number;
}

// GraphQL Queries
export const QUERIES = {
  activeMarkets: `
    query GetActiveMarkets {
      active_markets {
        id
        match_id
        market_type
        title
        options {
          id
          label
          pool
        }
        status
        created_at
        locks_at
        winning_option
      }
    }
  `,

  market: `
    query GetMarket($id: Int!) {
      market(id: $id) {
        id
        match_id
        market_type
        title
        options {
          id
          label
          pool
        }
        status
        created_at
        locks_at
        winning_option
      }
    }
  `,

  marketsByMatch: `
    query GetMarketsByMatch($matchId: String!) {
      markets_by_match(match_id: $matchId) {
        id
        match_id
        market_type
        title
        options {
          id
          label
          pool
        }
        status
        created_at
        locks_at
        winning_option
      }
    }
  `,

  balance: `
    query GetBalance($owner: String!) {
      balance(owner: $owner)
    }
  `,

  userBets: `
    query GetUserBets($owner: String!) {
      user_bets(owner: $owner) {
        id
        owner
        market_id
        option_id
        amount
        odds
        placed_at
        settled
        payout
      }
    }
  `,

  marketBets: `
    query GetMarketBets($marketId: Int!) {
      market_bets(market_id: $marketId) {
        id
        owner
        market_id
        option_id
        amount
        odds
        placed_at
        settled
        payout
      }
    }
  `,

  calculatePayout: `
    query CalculatePayout($marketId: Int!, $optionId: Int!, $amount: Int!) {
      calculate_payout(market_id: $marketId, option_id: $optionId, amount: $amount) {
        odds
        potential_payout
        fee_rate
      }
    }
  `,

  totalVolume: `
    query GetTotalVolume {
      total_volume
    }
  `,

  protocolFees: `
    query GetProtocolFees {
      protocol_fees
    }
  `,

  feeRate: `
    query GetFeeRate {
      feeRate
    }
  `,
};

// GraphQL Mutations
export const MUTATIONS = {
  createMarket: `
    mutation CreateMarket($matchId: String!, $marketType: String!, $title: String!, $options: [String!]!, $locksAt: Int!) {
      createMarket(matchId: $matchId, marketType: $marketType, title: $title, options: $options, locksAt: $locksAt)
    }
  `,

  placeBet: `
    mutation PlaceBet($marketId: Int!, $optionId: Int!, $amount: Int!) {
      placeBet(marketId: $marketId, optionId: $optionId, amount: $amount)
    }
  `,

  lockMarket: `
    mutation LockMarket($marketId: Int!) {
      lockMarket(marketId: $marketId)
    }
  `,

  resolveMarket: `
    mutation ResolveMarket($marketId: Int!, $winningOption: Int!) {
      resolveMarket(marketId: $marketId, winningOption: $winningOption)
    }
  `,

  cancelMarket: `
    mutation CancelMarket($marketId: Int!) {
      cancelMarket(marketId: $marketId)
    }
  `,

  claimWinnings: `
    mutation ClaimWinnings($betId: Int!) {
      claimWinnings(betId: $betId)
    }
  `,

  deposit: `
    mutation Deposit($amount: Int!) {
      deposit(amount: $amount)
    }
  `,

  withdraw: `
    mutation Withdraw($amount: Int!) {
      withdraw(amount: $amount)
    }
  `,
};

// Generic GraphQL request function
export async function lineraRequest<T>(
  query: string,
  variables?: Record<string, unknown>
): Promise<T> {
  const url = getGraphQLUrl();

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        variables,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text().catch(() => response.statusText);
      throw new Error(`Linera service error (${response.status}): ${errorText}`);
    }

    const result = await response.json();

    if (result.errors) {
      throw new Error(result.errors[0]?.message || 'GraphQL error');
    }

    return result.data;
  } catch (error) {
    // Provide helpful error messages
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new Error('Linera service timeout - the request took too long. The service may be syncing with validators.');
      }
      if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        throw new Error('Cannot connect to Linera service at localhost:8080. Run: linera service --port 8080');
      }
    }
    throw error;
  }
}

// Transform snake_case GraphQL responses to camelCase TypeScript objects
function transformMarket(raw: any): LineraMarket {
  return {
    id: raw.id,
    matchId: raw.match_id,
    marketType: raw.market_type,
    title: raw.title,
    options: raw.options || [],
    status: raw.status,
    createdAt: raw.created_at,
    locksAt: raw.locks_at,
    winningOption: raw.winning_option,
  };
}

function transformBet(raw: any): LineraBet {
  return {
    id: raw.id,
    owner: raw.owner,
    marketId: raw.market_id,
    optionId: raw.option_id,
    amount: raw.amount,
    odds: raw.odds,
    placedAt: raw.placed_at,
    settled: raw.settled,
    payout: raw.payout,
  };
}

// Convenience API functions
export const lineraApi = {
  // Queries
  async getActiveMarkets(): Promise<LineraMarket[]> {
    const data = await lineraRequest<{ active_markets: any[] }>(QUERIES.activeMarkets);
    return data.active_markets.map(transformMarket);
  },

  async getMarket(id: number): Promise<LineraMarket | null> {
    const data = await lineraRequest<{ market: any | null }>(QUERIES.market, { id });
    return data.market ? transformMarket(data.market) : null;
  },

  async getMarketsByMatch(matchId: string): Promise<LineraMarket[]> {
    const data = await lineraRequest<{ markets_by_match: any[] }>(QUERIES.marketsByMatch, { matchId });
    return data.markets_by_match.map(transformMarket);
  },

  async getBalance(owner: string): Promise<number> {
    const data = await lineraRequest<{ balance: number }>(QUERIES.balance, { owner });
    return data.balance;
  },

  async getUserBets(owner: string): Promise<LineraBet[]> {
    const data = await lineraRequest<{ user_bets: any[] }>(QUERIES.userBets, { owner });
    return data.user_bets.map(transformBet);
  },

  async getMarketBets(marketId: number): Promise<LineraBet[]> {
    const data = await lineraRequest<{ market_bets: any[] }>(QUERIES.marketBets, { marketId });
    return data.market_bets.map(transformBet);
  },

  async calculatePayout(marketId: number, optionId: number, amount: number): Promise<PotentialPayout | null> {
    const data = await lineraRequest<{ calculate_payout: PotentialPayout | null }>(
      QUERIES.calculatePayout,
      { marketId, optionId, amount }
    );
    return data.calculate_payout;
  },

  async getTotalVolume(): Promise<number> {
    const data = await lineraRequest<{ total_volume: number }>(QUERIES.totalVolume);
    return data.total_volume;
  },

  async getProtocolFees(): Promise<number> {
    const data = await lineraRequest<{ protocol_fees: number }>(QUERIES.protocolFees);
    return data.protocol_fees;
  },

  async getFeeRate(): Promise<number> {
    const data = await lineraRequest<{ feeRate: number }>(QUERIES.feeRate);
    return data.feeRate;
  },

  // Mutations
  async createMarket(
    matchId: string,
    marketType: string,
    title: string,
    options: string[],
    locksAt: number
  ): Promise<void> {
    await lineraRequest(MUTATIONS.createMarket, {
      matchId,
      marketType,
      title,
      options,
      locksAt,
    });
  },

  async placeBet(marketId: number, optionId: number, amount: number): Promise<void> {
    await lineraRequest(MUTATIONS.placeBet, { marketId, optionId, amount });
  },

  async lockMarket(marketId: number): Promise<void> {
    await lineraRequest(MUTATIONS.lockMarket, { marketId });
  },

  async resolveMarket(marketId: number, winningOption: number): Promise<void> {
    await lineraRequest(MUTATIONS.resolveMarket, { marketId, winningOption });
  },

  async cancelMarket(marketId: number): Promise<void> {
    await lineraRequest(MUTATIONS.cancelMarket, { marketId });
  },

  async claimWinnings(betId: number): Promise<void> {
    await lineraRequest(MUTATIONS.claimWinnings, { betId });
  },

  async deposit(amount: number): Promise<void> {
    await lineraRequest(MUTATIONS.deposit, { amount });
  },

  async withdraw(amount: number): Promise<void> {
    await lineraRequest(MUTATIONS.withdraw, { amount });
  },
};

export default lineraApi;
