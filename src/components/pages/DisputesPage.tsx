import React from 'react'
import { useNavigate } from 'react-router-dom'
import { DisputeList } from '../disputes/DisputeList'
import { Loading } from '../ui/Loading'
import { useMockData } from '../../hooks/useMockData'

export const DisputesPage: React.FC = () => {
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
        <h1 className="text-2xl font-bold text-gray-900">All Disputes</h1>
        <p className="mt-1 text-sm text-gray-500">View and manage all disputes</p>
      </div>
      <DisputeList disputes={disputes} onSelectDispute={handleSelectDispute} />
    </div>
  )
}

