import React, { useState, useEffect } from 'react';
import { walletService, ConnectedWallet, WalletBalance } from '../../services/walletService';

const WalletDashboard: React.FC = () => {
  const [wallet, setWallet] = useState<ConnectedWallet | null>(null);
  const [balance, setBalance] = useState<WalletBalance | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const connectedWallet = walletService.getConnectedWallet();
    setWallet(connectedWallet);
    if (connectedWallet?.balance) {
      setBalance(connectedWallet.balance);
    }
  }, []);

  const handleRefreshBalance = async () => {
    setIsRefreshing(true);
    try {
      const newBalance = await walletService.refreshBalance();
      setBalance(newBalance);
    } catch (error: any) {
      console.error('Failed to refresh balance:', error);
      alert(`Failed to refresh balance: ${error.message}`);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleDisconnect = () => {
    walletService.disconnect();
    setWallet(null);
    setBalance(null);
  };

  if (!wallet) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-lg text-center">
        <p className="text-gray-600">No wallet connected</p>
      </div>
    );
  }

  return (
    <div className="wallet-dashboard p-6 bg-white rounded-lg shadow-lg">
      <div className="wallet-header flex justify-between items-center mb-4">
        <div className="wallet-type px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
          {wallet.type.toUpperCase().replace('_', ' ')}
        </div>
        <button 
          onClick={handleDisconnect} 
          className="disconnect-button px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
        >
          Disconnect
        </button>
      </div>

      <div className="wallet-address mb-6 p-3 bg-gray-50 rounded-lg">
        <strong className="text-sm text-gray-700">Principal:</strong>
        <p className="text-xs text-gray-600 mt-1 break-all">{wallet.principal.toText()}</p>
      </div>

      <div className="balance-section">
        <div className="balance-header flex justify-between items-center mb-4">
          <h4 className="text-xl font-bold">Balances</h4>
          <button 
            onClick={handleRefreshBalance} 
            disabled={isRefreshing}
            className="refresh-button px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>

        {balance && (
          <div className="balance-grid grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="balance-item p-4 bg-gradient-to-br from-cyan-50 to-blue-50 rounded-lg border border-cyan-200">
              <div className="currency text-sm text-gray-600 mb-1">ICP</div>
              <div className="amount text-2xl font-bold text-cyan-700">{balance.icp.toFixed(4)}</div>
              <div className="usd-value text-sm text-gray-600">${(balance.icp * 12.5).toFixed(2)}</div>
            </div>
            <div className="balance-item p-4 bg-gradient-to-br from-orange-50 to-yellow-50 rounded-lg border border-orange-200">
              <div className="currency text-sm text-gray-600 mb-1">ckBTC</div>
              <div className="amount text-2xl font-bold text-orange-700">{balance.ckbtc.toFixed(6)}</div>
              <div className="usd-value text-sm text-gray-600">${(balance.ckbtc * 43860).toFixed(2)}</div>
            </div>
            <div className="balance-item p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-200">
              <div className="currency text-sm text-gray-600 mb-1">Total USD</div>
              <div className="amount text-2xl font-bold text-green-700">${balance.usd_value.toFixed(2)}</div>
            </div>
          </div>
        )}
      </div>

      <div className="quick-actions mt-6">
        <h5 className="text-lg font-semibold mb-3">Quick Actions</h5>
        <div className="action-buttons grid grid-cols-2 md:grid-cols-4 gap-3">
          <button className="action-button px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
            Deposit
          </button>
          <button className="action-button px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
            Withdraw
          </button>
          <button className="action-button px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
            Transfer
          </button>
          <button className="action-button px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
            History
          </button>
        </div>
      </div>
    </div>
  );
};

export default WalletDashboard;

