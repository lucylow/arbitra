import React, { useState } from 'react';
import { useDisputes } from '../../hooks/useDisputes';

interface Dispute {
  id: string;
  title: string;
  status: 'draft' | 'active' | 'evidence' | 'analysis' | 'decision' | 'settled' | 'appealed';
  parties: string[];
  amount: number;
  currency: string;
  createdAt: string;
  updatedAt: string;
  nextAction?: string;
  progress: number;
}

export const DisputeDashboard: React.FC = () => {
  const { disputes: backendDisputes, loading } = useDisputes();
  const [filter, setFilter] = useState<'all' | 'active' | 'pending' | 'completed'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Convert backend disputes to frontend format
  const disputes: Dispute[] = backendDisputes.map(d => ({
    id: d.id,
    title: d.title,
    status: mapStatus(d.status),
    parties: [d.claimant.toString(), d.respondent.toString()],
    amount: Number(d.amount) / 1e8, // Convert from bigint (assuming 8 decimals)
    currency: 'USD',
    createdAt: new Date(Number(d.createdAt) / 1e6).toISOString(),
    updatedAt: new Date(Number(d.updatedAt) / 1e6).toISOString(),
    progress: calculateProgress(d.status),
    nextAction: getNextAction(d.status)
  }));

  function mapStatus(status: string): Dispute['status'] {
    const statusMap: Record<string, Dispute['status']> = {
      'Pending': 'draft',
      'EvidenceSubmission': 'evidence',
      'UnderReview': 'analysis',
      'Decided': 'decision',
      'Settled': 'settled',
      'Appealed': 'appealed',
      'Closed': 'settled'
    };
    return statusMap[status] || 'draft';
  }

  function calculateProgress(status: string): number {
    const progressMap: Record<string, number> = {
      'Pending': 10,
      'EvidenceSubmission': 40,
      'UnderReview': 60,
      'Decided': 80,
      'Settled': 100,
      'Appealed': 90,
      'Closed': 100
    };
    return progressMap[status] || 0;
  }

  function getNextAction(status: string): string | undefined {
    const actionMap: Record<string, string> = {
      'Pending': 'Submit Evidence',
      'EvidenceSubmission': 'Submit Evidence',
      'UnderReview': 'Review AI Analysis',
      'Decided': 'View Decision',
      'Appealed': 'Review Appeal'
    };
    return actionMap[status];
  }

  const filteredDisputes = disputes.filter(dispute => {
    const matchesFilter = filter === 'all' || 
      (filter === 'active' && ['active', 'evidence', 'analysis'].includes(dispute.status)) ||
      (filter === 'pending' && ['draft', 'evidence'].includes(dispute.status)) ||
      (filter === 'completed' && ['settled', 'appealed'].includes(dispute.status));
    
    const matchesSearch = dispute.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dispute.id.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const getStatusColor = (status: string) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-800',
      active: 'bg-blue-100 text-blue-800',
      evidence: 'bg-yellow-100 text-yellow-800',
      analysis: 'bg-purple-100 text-purple-800',
      decision: 'bg-orange-100 text-orange-800',
      settled: 'bg-green-100 text-green-800',
      appealed: 'bg-red-100 text-red-800',
    };
    return colors[status as keyof typeof colors] || colors.draft;
  };

  const getStatusIcon = (status: string) => {
    const icons = {
      draft: '📝',
      active: '⚡',
      evidence: '📁',
      analysis: '🤖',
      decision: '⚖️',
      settled: '✅',
      appealed: '🔄',
    };
    return icons[status as keyof typeof icons] || '📝';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dispute Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your active disputes and track their progress
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button
            type="button"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Dispute
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-blue-600">📝</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Disputes</dt>
                  <dd className="text-lg font-medium text-gray-900">{disputes.length}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <span className="text-yellow-600">⚡</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Active</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {disputes.filter(d => ['active', 'evidence', 'analysis'].includes(d.status)).length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <span className="text-green-600">✅</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Settled</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {disputes.filter(d => d.status === 'settled').length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <span className="text-purple-600">🤖</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">AI Analysis</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {disputes.filter(d => d.status === 'analysis').length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="sm:flex sm:items-center sm:justify-between">
            <div className="sm:flex sm:space-x-4">
              <div className="flex space-x-1">
                {(['all', 'active', 'pending', 'completed'] as const).map((filterType) => (
                  <button
                    key={filterType}
                    onClick={() => setFilter(filterType)}
                    className={`px-3 py-2 text-sm font-medium rounded-md ${
                      filter === filterType
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-4 sm:mt-0">
              <div className="relative rounded-md shadow-sm">
                <input
                  type="text"
                  placeholder="Search disputes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pr-10 sm:text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Disputes List */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {filteredDisputes.map((dispute) => (
            <li key={dispute.id}>
              <div className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <span className="text-lg">{getStatusIcon(dispute.status)}</span>
                    </div>
                    <div className="ml-4">
                      <div className="flex items-center">
                        <h3 className="text-sm font-medium text-gray-900">
                          {dispute.title}
                        </h3>
                        <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(dispute.status)}`}>
                          {dispute.status}
                        </span>
                      </div>
                      <div className="mt-1 text-sm text-gray-500">
                        <span>ID: {dispute.id}</span>
                        <span className="mx-2">•</span>
                        <span>Created: {new Date(dispute.createdAt).toLocaleDateString()}</span>
                        <span className="mx-2">•</span>
                        <span>${dispute.amount.toFixed(2)} {dispute.currency}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    {/* Progress Bar */}
                    <div className="w-32">
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                        <span>Progress</span>
                        <span>{dispute.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${dispute.progress}%` }}
                        />
                      </div>
                    </div>

                    {/* Action Button */}
                    {dispute.nextAction && (
                      <button className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                        {dispute.nextAction}
                      </button>
                    )}

                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>

        {filteredDisputes.length === 0 && (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No disputes found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by creating a new dispute.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

