import React, { useState } from 'react';
import type { Dispute, Escrow } from '../../types';

interface SettlementExecutionProps {
  dispute: Dispute;
  escrow?: Escrow;
  onExecuteSettlement: () => Promise<void>;
}

export const SettlementExecution: React.FC<SettlementExecutionProps> = ({
  dispute,
  escrow,
  onExecuteSettlement
}) => {
  const [isExecuting, setIsExecuting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleExecute = async () => {
    setIsExecuting(true);
    setError(null);

    try {
      await onExecuteSettlement();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to execute settlement');
    } finally {
      setIsExecuting(false);
    }
  };

  if (!dispute.decision) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-sm text-yellow-800">
          No decision has been rendered yet. Settlement execution requires a final decision.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6 space-y-4">
      <h3 className="text-lg font-medium text-gray-900">Settlement Execution</h3>

      {/* Decision Display */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Arbitrator Decision</h4>
        <p className="text-sm text-gray-600">{dispute.decision}</p>
      </div>

      {/* Escrow Status */}
      {escrow && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-blue-900 mb-2">Escrow Status</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-blue-700">Amount:</span>
              <span className="text-blue-900 font-medium">
                {Number(escrow.amount) / 1e8} ckBTC
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-700">Status:</span>
              <span className={`font-medium ${
                escrow.status === 'Funded' ? 'text-green-700' : 'text-yellow-700'
              }`}>
                {escrow.status}
              </span>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Execution Button */}
      <div className="flex justify-end">
        <button
          onClick={handleExecute}
          disabled={isExecuting || !escrow || escrow.status !== 'Funded'}
          className="inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isExecuting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Executing...
            </>
          ) : (
            <>
              <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Execute Settlement
            </>
          )}
        </button>
      </div>

      {/* Warning */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
        <p className="text-xs text-yellow-800">
          <strong>Warning:</strong> This action is irreversible. The escrow will be released according to the arbitrator's decision.
        </p>
      </div>
    </div>
  );
};

