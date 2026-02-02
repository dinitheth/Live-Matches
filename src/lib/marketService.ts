/**
 * Market Service - Bridge between PandaScore matches and Linera markets
 * 
 * This service:
 * 1. Checks if a Linera market exists for a PandaScore match
 * 2. Creates markets on Linera if they don't exist
 * 3. Caches mappings for quick lookups
 */

import lineraApi, { LineraMarket } from '@/lib/linera';
import { Match } from '@/types';

// Cache for match ID to Linera market ID mappings
const marketCache = new Map<string, LineraMarket[]>();

/**
 * Get or create markets for a specific match
 * Returns existing markets from Linera, or creates new ones if none exist
 */
export async function getOrCreateMarketsForMatch(match: Match): Promise<LineraMarket[]> {
    const matchId = match.id;

    // Check cache first
    if (marketCache.has(matchId)) {
        return marketCache.get(matchId)!;
    }

    try {
        // Try to fetch existing markets from Linera
        const existingMarkets = await lineraApi.getMarketsByMatch(matchId);

        if (existingMarkets && existingMarkets.length > 0) {
            marketCache.set(matchId, existingMarkets);
            return existingMarkets;
        }

        // No markets exist - create the main "Match Winner" market
        console.log(`[MarketService] Creating market for match: ${matchId}`);

        const locksAt = match.startTime
            ? Math.floor(new Date(match.startTime).getTime() / 1000)
            : Math.floor(Date.now() / 1000) + 3600; // Default: 1 hour from now

        await lineraApi.createMarket(
            matchId,
            'match_winner',
            `${match.teamA.name} vs ${match.teamB.name} - Match Winner`,
            [match.teamA.name, match.teamB.name],
            locksAt
        );

        // Fetch the newly created market
        const newMarkets = await lineraApi.getMarketsByMatch(matchId);
        marketCache.set(matchId, newMarkets);

        console.log(`[MarketService] Created market for match ${matchId}:`, newMarkets);
        return newMarkets;

    } catch (error) {
        console.error(`[MarketService] Error getting/creating markets for match ${matchId}:`, error);
        // Return empty array on error - UI will handle showing "no markets available"
        return [];
    }
}

/**
 * Get markets for a match (without creating new ones)
 * Use this when you just want to check if markets exist
 */
export async function getMarketsForMatch(matchId: string): Promise<LineraMarket[]> {
    // Check cache first
    if (marketCache.has(matchId)) {
        return marketCache.get(matchId)!;
    }

    try {
        const markets = await lineraApi.getMarketsByMatch(matchId);
        if (markets && markets.length > 0) {
            marketCache.set(matchId, markets);
        }
        return markets || [];
    } catch (error) {
        console.error(`[MarketService] Error fetching markets for match ${matchId}:`, error);
        return [];
    }
}

/**
 * Clear cache for a specific match (use after creating new markets)
 */
export function clearMarketCache(matchId?: string) {
    if (matchId) {
        marketCache.delete(matchId);
    } else {
        marketCache.clear();
    }
}

/**
 * Create a market for a match
 * Returns the newly created market's ID
 */
export async function createMarketForMatch(
    matchId: string,
    marketType: string,
    title: string,
    options: string[],
    locksAt: number
): Promise<void> {
    await lineraApi.createMarket(matchId, marketType, title, options, locksAt);
    // Clear cache so next fetch gets fresh data
    clearMarketCache(matchId);
}

export default {
    getOrCreateMarketsForMatch,
    getMarketsForMatch,
    clearMarketCache,
    createMarketForMatch,
};
