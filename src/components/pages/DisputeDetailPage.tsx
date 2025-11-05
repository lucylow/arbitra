import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { DisputeDetailMock } from '../disputes/DisputeDetailMock'

export const DisputeDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  if (!id) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        <p>Invalid dispute ID</p>
      </div>
    )
  }

  const handleBack = () => {
    navigate('/disputes')
  }

  return (
    <DisputeDetailMock 
      disputeId={id}
      onBack={handleBack}
    />
  )
}

