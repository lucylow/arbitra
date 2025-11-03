import React, { useState } from 'react';
import { walletService, ConnectedWallet } from '../../services/walletService';

interface WalletSelectorProps {
  onWalletConnected: (wallet: ConnectedWallet) => void;
  onError: (error: string) => void;
}

const WalletSelector: React.FC<WalletSelectorProps> = ({ onWalletConnected, onError }) => {
  const [isConnecting, setIsConnecting] = useState<string | null>(null);
  const supportedWallets = walletService.getSupportedWallets();

  const handleWalletConnect = async (walletType: string) => {
    setIsConnecting(walletType);
    try {
      const wallet = await walletService.connectWallet(walletType);
      onWalletConnected(wallet);
    } catch (error: any) {
      onError(error.message || 'Failed to connect wallet');
    } finally {
      setIsConnecting(null);
    }
  };

  return (
    <div className="wallet-selector p-6 bg-white rounded-lg shadow-lg">
      <h3 className="text-2xl font-bold mb-2">Connect Your Wallet</h3>
      <p className="text-gray-600 mb-6">
        Choose a wallet to connect to Arbitra. Different wallets offer different features.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(supportedWallets).map(([type, config]) => (
          <button
            key={type}
            className={`wallet-button relative p-4 border-2 rounded-lg transition-all ${
              isConnecting === type
                ? 'border-blue-500 bg-blue-50 cursor-wait'
                : 'border-gray-200 hover:border-blue-400 hover:shadow-md'
            } ${isConnecting !== null && isConnecting !== type ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={() => handleWalletConnect(type)}
            disabled={isConnecting !== null}
          >
            <div className="flex items-center space-x-4">
              <div className="wallet-icon text-4xl">{config.icon}</div>
              <div className="wallet-info flex-1 text-left">
                <div className="wallet-name font-semibold text-lg">{config.name}</div>
                <div className="wallet-features text-sm text-gray-600">
                  {config.supports.join(' • ')}
                </div>
              </div>
            </div>
            {isConnecting === type && (
              <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 rounded-lg">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default WalletSelector;

