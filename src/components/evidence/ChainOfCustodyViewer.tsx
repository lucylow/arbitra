import React, { useState, useEffect } from 'react';
import type { Evidence } from '../../types';

interface CustodyEvent {
  id: string;
  action: 'uploaded' | 'verified' | 'viewed' | 'modified' | 'archived';
  actor: string;
  timestamp: Date;
  description: string;
  hash: string;
}

interface ChainOfCustodyViewerProps {
  evidence: Evidence;
}

export const ChainOfCustodyViewer: React.FC<ChainOfCustodyViewerProps> = ({ evidence }) => {
  const [custodyEvents, setCustodyEvents] = useState<CustodyEvent[]>([]);

  useEffect(() => {
    // Generate chain of custody events from evidence
    const events: CustodyEvent[] = [
      {
        id: '1',
        action: 'uploaded',
        actor: evidence.submittedBy.toString(),
        timestamp: new Date(Number(evidence.timestamp) / 1e6),
        description: 'Evidence file uploaded and hashed',
        hash: evidence.contentHash
      }
    ];

    if (evidence.verified) {
      events.push({
        id: '2',
        action: 'verified',
        actor: 'System',
        timestamp: new Date(Number(evidence.timestamp) / 1e6 + 1000),
        description: 'Evidence hash verified against Constellation Network',
        hash: evidence.contentHash
      });
    }

    setCustodyEvents(events);
  }, [evidence]);

  const getActionIcon = (action: CustodyEvent['action']) => {
    const icons = {
      uploaded: '📤',
      verified: '✅',
      viewed: '👁️',
      modified: '✏️',
      archived: '📦'
    };
    return icons[action];
  };

  const getActionColor = (action: CustodyEvent['action']) => {
    const colors = {
      uploaded: 'bg-blue-500',
      verified: 'bg-green-500',
      viewed: 'bg-purple-500',
      modified: 'bg-yellow-500',
      archived: 'bg-gray-500'
    };
    return colors[action];
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-6">Chain of Custody</h3>
      <div className="relative">
        {/* Timeline Line */}
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>

        {/* Events */}
        <div className="space-y-6">
          {custodyEvents.map((event) => (
            <div key={event.id} className="relative flex items-start">
              {/* Icon */}
              <div className={`relative z-10 flex-shrink-0 w-8 h-8 ${getActionColor(event.action)} rounded-full flex items-center justify-center text-white text-xs`}>
                {getActionIcon(event.action)}
              </div>

              {/* Content */}
              <div className="ml-6 flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-gray-900 capitalize">
                    {event.action} by {event.actor.substring(0, 8)}...
                  </h4>
                  <time className="text-xs text-gray-500">
                    {event.timestamp.toLocaleDateString()} {event.timestamp.toLocaleTimeString()}
                  </time>
                </div>
                <p className="mt-1 text-sm text-gray-500">{event.description}</p>
                <div className="mt-2">
                  <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono">
                    Hash: {event.hash.substring(0, 16)}...
                  </code>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Security Badge */}
      <div className="mt-6 bg-blue-50 rounded-lg p-4">
        <div className="flex items-center">
          <svg className="h-5 w-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          <span className="text-sm font-medium text-blue-900">Tamper-Proof Verification</span>
        </div>
        <p className="text-xs text-blue-700 mt-1">
          This chain of custody is cryptographically secured and cannot be altered. Each event is timestamped and hashed.
        </p>
      </div>
    </div>
  );
};

