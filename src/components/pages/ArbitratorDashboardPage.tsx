import React from 'react'
import { useNavigate } from 'react-router-dom'
import { DisputeList } from '../disputes/DisputeList'
import { Loading } from '../ui/Loading'
import { useMockData } from '../../hooks/useMockData'
import { Users, Scale } from 'lucide-react'

export const ArbitratorDashboardPage: React.FC = () => {
  const navigate = useNavigate()
  const { disputes, loading } = useMockData()

  const handleSelectDispute = (dispute: { id: string | number }) => {
    navigate(`/disputes/${dispute.id}`)
  }

  if (loading) {
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

