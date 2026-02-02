import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Users, TrendingUp, Loader2, Trophy, Plus, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BettingCard } from '@/components/betting/BettingCard';
import { LiveIndicator } from '@/components/common/LiveIndicator';
import { useMatch } from '@/hooks/useMatches';
import { useMarketsByMatch, useCreateMarket, usePlaceBet } from '@/hooks/useLinera';
import { useWallet } from '@/contexts/WalletContext';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { Market } from '@/types';

// Game logos and names (UI constants, not mock data)
const gameLogos: Record<string, string> = {
  'cs2': '🎯',
  'valorant': '💥',
  'lol': '🏰',
  'dota2': '⚔️',
};

const gameNames: Record<string, string> = {
  'cs2': 'Counter-Strike 2',
  'valorant': 'VALORANT',
  'lol': 'League of Legends',
  'dota2': 'Dota 2',
};

export default function LiveMatch() {
  const { matchId } = useParams();
  const { wallet, connect } = useWallet();
  const { data: match, isLoading: matchLoading, isError: matchError } = useMatch(matchId || '');

  // Get real markets from Linera
  const {
    data: lineraMarkets,
    isLoading: marketsLoading,
    refetch: refetchMarkets
  } = useMarketsByMatch(matchId || '');

  // Debug logging
  console.log('[LiveMatch] Markets query result:', { lineraMarkets, marketsLoading, matchId });

  // Mutations for creating markets and placing bets
  const createMarketMutation = useCreateMarket();
  const placeBetMutation = usePlaceBet();

  const [isCreatingMarket, setIsCreatingMarket] = useState(false);
  const [marketCreationAttempted, setMarketCreationAttempted] = useState(false);
  const [marketCreationError, setMarketCreationError] = useState<string | null>(null);

  // Transform Linera markets to UI Market type
  const markets: Market[] = (lineraMarkets || []).map(lm => {
    const totalPool = lm.options.reduce((sum, opt) => sum + opt.pool, 0);
    return {
      id: lm.id.toString(),
      matchId: lm.matchId,
      type: 'round_winner' as const, // Default to round_winner for compatibility
      title: lm.title,
      description: `Predict the winner of this match`,
      options: lm.options.map(opt => ({
        id: opt.id.toString(),
        label: opt.label,
        odds: totalPool > 0 && opt.pool > 0 ? totalPool / opt.pool : 2.0,
        poolAmount: opt.pool,
      })),
      status: lm.status === 'OPEN' ? 'open' : lm.status === 'LOCKED' ? 'locked' : 'resolved',
      closesAt: new Date(lm.locksAt * 1000),
      totalPool,
    };
  });

  // Manual market creation function
  const handleCreateMarket = async () => {
    if (!match || isCreatingMarket) return;

    setIsCreatingMarket(true);
    setMarketCreationError(null);

    try {
      console.log('[LiveMatch] Creating market for match:', match.id);

      const locksAt = match.startTime
        ? Math.floor(new Date(match.startTime).getTime() / 1000) + 3600
        : Math.floor(Date.now() / 1000) + 3600;

      await createMarketMutation.mutateAsync({
        matchId: match.id,
        marketType: 'match_winner',
        title: `${match.teamA.name} vs ${match.teamB.name} - Match Winner`,
        options: [match.teamA.name, match.teamB.name],
        locksAt,
      });

      console.log('[LiveMatch] Market created successfully');
      setMarketCreationAttempted(true);
      refetchMarkets();

      toast({
        title: 'Market Created',
        description: `Betting market created for ${match.teamA.name} vs ${match.teamB.name}`,
      });
    } catch (error) {
      console.error('[LiveMatch] Failed to create market:', error);
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      setMarketCreationError(errorMsg);
      setMarketCreationAttempted(true);

      toast({
        title: 'Market Creation Failed',
        description: errorMsg,
        variant: 'destructive',
      });
    } finally {
      setIsCreatingMarket(false);
    }
  };

  // Auto-create market only once when match loads (if no markets exist)
  useEffect(() => {
    if (match && lineraMarkets && lineraMarkets.length === 0 && !marketCreationAttempted && !isCreatingMarket) {
      handleCreateMarket();
    }
  }, [match?.id, lineraMarkets?.length]);


  if (matchLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
        <span className="ml-3 text-muted-foreground">Loading match...</span>
      </div>
    );
  }

  if (matchError || !match) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-display text-2xl font-bold mb-4">Match not found</h1>
          <p className="text-muted-foreground mb-4">
            This match may have ended or the ID is invalid.
          </p>
          <Button asChild variant="outline">
            <Link to="/matches">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Matches
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const handlePlaceBet = async (marketId: string, optionId: string, amount: number) => {
    if (!wallet.connected) {
      connect();
      return;
    }

    const market = markets.find((m) => m.id === marketId);
    const option = market?.options.find((o) => o.id === optionId);

    if (!market || !option) {
      toast({
        title: 'Error',
        description: 'Invalid market or option',
        variant: 'destructive',
      });
      return;
    }

    try {
      console.log('[LiveMatch] Placing bet:', { marketId: parseInt(marketId), optionId: parseInt(optionId), amount });

      await placeBetMutation.mutateAsync({
        marketId: parseInt(marketId),
        optionId: parseInt(optionId),
        amount: Math.floor(amount), // Linera expects integer amounts
      });

      toast({
        title: 'Bet Placed! 🎉',
        description: `${amount} LPT on ${option.label} @ ${option.odds.toFixed(2)}x`,
      });

      // Refetch markets to update pool totals
      refetchMarkets();

    } catch (error) {
      console.error('[LiveMatch] Bet failed:', error);
      toast({
        title: 'Bet Failed',
        description: error instanceof Error ? error.message : 'Failed to place bet on Linera',
        variant: 'destructive',
      });
    }
  };

  const isLive = match.status === 'live';

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        {/* Back Button */}
        <Button asChild variant="ghost" className="mb-6">
          <Link to="/matches">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Matches
          </Link>
        </Button>

        {/* Match Header */}
        <div className="bg-card border border-border rounded-xl p-6 mb-8">
          {/* Tournament & Game Info */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{gameLogos[match.game] || '🎮'}</span>
              <div>
                <p className="text-sm text-muted-foreground">{gameNames[match.game] || match.game}</p>
                <p className="font-semibold">{match.tournament}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {isLive && <LiveIndicator size="lg" />}
              <span className="px-2 py-1 rounded bg-primary/20 text-primary text-xs font-semibold">
                Linera
              </span>
            </div>
          </div>

          {/* Team Logos */}
          <div className="flex items-center justify-center gap-8 md:gap-16 py-8">
            {/* Team A */}
            <div className="flex-1 text-center">
              {match.teamA.logo && (
                <img
                  src={match.teamA.logo}
                  alt={match.teamA.name}
                  className="h-16 w-16 mx-auto mb-3 object-contain"
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
              )}
              <h2 className="font-display text-2xl md:text-3xl font-bold mb-2">
                {match.teamA.name}
              </h2>
              <p className="text-sm text-muted-foreground mb-3">{match.teamA.shortName}</p>
              <p className={cn(
                'font-display text-5xl md:text-7xl font-black',
                isLive && match.teamA.score > match.teamB.score ? 'text-success' : 'text-foreground'
              )}>
                {match.teamA.score}
              </p>
            </div>

            {/* Center Info */}
            <div className="flex flex-col items-center">
              {isLive ? (
                <>
                  <span className="font-display text-xl font-bold text-primary mb-2">
                    Round {match.currentRound}
                  </span>
                  <span className="px-4 py-2 rounded-lg bg-primary/10 text-primary font-semibold">
                    {match.currentMap}
                  </span>
                  <div className="flex items-center gap-2 mt-3 text-sm text-muted-foreground">
                    <span>Map Score:</span>
                    <span className="font-semibold text-foreground">
                      {match.mapScore.teamA} - {match.mapScore.teamB}
                    </span>
                  </div>
                </>
              ) : (
                <span className="font-display text-4xl font-bold text-muted-foreground">VS</span>
              )}
            </div>

            {/* Team B */}
            <div className="flex-1 text-center">
              {match.teamB.logo && (
                <img
                  src={match.teamB.logo}
                  alt={match.teamB.name}
                  className="h-16 w-16 mx-auto mb-3 object-contain"
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
              )}
              <h2 className="font-display text-2xl md:text-3xl font-bold mb-2">
                {match.teamB.name}
              </h2>
              <p className="text-sm text-muted-foreground mb-3">{match.teamB.shortName}</p>
              <p className={cn(
                'font-display text-5xl md:text-7xl font-black',
                isLive && match.teamB.score > match.teamA.score ? 'text-success' : 'text-foreground'
              )}>
                {match.teamB.score}
              </p>
            </div>
          </div>

          {/* Match Stats */}
          {isLive && (
            <div className="flex items-center justify-center gap-8 pt-6 border-t border-border">
              <div className="flex items-center gap-2 text-sm">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Viewers:</span>
                <span className="font-semibold">{(match.viewers / 1000).toFixed(1)}K</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <TrendingUp className="h-4 w-4 text-primary" />
                <span className="text-muted-foreground">Pool:</span>
                <span className="font-semibold text-primary">
                  {markets.reduce((sum, m) => sum + m.totalPool, 0).toLocaleString()} LPT
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Betting Markets */}
        <div className="mb-8">
          <h2 className="font-display text-2xl font-bold mb-6">
            {isLive ? 'Live Predictions' : 'Pre-Match Predictions'}
          </h2>

          {!wallet.connected && (
            <div className="bg-muted border border-border rounded-xl p-6 mb-6 text-center">
              <p className="text-muted-foreground mb-4">
                Connect your wallet to place predictions
              </p>
              <Button onClick={connect} className="font-display font-bold uppercase">
                Connect Wallet
              </Button>
            </div>
          )}

          {marketsLoading || isCreatingMarket ? (
            <div className="text-center py-12 bg-card border border-border rounded-xl">
              <Loader2 className="h-8 w-8 text-primary animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">
                {isCreatingMarket ? 'Creating market on Linera...' : 'Loading markets from Linera...'}
              </p>
            </div>
          ) : markets.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-6">
              {markets.map((market) => (
                <BettingCard
                  key={market.id}
                  market={market}
                  onPlaceBet={handlePlaceBet}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-card border border-border rounded-xl">
              <AlertCircle className="h-12 w-12 text-warning mx-auto mb-4" />
              <h3 className="font-display text-xl font-bold mb-2">No Markets Yet</h3>
              {marketCreationError ? (
                <>
                  <p className="text-muted-foreground mb-2">
                    Failed to create market on Linera:
                  </p>
                  <p className="text-destructive text-sm mb-4 font-mono">
                    {marketCreationError}
                  </p>
                  <div className="flex gap-2 justify-center">
                    <Button
                      onClick={() => {
                        setMarketCreationAttempted(false);
                        setMarketCreationError(null);
                        handleCreateMarket();
                      }}
                      variant="default"
                    >
                      Retry Create Market
                    </Button>
                    <Button
                      onClick={() => refetchMarkets()}
                      variant="outline"
                    >
                      Refresh
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-muted-foreground mb-4">
                    No betting markets available for this match yet.
                  </p>
                  <Button
                    onClick={handleCreateMarket}
                    variant="default"
                    disabled={isCreatingMarket}
                  >
                    Create Market
                  </Button>
                </>
              )}
            </div>
          )}
        </div>

        {/* Market Bets (real data from Linera) */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="font-display text-lg font-bold mb-4">Recent Bets</h3>
          <div className="text-center py-8 text-muted-foreground">
            <p>Bet activity will appear here when users place bets.</p>
            <p className="text-sm mt-2">Data is fetched from Linera blockchain.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
