import React, { useState, useEffect } from 'react'
import { useArbitra, Dispute } from '../../hooks/useArbitra'
import { EvidenceUpload } from '../evidence/EvidenceUpload'
import { useInternetIdentity } from '../../hooks/useInternetIdentity'
import { 
  Clock, 
  CheckCircle, 
  FileText, 
  Scale,
  User,
  Download,
  Brain
} from 'lucide-react'

interface DisputeDetailProps {
  disputeId: string
  onBack: () => void
}

export const DisputeDetail: React.FC<DisputeDetailProps> = ({ 
  disputeId, 
  onBack 
}) => {
  const { identity } = useInternetIdentity()
  const { getDispute, triggerAIAnalysis, isLoading } = useArbitra(identity)
  
  const [dispute, setDispute] = useState<Dispute | null>(null)
  const [showEvidenceUpload, setShowEvidenceUpload] = useState(false)

  useEffect(() => {
    const loadDispute = async () => {
      const disputeData = await getDispute(disputeId)
      setDispute(disputeData)
    }

    loadDispute()
  }, [disputeId, getDispute])

  const handleAIAnalysis = async () => {
    if (!dispute) return
    
    const result = await triggerAIAnalysis(dispute.id)
    if (result.success) {
      // Reload dispute to get updated ruling
      const updatedDispute = await getDispute(dispute.id)
      setDispute(updatedDispute)
    }
  }

  const formatDate = (timestamp: bigint) => {
    return new Date(Number(timestamp) / 1000000).toLocaleString()
  }

  const formatAmount = (amount: number, currency: string) => {
    const displayAmount = currency === 'USD' ? amount / 100 : amount
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency === 'ICP' ? 'USD' : currency,
    }).format(displayAmount)
  }

  if (!dispute) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Clock className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Loading dispute details...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="text-gray-500 hover:text-gray-700"
          >
            ← Back to disputes
          </button>
          <h1 className="text-2xl font-bold text-gray-900">{dispute.title}</h1>
        </div>
        
        <div className="flex items-center space-x-3">
          {dispute.status === 'EvidenceSubmission' && (
            <button
              onClick={() => setShowEvidenceUpload(true)}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              Submit Evidence
            </button>
          )}
          
          {dispute.status === 'EvidenceSubmission' && evidence.length > 0 && (
            <button
              onClick={handleAIAnalysis}
              disabled={isLoading}
              className="flex items-center space-x-2 bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 disabled:opacity-50 transition-colors"
            >
              <Brain size={16} />
              <span>{isLoading ? 'Analyzing...' : 'Start AI Analysis'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Evidence Upload Modal */}
      {showEvidenceUpload && (
        <EvidenceUpload
          disputeId={dispute.id}
          onClose={() => setShowEvidenceUpload(false)}
          onSuccess={() => {
            setShowEvidenceUpload(false)
            // Refresh evidence list
            getDispute(dispute.id).then(setDispute)
          }}
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Dispute Details */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Dispute Details
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Status</label>
                <p className="text-gray-900">{dispute.status}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500">Amount</label>
                <p className="text-gray-900">
                  {formatAmount(Number(dispute.amountInDispute), dispute.currency)}
                </p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500">Created</label>
                <p className="text-gray-900">{formatDate(dispute.createdAt)}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500">Updated</label>
                <p className="text-gray-900">{formatDate(dispute.updatedAt)}</p>
              </div>
              
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-gray-500">Description</label>
                <p className="text-gray-900 mt-1">{dispute.description}</p>
              </div>
            </div>
          </div>

          {/* Parties Information */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Parties
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <User size={16} className="text-blue-500" />
                  <span className="font-medium text-gray-900">Plaintiff</span>
                </div>
                <p className="text-sm font-mono text-gray-600 bg-gray-50 p-2 rounded">
                  {dispute.plaintiff.toString()}
                </p>
              </div>
              
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <User size={16} className="text-red-500" />
                  <span className="font-medium text-gray-900">Defendant</span>
                </div>
                <p className="text-sm font-mono text-gray-600 bg-gray-50 p-2 rounded">
                  {dispute.defendant.toString()}
                </p>
              </div>
            </div>
          </div>

          {/* Legal Framework */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Legal Framework
            </h2>
            
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-500">Governing Law</label>
                <p className="text-gray-900">{dispute.governingLaw}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500">Arbitration Clause</label>
                <p className="text-gray-900 mt-1 text-sm">{dispute.arbitrationClause}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Ruling Preview */}
          {dispute.ruling && (
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center space-x-2 mb-4">
                <Scale size={20} className="text-green-500" />
                <h3 className="text-lg font-semibold text-gray-900">AI Ruling</h3>
              </div>
              
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-500">Decision</label>
                  <p className="text-gray-900 font-medium">{dispute.ruling.decision}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">Plaintiff Award</label>
                  <p className="text-gray-900">{dispute.ruling.plaintiffAward}%</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">Confidence</label>
                  <p className="text-gray-900">
                    {(dispute.ruling.confidenceScore * 100).toFixed(1)}%
                  </p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">Reasoning</label>
                  <p className="text-gray-900 text-sm mt-1">{dispute.ruling.reasoning}</p>
                </div>
                
                {dispute.ruling.keyFactors.length > 0 && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Key Factors</label>
                    <ul className="text-gray-900 text-sm mt-1 list-disc list-inside">
                      {dispute.ruling.keyFactors.map((factor, index) => (
                        <li key={index}>{factor}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Actions Panel */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Actions
            </h3>
            
            <div className="space-y-3">
              <button className="w-full flex items-center justify-center space-x-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors">
                <Download size={16} />
                <span>Export Case Details</span>
              </button>
              
              <button className="w-full flex items-center justify-center space-x-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors">
                <FileText size={16} />
                <span>View Smart Contract</span>
              </button>
              
              {dispute.ruling && (
                <button className="w-full flex items-center justify-center space-x-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors">
                  <CheckCircle size={16} />
                  <span>Execute Settlement</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

