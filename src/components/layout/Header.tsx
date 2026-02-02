import { Link, useLocation } from 'react-router-dom';
import { Zap, Menu, X, Download, Wallet, LogOut, ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useWallet } from '@/contexts/WalletContext';
import { CheCkoInstallModal } from '@/components/wallet/CheCkoInstallModal';
import { cn } from '@/lib/utils';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/matches', label: 'Matches' },
  { href: '/leaderboard', label: 'Leaderboard' },
  { href: '/how-it-works', label: 'How It Works' },
];

export function Header() {
  const { wallet, connect, disconnect, isConnecting, isCheCkoAvailable, showInstallGuide, setShowInstallGuide } = useWallet();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [walletDropdownOpen, setWalletDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setWalletDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const handleConnect = () => {
    if (!isCheCkoAvailable) {
      setShowInstallGuide(true);
    } else {
      connect();
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="relative">
              <Zap className="h-8 w-8 text-primary transition-all group-hover:scale-110" />
              <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <span className="font-display text-xl font-bold tracking-wider">
              <span className="text-primary">LIVE</span>
              <span className="text-foreground">PREDICT</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={cn(
                  'font-body text-sm font-semibold uppercase tracking-wide transition-colors',
                  location.pathname === link.href
                    ? 'text-primary text-glow-primary'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Wallet & Mobile Menu */}
          <div className="flex items-center gap-4">
            {wallet.connected ? (
              <div className="hidden sm:flex items-center gap-2 relative" ref={dropdownRef}>
                {/* Balance Display */}
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/30">
                  <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
                  <span className="font-body text-sm font-semibold text-primary">
                    {wallet.balance.available.toLocaleString()} LPT
                  </span>
                </div>
                {/* Wallet Dropdown Button */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setWalletDropdownOpen(!walletDropdownOpen)}
                  className="font-body font-semibold flex items-center gap-1"
                >
                  {formatAddress(wallet.address!)}
                  <ChevronDown className={cn(
                    "h-4 w-4 transition-transform",
                    walletDropdownOpen && "rotate-180"
                  )} />
                </Button>

                {/* Dropdown Menu */}
                {walletDropdownOpen && (
                  <div className="absolute top-full right-0 mt-2 w-48 bg-card border border-border rounded-lg shadow-xl overflow-hidden z-50">
                    <Link
                      to="/wallet"
                      onClick={() => setWalletDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-muted transition-colors text-sm font-medium"
                    >
                      <Wallet className="h-4 w-4 text-primary" />
                      Wallet Dashboard
                    </Link>
                    <button
                      onClick={() => {
                        disconnect();
                        setWalletDropdownOpen(false);
                      }}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-muted transition-colors text-sm font-medium w-full text-left text-destructive"
                    >
                      <LogOut className="h-4 w-4" />
                      Disconnect
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Button
                onClick={handleConnect}
                disabled={isConnecting}
                className="hidden sm:flex font-body font-bold uppercase tracking-wide bg-primary text-primary-foreground hover:bg-primary/90 glow-primary"
              >
                {isConnecting ? (
                  'Connecting...'
                ) : !isCheCkoAvailable ? (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    Install CheCko
                  </>
                ) : (
                  'Connect CheCko'
                )}
              </Button>
            )}

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 text-foreground"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-background/95 backdrop-blur-xl">
          <nav className="container mx-auto px-4 py-4 flex flex-col gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  'font-body text-base font-semibold uppercase tracking-wide py-2 transition-colors',
                  location.pathname === link.href
                    ? 'text-primary'
                    : 'text-muted-foreground'
                )}
              >
                {link.label}
              </Link>
            ))}

            {wallet.connected ? (
              <div className="flex flex-col gap-3 pt-4 border-t border-border">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
                  <span className="font-body text-sm font-semibold text-primary">
                    {wallet.balance.available.toLocaleString()} LPT
                  </span>
                </div>
                <Link
                  to="/wallet"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 py-2 text-foreground font-medium"
                >
                  <Wallet className="h-4 w-4 text-primary" />
                  Wallet Dashboard
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    disconnect();
                    setMobileMenuOpen(false);
                  }}
                  className="text-destructive border-destructive/30 hover:bg-destructive/10"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Disconnect
                </Button>
              </div>
            ) : (
              <div className="flex flex-col gap-2 pt-4 border-t border-border">
                <Button
                  onClick={handleConnect}
                  disabled={isConnecting}
                  className="font-body font-bold uppercase"
                >
                  {isConnecting ? (
                    'Connecting...'
                  ) : !isCheCkoAvailable ? (
                    <>
                      <Download className="mr-2 h-4 w-4" />
                      Install CheCko
                    </>
                  ) : (
                    'Connect CheCko'
                  )}
                </Button>
              </div>
            )}
          </nav>
        </div>
      )}

      {/* CheCko Install Modal */}
      <CheCkoInstallModal open={showInstallGuide} onOpenChange={setShowInstallGuide} />
    </header>
  );
}
