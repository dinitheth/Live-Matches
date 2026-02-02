// React hooks for Linera integration
// Uses TanStack Query for data fetching and caching

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import lineraApi, { LineraMarket, LineraBet, PotentialPayout } from '@/lib/linera';

// Query keys for TanStack Query
export const lineraKeys = {
    all: ['linera'] as const,
    activeMarkets: () => [...lineraKeys.all, 'activeMarkets'] as const,
    market: (id: number) => [...lineraKeys.all, 'market', id] as const,
    marketsByMatch: (matchId: string) => [...lineraKeys.all, 'marketsByMatch', matchId] as const,
    balance: (owner: string) => [...lineraKeys.all, 'balance', owner] as const,
    userBets: (owner: string) => [...lineraKeys.all, 'userBets', owner] as const,
    marketBets: (marketId: number) => [...lineraKeys.all, 'marketBets', marketId] as const,
    totalVolume: () => [...lineraKeys.all, 'totalVolume'] as const,
    protocolFees: () => [...lineraKeys.all, 'protocolFees'] as const,
    feeRate: () => [...lineraKeys.all, 'feeRate'] as const,
};

// Query Hooks
export function useActiveMarkets() {
    return useQuery({
        queryKey: lineraKeys.activeMarkets(),
        queryFn: () => lineraApi.getActiveMarkets(),
        refetchInterval: 5000, // Refresh every 5 seconds for live updates
    });
}

export function useMarket(id: number) {
    return useQuery({
        queryKey: lineraKeys.market(id),
        queryFn: () => lineraApi.getMarket(id),
        enabled: id > 0,
    });
}

export function useMarketsByMatch(matchId: string) {
    return useQuery({
        queryKey: lineraKeys.marketsByMatch(matchId),
        queryFn: () => lineraApi.getMarketsByMatch(matchId),
        enabled: !!matchId,
        refetchInterval: 5000,
    });
}

export function useLineraBalance(owner: string) {
    return useQuery({
        queryKey: lineraKeys.balance(owner),
        queryFn: () => lineraApi.getBalance(owner),
        enabled: !!owner,
        refetchInterval: 10000,
    });
}

export function useUserBets(owner: string) {
    return useQuery({
        queryKey: lineraKeys.userBets(owner),
        queryFn: () => lineraApi.getUserBets(owner),
        enabled: !!owner,
        refetchInterval: 10000,
    });
}

export function useMarketBets(marketId: number) {
    return useQuery({
        queryKey: lineraKeys.marketBets(marketId),
        queryFn: () => lineraApi.getMarketBets(marketId),
        enabled: marketId > 0,
        refetchInterval: 5000,
    });
}

export function useTotalVolume() {
    return useQuery({
        queryKey: lineraKeys.totalVolume(),
        queryFn: () => lineraApi.getTotalVolume(),
        refetchInterval: 30000,
    });
}

export function useProtocolFees() {
    return useQuery({
        queryKey: lineraKeys.protocolFees(),
        queryFn: () => lineraApi.getProtocolFees(),
        refetchInterval: 30000,
    });
}

export function useFeeRate() {
    return useQuery({
        queryKey: lineraKeys.feeRate(),
        queryFn: () => lineraApi.getFeeRate(),
        staleTime: Infinity, // Fee rate doesn't change
    });
}

// Mutation Hooks
export function usePlaceBet() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ marketId, optionId, amount }: { marketId: number; optionId: number; amount: number }) =>
            lineraApi.placeBet(marketId, optionId, amount),
        onSuccess: () => {
            // Invalidate relevant queries after placing a bet
            queryClient.invalidateQueries({ queryKey: lineraKeys.activeMarkets() });
            queryClient.invalidateQueries({ queryKey: lineraKeys.all });
        },
    });
}

export function useCreateMarket() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            matchId,
            marketType,
            title,
            options,
            locksAt,
        }: {
            matchId: string;
            marketType: string;
            title: string;
            options: string[];
            locksAt: number;
        }) => lineraApi.createMarket(matchId, marketType, title, options, locksAt),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: lineraKeys.activeMarkets() });
        },
    });
}

export function useLockMarket() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (marketId: number) => lineraApi.lockMarket(marketId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: lineraKeys.activeMarkets() });
        },
    });
}

export function useResolveMarket() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ marketId, winningOption }: { marketId: number; winningOption: number }) =>
            lineraApi.resolveMarket(marketId, winningOption),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: lineraKeys.all });
        },
    });
}

export function useCancelMarket() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (marketId: number) => lineraApi.cancelMarket(marketId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: lineraKeys.all });
        },
    });
}

export function useClaimWinnings() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (betId: number) => lineraApi.claimWinnings(betId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: lineraKeys.all });
        },
    });
}

export function useDeposit() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (amount: number) => lineraApi.deposit(amount),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: lineraKeys.all });
        },
    });
}

export function useWithdraw() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (amount: number) => lineraApi.withdraw(amount),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: lineraKeys.all });
        },
    });
}

// Calculate potential payout (non-reactive, call directly)
export async function calculatePotentialPayout(
    marketId: number,
    optionId: number,
    amount: number
): Promise<PotentialPayout | null> {
    return lineraApi.calculatePayout(marketId, optionId, amount);
}
