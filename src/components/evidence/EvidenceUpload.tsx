import React, { useState } from 'react'
import { useArbitra } from '../../hooks/useArbitra'
import { useInternetIdentity } from '../../hooks/useInternetIdentity'
import { Upload, FileText, X, Shield } from 'lucide-react'
import { calculateFileHash } from '../../utils/constellation'

interface EvidenceUploadProps {
  disputeId: string
  onClose: () => void
  onSuccess: () => void
}

export const EvidenceUpload: React.FC<EvidenceUploadProps> = ({
  disputeId,
  onClose,
  onSuccess
}) => {
  const { identity } = useInternetIdentity()
  const { submitEvidence, isLoading } = useArbitra(identity)

  const [file, setFile] = useState<File | null>(null)
  const [description, setDescription] = useState('')
  const [constellationHash, setConstellationHash] = useState('')

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      
      // Calculate hash for Constellation
      const hash = await calculateFileHash(selectedFile)
      setConstellationHash(hash)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!file) return

    const result = await submitEvidence(disputeId, file, description)
    
    if (result.success) {
      onSuccess()
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            Submit Evidence
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Evidence File *
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
              <input
                type="file"
                id="file-upload"
                className="hidden"
                onChange={handleFileSelect}
                accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">
                  Click to upload or drag and drop
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  PDF, DOC, TXT, JPG, PNG (Max 10MB)
                </p>
              </label>
            </div>
            
            {file && (
              <div className="mt-3 flex items-center space-x-2 text-sm text-gray-600">
                <FileText size={16} />
                <span>{file.name}</span>
                <span className="text-gray-400">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              required
              placeholder="Describe this evidence and its relevance to the dispute..."
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Constellation Hash Preview */}
          {constellationHash && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 text-blue-800 mb-2">
                <Shield size={16} />
                <span className="text-sm font-medium">Constellation Hash</span>
              </div>
              <p className="text-xs font-mono text-blue-600 break-all">
                {constellationHash}
              </p>
              <p className="text-xs text-blue-600 mt-1">
                This hash will be immutably stored on Constellation Network for verification
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!file || !description || isLoading}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Uploading...' : 'Submit Evidence'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

