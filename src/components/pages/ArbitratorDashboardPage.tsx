import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useArbitra } from '../../hooks/useArbitra'
import { useInternetIdentity } from '../../hooks/useInternetIdentity'
import { DisputeList } from '../disputes/DisputeList'
import { Loading } from '../ui/Loading'
import { useState, useEffect } from 'react'
import { Users, Scale } from 'lucide-react'

export const ArbitratorDashboardPage: React.FC = () => {
  const navigate = useNavigate()
  const { identity, isAuthenticated } = useInternetIdentity()
  const { getUserDisputes, isLoading, error } = useArbitra(identity)
  const [disputes, setDisputes] = useState<any[]>([])

  useEffect(() => {
    const loadDisputes = async () => {
      if (isAuthenticated && identity) {
        const userDisputes = await getUserDisputes()
        // Filter disputes where user is arbitrator or show all for demo
        setDisputes(userDisputes)
      }
    }
    loadDisputes()
  }, [isAuthenticated, identity, getUserDisputes])

  const handleSelectDispute = (dispute: { id: string }) => {
    navigate(`/disputes/${dispute.id}`)
  }

  if (isLoading) {
    return <Loading />
  }

  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center space-x-3 mb-2">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Users className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Arbitrator Dashboard</h1>
            <p className="text-sm text-gray-500">Review and manage assigned disputes</p>
          </div>
        </div>
      </div>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          <p>Error loading disputes: {error}</p>
        </div>
      )}

      {disputes.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-12 text-center">
          <Scale className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Assigned Disputes</h3>
          <p className="text-gray-500">You don't have any disputes assigned for arbitration yet.</p>
        </div>
      ) : (
        <DisputeList disputes={disputes} onSelectDispute={handleSelectDispute} />
      )}
    </div>
  )
}

