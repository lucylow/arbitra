import React, { useState, useEffect } from 'react'
import { ArrowLeft, FileText, Users, Scale, Download, ExternalLink, Play } from 'lucide-react'
import { EvidenceUpload } from '../evidence/EvidenceUpload'
import { useMockData } from '../../hooks/useMockData'
import type { MockDispute, MockAIAnalysis } from '../../types/mockData'

interface DisputeDetailMockProps {
  disputeId: string
  onBack: () => void
}

export const DisputeDetailMock: React.FC<DisputeDetailMockProps> = ({ disputeId, onBack }) => {
  const { disputes, mockApi } = useMockData()
  const [dispute, setDispute] = useState<MockDispute | null>(null)
  const [aiAnalysis, setAiAnalysis] = useState<MockAIAnalysis | null>(null)
  const [showEvidenceUpload, setShowEvidenceUpload] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)

  useEffect(() => {
    const loadDispute = async () => {
      const disputeData = await mockApi.getDisputeById(disputeId)
      setDispute(disputeData)
      
      if (disputeData) {
        const analysis = await mockApi.getAIAnalysis(disputeId)
        setAiAnalysis(analysis)
      }
    }
    loadDispute()
  }, [disputeId, mockApi])

  const handleAIAnalysis = async () => {
    setAnalyzing(true)
    try {
      await mockApi.triggerAIAnalysis(disputeId)
      const analysis = await mockApi.getAIAnalysis(disputeId)
      setAiAnalysis(analysis)
      const updatedDispute = await mockApi.getDisputeById(disputeId)
      setDispute(updatedDispute)
    } finally {
      setAnalyzing(false)
    }
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency === 'ckBTC' ? 'USD' : currency,
    }).format(amount)
  }

  if (!dispute) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dispute details...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Breadcrumbs */}
      <nav className="mb-6 flex items-center gap-2 text-sm">
        <button onClick={onBack} className="flex items-center gap-1 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
          Back to Disputes
        </button>
        <span className="text-muted-foreground">/</span>
        <span className="text-foreground font-medium">Dispute #{dispute.id}</span>
      </nav>

      {/* Header */}
      <div className="bg-card border rounded-lg p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">{dispute.title}</h1>
            <p className="text-muted-foreground">{dispute.description}</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowEvidenceUpload(true)}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
            >
              Submit Evidence
            </button>
            <button
              onClick={handleAIAnalysis}
              disabled={analyzing}
              className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 flex items-center gap-2 disabled:opacity-50"
            >
              <Play className="h-4 w-4" />
              {analyzing ? 'Analyzing...' : 'Start AI Analysis'}
            </button>
          </div>
        </div>
      </div>

      {showEvidenceUpload && (
        <EvidenceUpload
          disputeId={dispute.id.toString()}
          onClose={() => setShowEvidenceUpload(false)}
          onSuccess={() => {
            setShowEvidenceUpload(false)
          }}
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Details */}
          <div className="bg-card border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Details
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <p className="font-medium capitalize">{dispute.status.replace(/_/g, ' ')}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Amount</p>
                <p className="font-medium">{formatAmount(dispute.amount, dispute.currency)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Category</p>
                <p className="font-medium capitalize">{dispute.category.replace(/_/g, ' ')}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Created</p>
                <p className="font-medium">{formatDate(dispute.created_at)}</p>
              </div>
            </div>
          </div>

          {/* Parties */}
          <div className="bg-card border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Users className="h-5 w-5" />
              Parties
            </h2>
            <div className="space-y-3">
              {dispute.parties.map((party, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <span className="font-medium">{party}</span>
                  <span className="text-sm text-muted-foreground">
                    {index === 0 ? 'Plaintiff' : 'Defendant'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Legal Framework */}
          {dispute.governing_law && (
            <div className="bg-card border rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Scale className="h-5 w-5" />
                Legal Framework
              </h2>
              <div>
                <p className="text-sm text-muted-foreground">Governing Law</p>
                <p className="font-medium">{dispute.governing_law}</p>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* AI Ruling Preview */}
          {aiAnalysis && (
            <div className="bg-card border rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">AI Ruling Preview</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Suggested Decision</p>
                  <p className="font-medium capitalize">{aiAnalysis.suggested_ruling.replace(/_/g, ' ')}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Confidence Score</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-muted rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ width: `${aiAnalysis.confidence_score}%` }}
                      />
                    </div>
                    <span className="font-medium">{aiAnalysis.confidence_score}%</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Reasoning</p>
                  <p className="text-sm">{aiAnalysis.reasoning}</p>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="bg-card border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Actions</h2>
            <div className="space-y-2">
              <button className="w-full px-4 py-2 bg-muted hover:bg-muted/80 rounded-lg flex items-center gap-2 justify-center">
                <Download className="h-4 w-4" />
                Export Details
              </button>
              <button className="w-full px-4 py-2 bg-muted hover:bg-muted/80 rounded-lg flex items-center gap-2 justify-center">
                <ExternalLink className="h-4 w-4" />
                View Smart Contract
              </button>
              {aiAnalysis && (
                <button className="w-full px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg">
                  Execute Settlement
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
