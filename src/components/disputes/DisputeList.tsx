import React from 'react'
import { Dispute } from '../../hooks/useArbitra'
import { 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  FileText,
  ArrowRight 
} from 'lucide-react'

interface DisputeListProps {
  disputes: Dispute[]
  onSelectDispute?: (dispute: Dispute) => void
}

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const statusConfig: Record<string, { color: string; icon: React.ComponentType<React.SVGProps<SVGSVGElement>> }> = {
    'Draft': { color: 'bg-gray-100 text-gray-800', icon: FileText },
    'Active': { color: 'bg-blue-100 text-blue-800', icon: Clock },
    'EvidenceSubmission': { color: 'bg-yellow-100 text-yellow-800', icon: AlertCircle },
    'AIAnalysis': { color: 'bg-purple-100 text-purple-800', icon: Clock },
    'ArbitratorReview': { color: 'bg-green-100 text-green-800', icon: CheckCircle },
    'Settled': { color: 'bg-green-100 text-green-800', icon: CheckCircle },
    'Closed': { color: 'bg-gray-100 text-gray-800', icon: CheckCircle },
    'Appealed': { color: 'bg-orange-100 text-orange-800', icon: AlertCircle },
  }

  const config = statusConfig[status] || statusConfig['Draft']
  const Icon = config.icon

  return (
    <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
      <Icon size={12} />
      <span>{status}</span>
    </span>
  )
}

export const DisputeList: React.FC<DisputeListProps> = ({ 
  disputes, 
  onSelectDispute 
}) => {
  const formatDate = (timestamp: bigint) => {
    return new Date(Number(timestamp) / 1000000).toLocaleDateString()
  }

  const formatAmount = (amount: number, currency: string) => {
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency === 'ICP' ? 'USD' : currency, // Fallback for demo
      minimumFractionDigits: 2
    })
    
    const displayAmount = currency === 'USD' ? amount / 100 : amount
    return formatter.format(displayAmount)
  }

  return (
    <div className="space-y-4">
      {disputes.map((dispute) => (
        <div
          key={dispute.id}
          className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => onSelectDispute?.(dispute)}
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h3 className="text-lg font-semibold text-gray-900">
                  {dispute.title}
                </h3>
                <StatusBadge status={dispute.status} />
              </div>
              
              <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                {dispute.description}
              </p>

              <div className="flex items-center space-x-6 text-sm text-gray-500">
                <span>ID: {dispute.id}</span>
                <span>Amount: {formatAmount(Number(dispute.amountInDispute), dispute.currency)}</span>
                <span>Created: {formatDate(dispute.createdAt)}</span>
                <span>Law: {dispute.governingLaw}</span>
              </div>
            </div>

            <ArrowRight className="h-5 w-5 text-gray-400" />
          </div>
        </div>
      ))}
    </div>
  )
}

