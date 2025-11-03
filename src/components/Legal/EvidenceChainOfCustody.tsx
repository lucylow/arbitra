// src/components/Legal/EvidenceChainOfCustody.tsx
import React, { useState, useEffect } from 'react';

interface ChainOfCustodyProps {
  evidenceId: string;
}

interface CustodyRecord {
  action: string;
  actor: string;
  timestamp: bigint;
  location: string;
  hash_verification: boolean;
  notes?: string;
}

interface IntegrityCheck {
  valid: boolean;
  chain_of_custody_intact: boolean;
  hash_verified: boolean;
  constellation_anchored: boolean;
  privilege_maintained: boolean;
  details: string;
}

const ChainOfCustody: React.FC<ChainOfCustodyProps> = ({ evidenceId }) => {
  const [chain, setChain] = useState<CustodyRecord[]>([]);
  const [integrity, setIntegrity] = useState<IntegrityCheck | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadChainOfCustody();
  }, [evidenceId]);

  const loadChainOfCustody = async () => {
    try {
      // This would call the evidence_manager canister
      // const evidenceManager = await getEvidenceManagerActor();
      // const [custodyRecords, integrityCheck] = await Promise.all([
      //   evidenceManager.getEvidenceChainOfCustody(evidenceId),
      //   evidenceManager.verifyEvidenceIntegrity(evidenceId)
      // ]);

      // Mock data for demonstration
      const mockChain: CustodyRecord[] = [
        {
          action: 'Submission',
          actor: 'User123',
          timestamp: BigInt(Date.now() * 1_000_000),
          location: 'Arbitra Platform',
          hash_verification: true,
          notes: 'Initial submission and hash verification'
        },
        {
          action: 'Verification',
          actor: 'System',
          timestamp: BigInt(Date.now() * 1_000_000 + 1000),
          location: 'Arbitra Platform',
          hash_verification: true,
          notes: 'Hash verified against Constellation network'
        }
      ];

      const mockIntegrity: IntegrityCheck = {
        valid: true,
        chain_of_custody_intact: true,
        hash_verified: true,
        constellation_anchored: true,
        privilege_maintained: true,
        details: 'Evidence integrity verified - legally admissible'
      };

      setChain(mockChain);
      setIntegrity(mockIntegrity);
    } catch (error) {
      console.error('Failed to load chain of custody:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderCustodyAction = (action: string) => {
    const actionIcons: Record<string, string> = {
      'Submission': '📤',
      'Verification': '✅',
      'Transfer': '🔄',
      'Analysis': '🔍',
      'Redaction': '⚫',
      'Destruction': '🗑️'
    };

    return actionIcons[action] || '📝';
  };

  const renderIntegrityBadge = () => {
    if (!integrity) return null;

    const statusClass = integrity.valid ? 'bg-green-100 border-green-500 text-green-800' : 'bg-red-100 border-red-500 text-red-800';
    const statusText = integrity.valid ? 'Valid' : 'Compromised';

    return (
      <div className={`integrity-badge ${statusClass} border-2 rounded-lg p-4 flex items-center gap-3`}>
        <div className="badge-icon text-2xl">{integrity.valid ? '🔒' : '⚠️'}</div>
        <div className="badge-content">
          <div className="status font-semibold">{statusText}</div>
          <div className="details text-sm">{integrity.details}</div>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return <div className="loading text-center py-8">Loading chain of custody...</div>;
  }

  return (
    <div className="chain-of-custody max-w-4xl mx-auto p-6">
      <div className="custody-header mb-6">
        <h4 className="text-xl font-bold mb-4">Chain of Custody</h4>
        {renderIntegrityBadge()}
      </div>

      <div className="custody-timeline space-y-4">
        {chain.map((record, index) => (
          <div key={index} className="custody-event flex gap-4 border-l-2 border-blue-500 pl-4 py-4">
            <div className="event-icon text-2xl">
              {renderCustodyAction(record.action)}
            </div>
            <div className="event-content flex-1">
              <div className="event-action font-semibold">{record.action}</div>
              <div className="event-actor text-sm text-gray-600">By: {record.actor}</div>
              <div className="event-time text-sm text-gray-500">
                {new Date(Number(record.timestamp) / 1_000_000).toLocaleString()}
              </div>
              <div className="event-location text-sm text-gray-600">{record.location}</div>
              {record.notes && (
                <div className="event-notes text-sm text-gray-700 mt-2 bg-gray-50 p-2 rounded">
                  Notes: {record.notes}
                </div>
              )}
              <div className={`hash-status mt-2 text-xs px-2 py-1 rounded inline-block ${
                record.hash_verification ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                Hash {record.hash_verification ? 'Verified' : 'Not Verified'}
              </div>
            </div>
          </div>
        ))}
      </div>

      {integrity && (
        <div className="custody-summary mt-8 bg-gray-50 p-6 rounded-lg">
          <h5 className="font-semibold mb-4">Integrity Verification</h5>
          <div className="verification-grid grid grid-cols-2 gap-4">
            <div className="verification-item flex justify-between">
              <span className="label font-medium">Chain of Custody:</span>
              <span className={`value font-semibold ${
                integrity.chain_of_custody_intact ? 'text-green-600' : 'text-red-600'
              }`}>
                {integrity.chain_of_custody_intact ? 'Intact' : 'Broken'}
              </span>
            </div>
            <div className="verification-item flex justify-between">
              <span className="label font-medium">Hash Verified:</span>
              <span className={`value font-semibold ${
                integrity.hash_verified ? 'text-green-600' : 'text-red-600'
              }`}>
                {integrity.hash_verified ? 'Verified' : 'Failed'}
              </span>
            </div>
            <div className="verification-item flex justify-between">
              <span className="label font-medium">Constellation Anchored:</span>
              <span className={`value font-semibold ${
                integrity.constellation_anchored ? 'text-green-600' : 'text-red-600'
              }`}>
                {integrity.constellation_anchored ? 'Anchored' : 'Not Anchored'}
              </span>
            </div>
            <div className="verification-item flex justify-between">
              <span className="label font-medium">Legal Privilege:</span>
              <span className={`value font-semibold ${
                integrity.privilege_maintained ? 'text-green-600' : 'text-red-600'
              }`}>
                {integrity.privilege_maintained ? 'Maintained' : 'Compromised'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChainOfCustody;

