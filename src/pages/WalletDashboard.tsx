import { Link } from 'react-router-dom';
import { Wallet, History, TrendingUp, Target, Trophy, Download, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWallet } from '@/contexts/WalletContext';
import { CheCkoInstallModal } from '@/components/wallet/CheCkoInstallModal';
import { useUserBets } from '@/hooks/useLinera';
import { cn } from '@/lib/utils';

export default function WalletDashboard() {
  const { wallet, connect, isConnecting, isCheCkoAvailable, showInstallGuide, setShowInstallGuide } = useWallet();

  // Fetch real user bets from the Linera smart contract
  const { data: userBets, isLoading: betsLoading } = useUserBets(wallet.address || '');

  const handleConnect = () => {
    if (!isCheCkoAvailable) {
      setShowInstallGuide(true);
    } else {
      connect();
    }
  };

  // Calculate real stats from user bets
  const stats = {
    totalBets: userBets?.length || 0,
    wonBets: userBets?.filter(bet => bet.settled && bet.payout && bet.payout > 0).length || 0,
    lostBets: userBets?.filter(bet => bet.settled && (!bet.payout || bet.payout === 0)).length || 0,
    totalWagered: userBets?.reduce((sum, bet) => sum + bet.amount, 0) || 0,
    totalWon: userBets?.reduce((sum, bet) => sum + (bet.payout || 0), 0) || 0,
  };

  const winRate = stats.totalBets > 0 ? ((stats.wonBets / stats.totalBets) * 100).toFixed(1) : '0';
  const profitLoss = stats.totalWon - stats.totalWagered;

  if (!wallet.connected) {
    return (
      <>
        <div className="min-h-screen flex items-center justify-center py-8">
          <div className="text-center max-w-md">
            <div className="h-20 w-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <Wallet className="h-10 w-10 text-primary" />
            </div>
            <h1 className="font-display text-2xl font-bold mb-2">
              {isCheCkoAvailable ? 'Connect Your Wallet' : 'Install CheCko Wallet'}
            </h1>
            <p className="text-muted-foreground mb-6">
              {isCheCkoAvailable
                ? 'Connect your CheCko wallet to view your balance and betting history on the Linera blockchain.'
                : 'CheCko is a browser wallet for Linera blockchain. Install it to start making predictions.'
              }
            </p>

            <Button
              size="lg"
              onClick={handleConnect}
              disabled={isConnecting}
              className="font-display font-bold uppercase tracking-wide bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {isConnecting ? (
                'Connecting...'
              ) : !isCheCkoAvailable ? (
                <>
                  <Download className="mr-2 h-5 w-5" />
                  Install CheCko Wallet
                </>
              ) : (
                'Connect CheCko'
              )}
            </Button>

            {!isCheCkoAvailable && (
              <a
                href="https://github.com/respeer-ai/linera-wallet"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 mt-4 text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Learn more about CheCko
                <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
        </div>
        <CheCkoInstallModal open={showInstallGuide} onOpenChange={setShowInstallGuide} />
      </>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">
            Wallet Dashboard
          </h1>
          <p className="text-muted-foreground font-mono text-sm">
            {wallet.address}
          </p>
        </div>

        {/* Balance Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {/* Available Balance */}
          <div className="bg-card border border-primary/30 rounded-xl p-6 glow-primary">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-muted-foreground">Available Balance</span>
              <Wallet className="h-5 w-5 text-primary" />
            </div>
            <p className="font-display text-4xl font-black text-primary">
              {wallet.balance.available.toLocaleString()}
            </p>
            <p className="text-sm text-muted-foreground">TLINERA (LPT)</p>
          </div>

          {/* Locked in Predictions */}
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-muted-foreground">Locked in Predictions</span>
              <Target className="h-5 w-5 text-warning" />
            </div>
            <p className="font-display text-4xl font-black text-warning">
              {wallet.balance.locked.toLocaleString()}
            </p>
            <p className="text-sm text-muted-foreground">TLINERA (LPT)</p>
          </div>

          {/* Total Profit/Loss */}
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-muted-foreground">Total Profit/Loss</span>
              <TrendingUp className="h-5 w-5 text-success" />
            </div>
            <p className={cn(
              'font-display text-4xl font-black',
              profitLoss >= 0 ? 'text-success' : 'text-destructive'
            )}>
              {betsLoading ? '...' : `${profitLoss >= 0 ? '+' : ''}${profitLoss.toLocaleString()}`}
            </p>
            <p className="text-sm text-muted-foreground">TLINERA (LPT)</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-4 mb-8">
          <Button asChild className="flex-1 font-body font-semibold bg-primary text-primary-foreground">
            <Link to="/matches">
              <Trophy className="mr-2 h-4 w-4" />
              Start Predicting
            </Link>
          </Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Stats */}
          <div className="lg:col-span-1">
            <div className="bg-card border border-border rounded-xl p-6">
              <h2 className="font-display text-lg font-bold mb-6">Your Statistics</h2>

              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-border">
                  <span className="text-muted-foreground">Total Predictions</span>
                  <span className="font-bold">{betsLoading ? '...' : stats.totalBets}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border">
                  <span className="text-muted-foreground">Won</span>
                  <span className="font-bold text-success">{betsLoading ? '...' : stats.wonBets}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border">
                  <span className="text-muted-foreground">Lost</span>
                  <span className="font-bold text-destructive">{betsLoading ? '...' : stats.lostBets}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border">
                  <span className="text-muted-foreground">Win Rate</span>
                  <span className="font-bold text-primary">{betsLoading ? '...' : `${winRate}%`}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border">
                  <span className="text-muted-foreground">Total Wagered</span>
                  <span className="font-bold">{betsLoading ? '...' : `${stats.totalWagered.toLocaleString()} TLINERA`}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-muted-foreground">Profit/Loss</span>
                  <span className={cn(
                    'font-bold',
                    profitLoss >= 0 ? 'text-success' : 'text-destructive'
                  )}>
                    {betsLoading ? '...' : `${profitLoss >= 0 ? '+' : ''}${profitLoss.toLocaleString()} TLINERA`}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Betting History */}
          <div className="lg:col-span-2">
            <div className="bg-card border border-border rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display text-lg font-bold">Prediction History</h2>
                <Button variant="ghost" size="sm" className="text-primary">
                  <History className="mr-2 h-4 w-4" />
                  View All
                </Button>
              </div>

              {betsLoading ? (
                <div className="text-center py-8 text-muted-foreground">
                  Loading your predictions...
                </div>
              ) : userBets && userBets.length > 0 ? (
                <div className="space-y-4">
                  {userBets.slice(0, 10).map((bet) => (
                    <div
                      key={bet.id}
                      className="flex items-center justify-between py-3 border-b border-border last:border-0"
                    >
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          'h-10 w-10 rounded-lg flex items-center justify-center',
                          bet.settled && bet.payout && bet.payout > 0 ? 'bg-success/10' : 'bg-muted'
                        )}>
                          {bet.settled && bet.payout && bet.payout > 0 ? (
                            <TrendingUp className="h-5 w-5 text-success" />
                          ) : (
                            <Target className="h-5 w-5 text-muted-foreground" />
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-sm">Market #{bet.marketId} - Option {bet.optionId}</p>
                          <p className="text-xs text-muted-foreground">
                            {bet.settled ? 'Settled' : 'Pending'} • Odds: {(bet.odds / 100).toFixed(2)}x
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={cn(
                          'font-display font-bold block',
                          bet.settled && bet.payout && bet.payout > 0 ? 'text-success' : 'text-muted-foreground'
                        )}>
                          {bet.settled && bet.payout && bet.payout > 0
                            ? `+${bet.payout.toLocaleString()}`
                            : `-${bet.amount.toLocaleString()}`
                          } TLINERA
                        </span>
                        <span className="text-xs text-muted-foreground">
                          Bet: {bet.amount.toLocaleString()} TLINERA
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">No predictions yet</p>
                  <Button asChild size="sm">
                    <Link to="/matches">Make Your First Prediction</Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
