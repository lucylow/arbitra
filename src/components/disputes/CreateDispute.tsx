import React, { useState } from 'react'
import { useArbitra } from '../../hooks/useArbitra'
import { useInternetIdentity } from '../../hooks/useInternetIdentity'
import { FileText, DollarSign, Globe, Scale } from 'lucide-react'

interface CreateDisputeProps {
  onSuccess?: (disputeId: string) => void
  onCancel?: () => void
}

export const CreateDispute: React.FC<CreateDisputeProps> = ({ 
  onSuccess, 
  onCancel 
}) => {
  const { identity } = useInternetIdentity()
  const { createDispute, isLoading, error } = useArbitra(identity)

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    defendant: '',
    amountInDispute: '',
    currency: 'USD',
    governingLaw: 'Uniform Commercial Code',
    arbitrationClause: 'Parties agree to binding arbitration through Arbitra platform. AI analysis will be used as advisory, with final decision subject to parties agreement or human arbitrator review.'
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const result = await createDispute(
      formData.title,
      formData.description,
      formData.defendant,
      parseFloat(formData.amountInDispute) * 100, // Convert to cents
      formData.currency,
      formData.governingLaw,
      formData.arbitrationClause
    )

    if (result.success && result.disputeId) {
      onSuccess?.(result.disputeId)
      // Reset form
      setFormData({
        title: '',
        description: '',
        defendant: '',
        amountInDispute: '',
        currency: 'USD',
        governingLaw: 'Uniform Commercial Code',
        arbitrationClause: 'Parties agree to binding arbitration through Arbitra platform. AI analysis will be used as advisory, with final decision subject to parties agreement or human arbitrator review.'
      })
    }
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="px-6 py-4 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            Create New Dispute
          </h2>
          <p className="text-gray-600 mt-1">
            Start a new arbitration case. All disputes are recorded on the ICP blockchain.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Dispute Title *
              </label>
              <div className="relative">
                <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  id="title"
                  name="title"
                  required
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g., Late Delivery Contract Breach"
                  className="pl-10 w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label htmlFor="defendant" className="block text-sm font-medium text-gray-700 mb-2">
                Defendant Principal ID *
              </label>
              <input
                type="text"
                id="defendant"
                name="defendant"
                required
                value={formData.defendant}
                onChange={handleChange}
                placeholder="e.g., r7inp-6aaaa-aaaaa-aaabq-cai"
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Detailed Description *
            </label>
            <textarea
              id="description"
              name="description"
              required
              rows={4}
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe the nature of the dispute, relevant contracts, and the relief sought..."
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Financial Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="amountInDispute" className="block text-sm font-medium text-gray-700 mb-2">
                Amount in Dispute *
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="number"
                  id="amountInDispute"
                  name="amountInDispute"
                  required
                  min="0"
                  step="0.01"
                  value={formData.amountInDispute}
                  onChange={handleChange}
                  placeholder="0.00"
                  className="pl-10 w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label htmlFor="currency" className="block text-sm font-medium text-gray-700 mb-2">
                Currency
              </label>
              <select
                id="currency"
                name="currency"
                value={formData.currency}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="USD">USD</option>
                <option value="ICP">ICP</option>
                <option value="ckBTC">ckBTC</option>
                <option value="EUR">EUR</option>
              </select>
            </div>
          </div>

          {/* Legal Framework */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="governingLaw" className="block text-sm font-medium text-gray-700 mb-2">
                Governing Law *
              </label>
              <div className="relative">
                <Scale className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <select
                  id="governingLaw"
                  name="governingLaw"
                  required
                  value={formData.governingLaw}
                  onChange={handleChange}
                  className="pl-10 w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="Uniform Commercial Code">Uniform Commercial Code</option>
                  <option value="Common Law">Common Law</option>
                  <option value="Civil Law">Civil Law</option>
                  <option value="International Commercial Arbitration">International Commercial Arbitration</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="jurisdiction" className="block text-sm font-medium text-gray-700 mb-2">
                Legal Jurisdiction
              </label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <select
                  className="pl-10 w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  defaultValue="International"
                >
                  <option value="International">International</option>
                  <option value="US">United States</option>
                  <option value="EU">European Union</option>
                  <option value="UK">United Kingdom</option>
                </select>
              </div>
            </div>
          </div>

          {/* Arbitration Clause */}
          <div>
            <label htmlFor="arbitrationClause" className="block text-sm font-medium text-gray-700 mb-2">
              Arbitration Agreement *
            </label>
            <textarea
              id="arbitrationClause"
              name="arbitrationClause"
              required
              rows={3}
              value={formData.arbitrationClause}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="text-sm text-gray-500 mt-1">
              This clause will be part of the binding arbitration agreement between parties.
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-4 pt-6 border-t">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Creating Dispute...' : 'Create Dispute'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

