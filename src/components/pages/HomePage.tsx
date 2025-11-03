import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Dashboard } from '../dashboard/Dashboard'

export const HomePage: React.FC = () => {
  const navigate = useNavigate()

  const handleSelectDispute = (dispute: { id: string }) => {
    navigate(`/disputes/${dispute.id}`)
  }

  return (
    <div>
      <Dashboard onSelectDispute={handleSelectDispute} />
    </div>
  )
}

