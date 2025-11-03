import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useArbitra } from '../../hooks/useArbitra'
import { useInternetIdentity } from '../../hooks/useInternetIdentity'
import { DisputeList } from '../disputes/DisputeList'
import { Loading } from '../ui/Loading'
import { useState, useEffect } from 'react'

export const DisputesPage: React.FC = () => {
  const navigate = useNavigate()
  const { identity, isAuthenticated } = useInternetIdentity()
  const { getUserDisputes, isLoading, error } = useArbitra(identity)
  const [disputes, setDisputes] = useState<any[]>([])

  useEffect(() => {
    const loadDisputes = async () => {
      if (isAuthenticated && identity) {
        const userDisputes = await getUserDisputes()
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

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        <p>Error loading disputes: {error}</p>
      </div>
    )
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

