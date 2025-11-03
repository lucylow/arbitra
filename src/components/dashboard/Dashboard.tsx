import React, { useState, useEffect } from 'react'
import { useArbitra, Dispute } from '../../hooks/useArbitra'
import { useInternetIdentity } from '../../hooks/useInternetIdentity'
import { DisputeList } from '../disputes/DisputeList'
import { Loading } from '../ui/Loading'
import { 
  Scale, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  AlertCircle 
} from 'lucide-react'

interface DashboardProps {
  onSelectDispute?: (dispute: Dispute) => void
}

export const Dashboard: React.FC<DashboardProps> = ({ onSelectDispute }) => {
  const { identity, isAuthenticated } = useInternetIdentity()
  const { getUserDisputes, isLoading, error } = useArbitra(identity)
  const [disputes, setDisputes] = useState<Dispute[]>([])
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    resolved: 0,
    pending: 0
  })

  useEffect(() => {
    const loadDisputes = async () => {
      if (isAuthenticated && identity) {
        const userDisputes = await getUserDisputes()
        setDisputes(userDisputes)
        
        // Calculate stats
        setStats({
          total: userDisputes.length,
          active: userDisputes.filter(d => 
            d.status === 'Active' || d.status === 'EvidenceSubmission'
          ).length,
          resolved: userDisputes.filter(d => 
            d.status === 'Settled' || d.status === 'Closed'
          ).length,
          pending: userDisputes.filter(d => 
            d.status === 'Draft' || d.status === 'AIAnalysis'
          ).length
        })
      }
    }

    loadDisputes()
  }, [isAuthenticated, identity, getUserDisputes])

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Scale className="h-24 w-24 text-gray-300 mb-4" />
        <h2 className="text-2xl font-bold text-gray-600 mb-2">
          Welcome to Arbitra
        </h2>
        <p className="text-gray-500 text-center max-w-md">
          Please login with Internet Identity to access your disputes and 
          create new arbitration cases.
        </p>
      </div>
    )
  }

  if (isLoading) {
    return <Loading message="Loading your disputes..." />
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 text-red-800">
            <AlertCircle size={20} />
            <span className="font-medium">Backend Connection Error</span>
          </div>
          <p className="text-red-600 mt-1">{error}</p>
          <div className="mt-3 text-sm text-red-700">
            <p className="font-medium">Troubleshooting steps:</p>
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li>Ensure the local ICP replica is running: <code className="bg-red-100 px-1 rounded">dfx start</code></li>
              <li>Verify canisters are deployed: <code className="bg-red-100 px-1 rounded">dfx deploy</code></li>
              <li>Check that canister IDs are configured in environment variables</li>
              <li>Run <code className="bg-red-100 px-1 rounded">dfx build</code> to generate IDL files</li>
            </ul>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Disputes</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <Scale className="h-8 w-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.active}</p>
            </div>
            <Clock className="h-8 w-8 text-yellow-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Resolved</p>
              <p className="text-2xl font-bold text-green-600">{stats.resolved}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-blue-600">{stats.pending}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-blue-500" />
          </div>
        </div>
      </div>

      {/* Disputes List */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">
            Your Disputes
          </h2>
        </div>
        <div className="p-6">
          {disputes.length === 0 ? (
            <div className="text-center py-12">
              <Scale className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No disputes yet
              </h3>
              <p className="text-gray-500 max-w-sm mx-auto">
                Get started by creating your first dispute resolution case.
              </p>
            </div>
          ) : (
            <DisputeList disputes={disputes} onSelectDispute={onSelectDispute} />
          )}
        </div>
      </div>
    </div>
  )
}

