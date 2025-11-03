import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

interface EvidenceUploadProps {
  disputeId: string;
  onUploadComplete?: (evidenceId: string) => void;
  onClose?: () => void;
  onSuccess?: () => void;
}

interface UploadProgress {
  file: File;
  progress: number;
  status: 'uploading' | 'hashing' | 'anchoring' | 'complete' | 'error';
  constellationTxId?: string;
  error?: string;
}

export const EvidenceUpload: React.FC<EvidenceUploadProps> = ({
  disputeId,
  onUploadComplete,
  onSuccess
}) => {
  const [uploads, setUploads] = useState<UploadProgress[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const processFileUpload = async (upload: UploadProgress) => {
    try {
      // Step 1: Calculate file hash
      updateUploadStatus(upload.file.name, 'hashing', 25);
      const hash = await calculateFileHash(upload.file);
      
      // Step 2: Upload to temporary storage
      updateUploadStatus(upload.file.name, 'uploading', 50);
      const storageUrl = await uploadToTemporaryStorage(upload.file);
      
      // Step 3: Anchor to Constellation
      updateUploadStatus(upload.file.name, 'anchoring', 75);
      const constellationTxId = await anchorToConstellation(hash);
      
      // Step 4: Submit to blockchain
      const evidenceId = await submitToBlockchain({
        disputeId,
        fileName: upload.file.name,
        fileSize: upload.file.size,
        fileType: upload.file.type,
        hash,
        constellationTxId,
        storageUrl
      });

      updateUploadStatus(upload.file.name, 'complete', 100, constellationTxId);
      if (onUploadComplete) {
        onUploadComplete(evidenceId);
      }
      if (onSuccess) {
        onSuccess();
      }

    } catch (error) {
      updateUploadStatus(upload.file.name, 'error', 0, undefined, (error as Error).message);
    }
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const newUploads: UploadProgress[] = acceptedFiles.map(file => ({
      file,
      progress: 0,
      status: 'uploading'
    }));

    setUploads(prev => [...prev, ...newUploads]);

    // Process each file
    for (const upload of newUploads) {
      await processFileUpload(upload);
    }
  }, [disputeId]);

  const updateUploadStatus = (
    fileName: string,
    status: UploadProgress['status'],
    progress: number,
    constellationTxId?: string,
    error?: string
  ) => {
    setUploads(prev => prev.map(upload =>
      upload.file.name === fileName
        ? { ...upload, status, progress, constellationTxId, error }
        : upload
    ));
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    onDragEnter: () => setIsDragging(true),
    onDragLeave: () => setIsDragging(false),
    onDropAccepted: () => setIsDragging(false),
    multiple: true,
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  const getStatusIcon = (status: UploadProgress['status']) => {
    switch (status) {
      case 'uploading': return '📤';
      case 'hashing': return '🔍';
      case 'anchoring': return '⛓️';
      case 'complete': return '✅';
      case 'error': return '❌';
      default: return '📄';
    }
  };

  const getStatusColor = (status: UploadProgress['status']) => {
    switch (status) {
      case 'uploading': return 'text-blue-600';
      case 'hashing': return 'text-purple-600';
      case 'anchoring': return 'text-orange-600';
      case 'complete': return 'text-green-600';
      case 'error': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Drop Zone */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 ${
          isDragActive || isDragging
            ? 'border-blue-400 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
      >
        <input {...getInputProps()} />
        <div className="space-y-4">
          <div className="mx-auto h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          <div>
            <p className="text-lg font-medium text-gray-900">
              {isDragActive ? 'Drop files here' : 'Upload evidence files'}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Drag and drop files here, or click to browse
            </p>
            <p className="text-xs text-gray-400 mt-2">
              Supports PDF, DOC, images, and videos up to 10MB each
            </p>
          </div>
        </div>
      </div>

      {/* Upload Progress */}
      {uploads.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-lg font-medium text-gray-900">Upload Progress</h4>
          {uploads.map((upload, index) => (
            <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <span className="text-lg">{getStatusIcon(upload.status)}</span>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {upload.file.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {(upload.file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <div className={`text-sm font-medium ${getStatusColor(upload.status)}`}>
                  {upload.status.charAt(0).toUpperCase() + upload.status.slice(1)}
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                <div
                  className="h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${upload.progress}%`,
                    backgroundColor:
                      upload.status === 'error' ? '#ef4444' :
                      upload.status === 'complete' ? '#10b981' : '#3b82f6'
                  }}
                />
              </div>

              {/* Status Details */}
              <div className="flex justify-between text-xs text-gray-500">
                <span>
                  {upload.status === 'hashing' && 'Calculating file hash...'}
                  {upload.status === 'uploading' && 'Uploading to secure storage...'}
                  {upload.status === 'anchoring' && 'Anchoring to Constellation network...'}
                  {upload.status === 'complete' && 'Secured on blockchain'}
                  {upload.status === 'error' && upload.error}
                </span>
                <span>{upload.progress}%</span>
              </div>

              {/* Constellation Transaction */}
              {upload.constellationTxId && (
                <div className="mt-2 text-xs">
                  <span className="text-gray-500">Transaction: </span>
                  <code className="bg-gray-100 px-1 rounded font-mono">
                    {upload.constellationTxId.slice(0, 16)}...
                  </code>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Security Features */}
      <div className="bg-blue-50 rounded-lg p-4">
        <h5 className="text-sm font-medium text-blue-900 mb-2">
          🔒 Blockchain Security Features
        </h5>
        <ul className="text-xs text-blue-700 space-y-1">
          <li>• All files cryptographically hashed and timestamped</li>
          <li>• Evidence anchored to Constellation Network for immutability</li>
          <li>• Complete chain of custody tracking</li>
          <li>• End-to-end encryption for sensitive documents</li>
        </ul>
      </div>
    </div>
  );
};

// Mock implementations for file processing
const calculateFileHash = async (file: File): Promise<string> => {
  const arrayBuffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

const uploadToTemporaryStorage = async (file: File): Promise<string> => {
  // Simulate upload delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  return `https://storage.arbitra.legal/${file.name}`;
};

const anchorToConstellation = async (hash: string): Promise<string> => {
  // Simulate Constellation anchoring
  await new Promise(resolve => setTimeout(resolve, 1500));
  return `CONSTELLATION_TX_${hash.slice(0, 16)}_${Date.now()}`;
};

const submitToBlockchain = async (evidence: any): Promise<string> => {
  // Simulate blockchain submission
  await new Promise(resolve => setTimeout(resolve, 1000));
  return `EVID_${evidence.disputeId}_${Date.now()}`;
};
