import { Actor, ActorSubclass, HttpAgent, Identity } from '@dfinity/agent';
import { Principal } from '@dfinity/principal';
import { createAgent } from './agent';

// Note: ledgerIDL would come from declarations after building
// For now, we'll define a minimal interface or handle it dynamically
declare const ledgerIDL: any;

export interface WalletBalance {
  icp: number;
  ckbtc: number;
  usd_value: number;
}

export interface WalletTransaction {
  hash: string;
  type: 'deposit' | 'withdrawal' | 'fee' | 'settlement';
  amount: number;
  currency: 'ICP' | 'ckBTC' | 'USD';
  timestamp: number;
  status: 'pending' | 'completed' | 'failed';
  description: string;
}

export interface ConnectedWallet {
  type: 'internet_identity' | 'plug' | 'stoic' | 'nfid' | 'metamask';
  principal: Principal;
  accountId: string;
  balance?: WalletBalance;
}

class WalletService {
  private connectedWallet: ConnectedWallet | null = null;
  private agent: HttpAgent | null = null;
  private ledgerActor: ActorSubclass | null = null;

  // Supported wallet types with configuration
  private readonly WALLET_CONFIG = {
    internet_identity: {
      name: 'Internet Identity',
      icon: '🆔',
      supports: ['icp', 'ckbtc']
    },
    plug: {
      name: 'Plug Wallet',
      icon: '🔌',
      supports: ['icp', 'ckbtc', 'extensions']
    },
    stoic: {
      name: 'Stoic Wallet',
      icon: '🛡️',
      supports: ['icp', 'ckbtc']
    },
    nfid: {
      name: 'NFID',
      icon: '🌐',
      supports: ['icp', 'internet_identity']
    },
    metamask: {
      name: 'MetaMask',
      icon: '🦊',
      supports: ['ethereum', 'cross_chain']
    }
  };

  async connectWallet(walletType: string): Promise<ConnectedWallet> {
    try {
      let principal: Principal;
      let accountId: string;

      switch (walletType) {
        case 'internet_identity':
          ({ principal, accountId } = await this.connectInternetIdentity());
          break;
        
        case 'plug':
          ({ principal, accountId } = await this.connectPlugWallet());
          break;
        
        case 'stoic':
          ({ principal, accountId } = await this.connectStoicWallet());
          break;
        
        case 'metamask':
          ({ principal, accountId } = await this.connectMetaMask());
          break;
        
        default:
          throw new Error(`Unsupported wallet type: ${walletType}`);
      }

      this.connectedWallet = {
        type: walletType as ConnectedWallet['type'],
        principal,
        accountId
      };

      // Initialize ledger actor for balance queries
      await this.initializeLedgerActor();
      
      // Fetch initial balance
      await this.refreshBalance();

      return this.connectedWallet;
    } catch (error: any) {
      console.error('Wallet connection failed:', error);
      throw new Error(`Failed to connect ${walletType} wallet: ${error.message}`);
    }
  }

  private async connectInternetIdentity(): Promise<{ principal: Principal; accountId: string }> {
    // Internet Identity is already handled by the auth system
    // We'll use the existing identity from the auth client
    const { getIdentity } = await import('./agent');
    const identity = await getIdentity();
    const principal = identity.getPrincipal();
    const accountId = this.principalToAccountId(principal);

    return { principal, accountId };
  }

  private async connectPlugWallet(): Promise<{ principal: Principal; accountId: string }> {
    if (typeof window === 'undefined' || !window.ic?.plug) {
      throw new Error('Plug wallet not installed. Please install Plug wallet extension.');
    }

    const isConnected = await window.ic.plug.requestConnect({
      whitelist: ['ryjl3-tyaaa-aaaaa-aaaba-cai'], // Ledger canister
      host: 'https://boundary.ic0.app'
    });

    if (!isConnected) {
      throw new Error('Plug wallet connection rejected');
    }

    const principal = await window.ic.plug.getPrincipal();
    const accountId = this.principalToAccountId(principal);

    return { principal, accountId };
  }

  private async connectStoicWallet(): Promise<{ principal: Principal; accountId: string }> {
    if (typeof window === 'undefined' || !window.ic?.stoic) {
      throw new Error('Stoic wallet not available');
    }

    try {
      const result = await window.ic.stoic.connect();
      const principal = result.principal;
      const accountId = this.principalToAccountId(principal);

      return { principal, accountId };
    } catch (error: any) {
      throw new Error(`Stoic wallet connection failed: ${error.message}`);
    }
  }

  private async connectMetaMask(): Promise<{ principal: Principal; accountId: string }> {
    if (typeof window === 'undefined' || !window.ethereum) {
      throw new Error('MetaMask not installed. Please install MetaMask extension.');
    }

    try {
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });

      if (!accounts || accounts.length === 0) {
        throw new Error('MetaMask connection failed');
      }

      // For cross-chain, we'd create a mapped principal or use bridge
      const ethAddress = accounts[0];
      const principal = this.ethAddressToPrincipal(ethAddress);
      const accountId = ethAddress;

      return { principal, accountId };
    } catch (error: any) {
      throw new Error(`MetaMask connection failed: ${error.message}`);
    }
  }

  async refreshBalance(): Promise<WalletBalance> {
    if (!this.connectedWallet) {
      throw new Error('Wallet not connected');
    }

    try {
      // Get ICP balance
      const icpBalance = await this.getICPBalance(this.connectedWallet.accountId);
      
      // Get ckBTC balance
      const ckbtcBalance = await this.getCkBTCBalance(this.connectedWallet.accountId);
      
      // Calculate USD value (mock conversion rates - in production, fetch from API)
      const icpToUsd = 12.5;
      const ckbtcToUsd = 43860;
      const usd_value = (icpBalance * icpToUsd) + (ckbtcBalance * ckbtcToUsd);

      const balance: WalletBalance = {
        icp: icpBalance,
        ckbtc: ckbtcBalance,
        usd_value
      };

      if (this.connectedWallet) {
        this.connectedWallet.balance = balance;
      }

      return balance;
    } catch (error) {
      console.error('Balance refresh failed:', error);
      throw error;
    }
  }

  private async getICPBalance(accountId: string): Promise<number> {
    // In production, this would query the ICP ledger canister
    // For now, we'll use a mock implementation
    try {
      if (this.ledgerActor && this.connectedWallet) {
        // Would call ledger canister's account_balance method
        // const balance = await this.ledgerActor.account_balance({ account: accountId });
        // return Number(balance.e8s) / 100000000; // Convert from e8s to ICP
      }
    } catch (error) {
      console.warn('Failed to fetch ICP balance from ledger, using mock value');
    }
    
    // Mock balance - replace with actual ledger call
    return 15.75;
  }

  private async getCkBTCBalance(accountId: string): Promise<number> {
    // In production, this would query the ckBTC ledger canister
    // Mock implementation
    return 0.025;
  }

  async transferFunds(
    toAccountId: string,
    amount: number,
    currency: 'ICP' | 'ckBTC'
  ): Promise<string> {
    if (!this.connectedWallet) {
      throw new Error('Wallet not connected');
    }

    // Validate sufficient balance
    const balance = this.connectedWallet.balance;
    if (!balance || (currency === 'ICP' && balance.icp < amount) || 
        (currency === 'ckBTC' && balance.ckbtc < amount)) {
      throw new Error('Insufficient balance');
    }

    // Execute transfer
    const transactionHash = await this.executeTransfer(toAccountId, amount, currency);
    
    // Refresh balance after transfer
    await this.refreshBalance();

    return transactionHash;
  }

  private async executeTransfer(
    toAccountId: string,
    amount: number,
    currency: 'ICP' | 'ckBTC'
  ): Promise<string> {
    // In production, this would call the ledger canister's transfer method
    // For now, return a mock transaction hash
    return `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private principalToAccountId(principal: Principal): string {
    // Convert principal to account identifier
    return principal.toText();
  }

  private ethAddressToPrincipal(ethAddress: string): Principal {
    // Convert Ethereum address to ICP principal (simplified)
    // In production, this would use a proper mapping or bridge
    const bytes = new TextEncoder().encode(ethAddress.slice(0, 29));
    return Principal.fromUint8Array(bytes);
  }

  private async initializeLedgerActor(): Promise<void> {
    try {
      // Initialize agent if not already initialized
      if (!this.agent) {
        const { getIdentity } = await import('./agent');
        const identity = await getIdentity();
        this.agent = await createAgent(identity);
      }

      // Note: In production, you would load the ledger IDL and create the actor
      // For now, we'll leave this as a placeholder that can be extended
      // const ledgerCanisterId = 'ryjl3-tyaaa-aaaaa-aaaba-cai'; // ICP ledger
      // this.ledgerActor = Actor.createActor(ledgerIDL.idlFactory, {
      //   agent: this.agent,
      //   canisterId: ledgerCanisterId
      // });
    } catch (error) {
      console.warn('Ledger actor initialization failed, balance queries may use mock data:', error);
    }
  }

  getConnectedWallet(): ConnectedWallet | null {
    return this.connectedWallet;
  }

  disconnect(): void {
    this.connectedWallet = null;
    this.agent = null;
    this.ledgerActor = null;
  }

  getSupportedWallets() {
    return this.WALLET_CONFIG;
  }
}

export const walletService = new WalletService();

