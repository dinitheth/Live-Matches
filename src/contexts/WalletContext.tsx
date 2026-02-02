import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { WalletState, UserBalance } from '@/types';
import {
  isCheCkoInstalled,
  getCheCkoProvider,
  waitForCheCko,
  connectCheCko,
  disconnectCheCko,
  getCheCkoBalance,
  CHECKO_INSTALL_URL,
  CheCkoProvider,
} from '@/lib/checko';

interface WalletContextType {
  wallet: WalletState;
  connect: () => Promise<void>;
  disconnect: () => void;
  refreshBalance: () => Promise<void>;
  isConnecting: boolean;
  error: string | null;
  isCheCkoAvailable: boolean;
  installUrl: string;
  showInstallGuide: boolean;
  setShowInstallGuide: (show: boolean) => void;
}

const initialBalance: UserBalance = {
  available: 0,
  locked: 0,
  total: 0,
};

const initialWalletState: WalletState = {
  connected: false,
  address: null,
  chainId: null,
  balance: initialBalance,
};

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [wallet, setWallet] = useState<WalletState>(initialWalletState);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCheCkoAvailable, setIsCheCkoAvailable] = useState(false);
  const [showInstallGuide, setShowInstallGuide] = useState(false);

  // Check for CheCko wallet on mount
  useEffect(() => {
    const checkCheCko = async () => {
      const provider = await waitForCheCko();
      setIsCheCkoAvailable(!!provider);

      if (provider) {
        // Listen for account changes (if supported)
        if (provider.on) {
          provider.on('accountsChanged', async (accounts: unknown) => {
            // accounts is passed directly to the callback in EIP-1193
            const accountList = Array.isArray(accounts) ? accounts : [];
            if (accountList.length === 0) {
              setWallet(initialWalletState);
            } else {
              // CheCko passes addresses as strings
              const address = typeof accountList[0] === 'string'
                ? accountList[0]
                : (accountList[0] as { address?: string })?.address || '';
              if (address) {
                // Get chainId from provider
                let chainId = 'unknown';
                try {
                  chainId = await provider.request<string>({ method: 'eth_chainId' });
                } catch { /* ignore */ }
                await updateWalletState(address, chainId);
              }
            }
          });

          // Listen for chain changes
          provider.on('chainChanged', async (chainId: unknown) => {
            if (wallet.connected && wallet.address) {
              setWallet(prev => ({ ...prev, chainId: chainId as string }));
            }
          });

          // Listen for disconnect
          provider.on('disconnect', () => {
            setWallet(initialWalletState);
          });
        }
      }
    };

    checkCheCko();
  }, []);

  const updateWalletState = async (address: string, chainId: string) => {
    try {
      // Try to fetch real TLINERA balance from wallet's RPC endpoint
      let available = 0;
      let locked = 0;

      try {
        // Use getCheCkoBalance which queries via linera_graphqlQuery internally
        // Only pass address - function internally gets chainId from provider
        const balance = await getCheCkoBalance(address);
        if (balance) {
          // Parse balance - Linera returns balance as a string like "10.0" 
          const rawBalance = parseFloat(balance.available) || 0;
          available = rawBalance;  // Balance is already in TLINERA units
          console.log('[Wallet] Fetched TLINERA balance:', available);
        } else {
          console.log('[Wallet] No balance returned from wallet query');
        }
      } catch (balanceErr) {
        console.log('[Wallet] Could not fetch balance:', balanceErr);
      }

      setWallet({
        connected: true,
        address,
        chainId,
        balance: {
          available,
          locked,
          total: available + locked,
        },
      });
    } catch (err) {
      console.log('[Wallet] Error updating wallet state:', err);
      // Still connect but with 0 balance
      setWallet({
        connected: true,
        address,
        chainId,
        balance: {
          available: 0,
          locked: 0,
          total: 0,
        },
      });
    }
  };

  const connect = useCallback(async () => {
    setIsConnecting(true);
    setError(null);

    try {
      const provider = getCheCkoProvider();

      if (!provider) {
        // CheCko not installed - open install page
        setError('CheCko wallet not found. Please install the extension.');
        window.open(CHECKO_INSTALL_URL, '_blank');
        setIsConnecting(false);
        return;
      }

      const account = await connectCheCko();

      if (account) {
        await updateWalletState(account.address, account.chainId);
      } else {
        setError('Failed to connect to CheCko wallet.');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to connect wallet. Please try again.';
      setError(errorMessage);
      console.error('Wallet connection error:', err);
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const disconnect = useCallback(async () => {
    try {
      await disconnectCheCko();
    } catch (err) {
      console.error('Disconnect error:', err);
    }
    setWallet(initialWalletState);
    setError(null);
  }, []);

  const refreshBalance = useCallback(async () => {
    if (wallet.connected && wallet.address && wallet.chainId) {
      await updateWalletState(wallet.address, wallet.chainId);
    }
  }, [wallet.connected, wallet.address, wallet.chainId]);

  return (
    <WalletContext.Provider value={{
      wallet,
      connect,
      disconnect,
      refreshBalance,
      isConnecting,
      error,
      isCheCkoAvailable,
      installUrl: CHECKO_INSTALL_URL,
      showInstallGuide,
      setShowInstallGuide,
    }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}
