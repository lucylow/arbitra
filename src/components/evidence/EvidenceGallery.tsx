import React, { useState } from 'react';
import type { Evidence } from '../../types';

interface EvidenceGalleryProps {
  evidence: Evidence[];
  disputeId?: string;
}

export const EvidenceGallery: React.FC<EvidenceGalleryProps> = ({ evidence }) => {
  const [selectedEvidence, setSelectedEvidence] = useState<Evidence | null>(null);

  const getEvidenceIcon = (type: string) => {
    const icons: Record<string, string> = {
      'Document': '📄',
      'Image': '🖼️',
      'Video': '🎥',
      'Audio': '🎵',
      'Text': '📝'
    };
    return icons[type] || '📄';
  };

  const getEvidenceColor = (type: string) => {
    const colors: Record<string, string> = {
      'Document': 'bg-blue-100 text-blue-800',
      'Image': 'bg-green-100 text-green-800',
      'Video': 'bg-purple-100 text-purple-800',
      'Audio': 'bg-orange-100 text-orange-800',
      'Text': 'bg-gray-100 text-gray-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  if (evidence.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6 text-center">
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">No evidence submitted</h3>
        <p className="mt-1 text-sm text-gray-500">Evidence will appear here once submitted.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Evidence Gallery</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {evidence.map((item) => (
            <div
              key={item.id}
              onClick={() => setSelectedEvidence(item)}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">{getEvidenceIcon(item.evidenceType)}</span>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getEvidenceColor(item.evidenceType)}`}>
                    {item.evidenceType}
                  </span>
                </div>
                {item.verified && (
                  <div className="flex items-center text-green-600">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                )}
              </div>
              <p className="text-sm font-medium text-gray-900 truncate">
                {item.description || 'Evidence Document'}
              </p>
              <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                <span>{new Date(Number(item.timestamp) / 1e6).toLocaleDateString()}</span>
                <code className="bg-gray-100 px-1 rounded font-mono text-xs">
                  {item.contentHash.substring(0, 8)}...
                </code>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Evidence Detail Modal */}
      {selectedEvidence && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedEvidence(null)}>
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Evidence Details</h3>
                <button
                  onClick={() => setSelectedEvidence(null)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Type</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedEvidence.evidenceType}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedEvidence.description}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Content Hash</label>
                  <code className="mt-1 block text-sm bg-gray-100 p-2 rounded font-mono">
                    {selectedEvidence.contentHash}
                  </code>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Submitted By</label>
                  <code className="mt-1 block text-sm bg-gray-100 p-2 rounded font-mono">
                    {selectedEvidence.submittedBy.toString()}
                  </code>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Timestamp</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {new Date(Number(selectedEvidence.timestamp) / 1e6).toLocaleString()}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Verification Status</label>
                  <div className="mt-1 flex items-center">
                    {selectedEvidence.verified ? (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Verified
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        Pending Verification
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

