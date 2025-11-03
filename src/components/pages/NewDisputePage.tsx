import React from 'react'
import { useNavigate } from 'react-router-dom'
import { CreateDispute } from '../disputes/CreateDispute'

export const NewDisputePage: React.FC = () => {
  const navigate = useNavigate()

  const handleSuccess = (disputeId: string) => {
    navigate(`/disputes/${disputeId}`)
  }

  const handleCancel = () => {
    navigate('/disputes')
  }

  return (
    <div>
      <CreateDispute 
        onSuccess={handleSuccess}
        onCancel={handleCancel}
      />
    </div>
  )
}

