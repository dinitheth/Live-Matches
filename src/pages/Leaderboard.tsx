import { Trophy, TrendingUp, Target, Medal, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTotalVolume, useActiveMarkets } from '@/hooks/useLinera';

export default function Leaderboard() {
  const { data: totalVolume, isLoading: volumeLoading } = useTotalVolume();
  const { data: markets, isLoading: marketsLoading } = useActiveMarkets();

  const getRankStyle = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-500/20 to-yellow-600/10 border-yellow-500/50';
      case 2:
        return 'bg-gradient-to-r from-gray-400/20 to-gray-500/10 border-gray-400/50';
      case 3:
        return 'bg-gradient-to-r from-orange-600/20 to-orange-700/10 border-orange-600/50';
      default:
        return 'bg-card border-border';
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-6 w-6 text-yellow-500" />;
      case 2:
        return <Medal className="h-6 w-6 text-gray-400" />;
      case 3:
        return <Medal className="h-6 w-6 text-orange-600" />;
      default:
        return <span className="font-display text-lg font-bold text-muted-foreground">{rank}</span>;
    }
  };

  const isLoading = volumeLoading || marketsLoading;
  const marketCount = markets?.length || 0;

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
            <Trophy className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold text-primary">Top Predictors</span>
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">
            Leaderboard
          </h1>
          <p className="text-muted-foreground">
            The best predictors on LivePredict. Updated in real-time from Linera.
          </p>
        </div>

        {/* Stats Cards - Real data from Linera */}
        <div className="grid md:grid-cols-3 gap-4 mb-12">
          <div className="bg-card border border-border rounded-xl p-6 text-center">
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-3">
              <TrendingUp className="h-6 w-6 text-primary" />
            </div>
            <p className="font-display text-2xl font-bold text-primary">
              {isLoading ? <Loader2 className="h-6 w-6 animate-spin mx-auto" /> : `${(totalVolume || 0).toLocaleString()} LPT`}
            </p>
            <p className="text-sm text-muted-foreground">Total Volume (Linera)</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-6 text-center">
            <div className="h-12 w-12 rounded-lg bg-success/10 flex items-center justify-center mx-auto mb-3">
              <Target className="h-6 w-6 text-success" />
            </div>
            <p className="font-display text-2xl font-bold text-success">
              {isLoading ? <Loader2 className="h-6 w-6 animate-spin mx-auto" /> : `${marketCount}`}
            </p>
            <p className="text-sm text-muted-foreground">Active Markets</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-6 text-center">
            <div className="h-12 w-12 rounded-lg bg-secondary/10 flex items-center justify-center mx-auto mb-3">
              <Trophy className="h-6 w-6 text-secondary" />
            </div>
            <p className="font-display text-2xl font-bold text-secondary">
              Coming Soon
            </p>
            <p className="text-sm text-muted-foreground">User Rankings</p>
          </div>
        </div>

        {/* Leaderboard Notice */}
        <div className="bg-card border border-primary/30 rounded-xl p-8 text-center">
          <Trophy className="h-16 w-16 text-primary mx-auto mb-4 opacity-50" />
          <h2 className="font-display text-2xl font-bold mb-4">
            Leaderboard Coming Soon
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto mb-6">
            We're building a real-time leaderboard powered by Linera blockchain.
            Rankings will be based on actual prediction performance tracked on-chain.
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <div className="px-4 py-2 rounded-lg bg-muted">
              <span className="text-primary font-semibold">✓</span> On-chain tracking
            </div>
            <div className="px-4 py-2 rounded-lg bg-muted">
              <span className="text-primary font-semibold">✓</span> Real-time updates
            </div>
            <div className="px-4 py-2 rounded-lg bg-muted">
              <span className="text-primary font-semibold">✓</span> Transparent rankings
            </div>
          </div>
        </div>

        {/* Info */}
        <p className="text-center text-sm text-muted-foreground mt-6">
          Rankings will be calculated from Linera blockchain data.
          No mock or demo data - only real predictions count.
        </p>
      </div>
    </div>
  );
}
