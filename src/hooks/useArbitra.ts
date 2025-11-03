import { useState, useEffect, useCallback } from 'react'
import { ActorSubclass } from '@dfinity/agent'
import { Principal } from '@dfinity/principal'

export interface Dispute {
  id: string
  title: string
  description: string
  plaintiff: Principal
  defendant: Principal
  arbitrator: Principal | null
  amountInDispute: number
  currency: string
  governingLaw: string
  arbitrationClause: string
  createdAt: bigint
  updatedAt: bigint
  status: string
  evidenceIds: string[]
  ruling: Ruling | null
}

export interface Ruling {
  id: string
  disputeId: string
  decision: string
  plaintiffAward: number
  reasoning: string
  confidenceScore: number
  keyFactors: string[]
  issuedAt: bigint
  issuedBy: Principal
}

export interface Evidence {
  id: string
  disputeId: string
  submittedBy: Principal
  fileName: string
  fileType: string
  fileSize: number
  constellationHash: string
  description: string
  submittedAt: bigint
}

function convertBackendDispute(backendDispute: any): Dispute {
  // Handle different backend dispute formats
  const id = backendDispute.id?.toString() || backendDispute.id || '';
  const status = backendDispute.status ? (
    typeof backendDispute.status === 'string' ? backendDispute.status :
    'Draft' in backendDispute.status ? 'Draft' :
    'Active' in backendDispute.status ? 'Active' :
    'EvidenceSubmission' in backendDispute.status ? 'EvidenceSubmission' :
    'AIAnalysis' in backendDispute.status ? 'AIAnalysis' :
    'ArbitratorReview' in backendDispute.status ? 'ArbitratorReview' :
    'Settled' in backendDispute.status ? 'Settled' :
    'Appealed' in backendDispute.status ? 'Appealed' :
    'Closed' in backendDispute.status ? 'Closed' : 'Draft'
  ) : 'Draft';

  const ruling = backendDispute.ruling ? (
    Array.isArray(backendDispute.ruling) && backendDispute.ruling.length > 0 ?
      backendDispute.ruling[0] : backendDispute.ruling
  ) : null;

  return {
    id,
    title: backendDispute.title || '',
    description: backendDispute.description || '',
    plaintiff: backendDispute.plaintiff || backendDispute.claimant,
    defendant: backendDispute.defendant || backendDispute.respondent,
    arbitrator: backendDispute.arbitrator || null,
    amountInDispute: Number(backendDispute.amountInDispute || backendDispute.amount || 0),
    currency: backendDispute.currency || 'USD',
    governingLaw: backendDispute.governingLaw || '',
    arbitrationClause: backendDispute.arbitrationClause || '',
    createdAt: BigInt(backendDispute.createdAt || 0),
    updatedAt: BigInt(backendDispute.updatedAt || 0),
    status,
    evidenceIds: (backendDispute.evidence || []).map((e: any) => e.hash || e.id?.toString() || ''),
    ruling: ruling ? {
      id: ruling.id?.toString() || '',
      disputeId: id,
      decision: ruling.decision || '',
      plaintiffAward: Number(ruling.plaintiffAward || 50),
      reasoning: ruling.reasoning || '',
      confidenceScore: Number(ruling.confidenceScore || 0),
      keyFactors: ruling.keyFactors || [],
      issuedAt: BigInt(ruling.issuedAt || 0),
      issuedBy: ruling.issuedBy,
    } : null,
  };
}

export const useArbitra = (identity: Principal | null) => {
  const [actor, setActor] = useState<ActorSubclass | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const initActor = async () => {
      if (!identity) {
        setActor(null)
        setError(null)
        return
      }

      try {
        setIsLoading(true)
        setError(null)
        
        console.log('🔌 Initializing Arbitra actor for identity:', identity.toString())
        
        // Use the existing actor factory from services
        const { createArbitraBackendActor } = await import('../services/actors');
        const arbitraActor = await createArbitraBackendActor();
        
        // Test the connection with a health check if available
        try {
          const health = await (arbitraActor as any).health?.() || 'Connection established';
          console.log('✅ Backend connection verified:', health);
        } catch (healthError) {
          // Health check not available, but actor is created
          console.log('⚠️  Health check not available, but actor created');
        }
        
        setActor(arbitraActor as any);
        console.log('✅ Arbitra actor initialized successfully');
      } catch (err: any) {
        console.error('❌ Failed to initialize actor:', err)
        const errorMsg = err?.message || 'Failed to connect to Arbitra backend';
        setError(errorMsg)
        
        // Provide helpful error message
        if (errorMsg.includes('CANISTER_ID')) {
          setError('Backend canister ID not configured. Please deploy canisters or check environment variables.')
        } else if (errorMsg.includes('IDL')) {
          setError('IDL files not found. Please run "dfx build" to generate canister interfaces.')
        } else {
          setError(`Connection error: ${errorMsg}`)
        }
      } finally {
        setIsLoading(false)
      }
    }

    initActor()
  }, [identity])

  const createDispute = useCallback(async (
    title: string,
    description: string,
    defendant: string,
    amountInDispute: number,
    currency: string,
    governingLaw: string,
    arbitrationClause: string
  ): Promise<{ success: boolean; disputeId?: string; error?: string }> => {
    if (!actor) return { success: false, error: 'Not authenticated' }

    setIsLoading(true)
    setError(null)

    try {
      const defendantPrincipal = Principal.fromText(defendant)
      const result = await (actor as any).createDispute(
        title,
        description,
        defendantPrincipal,
        BigInt(amountInDispute),
        currency,
        governingLaw,
        arbitrationClause
      ) as { ok?: string; err?: string }

      if (result && 'ok' in result && result.ok) {
        return { success: true, disputeId: result.ok }
      } else {
        const errMsg = result && 'err' in result ? String(result.err) : 'Unknown error'
        return { success: false, error: errMsg }
      }
    } catch (err) {
      const errorMsg = `Failed to create dispute: ${err}`
      setError(errorMsg)
      return { success: false, error: errorMsg }
    } finally {
      setIsLoading(false)
    }
  }, [actor])

  const submitEvidence = useCallback(async (
    disputeId: string,
    file: File,
    description: string
  ): Promise<{ success: boolean; evidenceId?: string; error?: string }> => {
    if (!actor) return { success: false, error: 'Not authenticated' }

    setIsLoading(true)
    setError(null)

    try {
      // Calculate file hash and convert to blob for backend
      const arrayBuffer = await file.arrayBuffer()
      const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer)
      const hashBlob = new Blob([hashBuffer])

      const result = await (actor as any).submitEvidence(
        disputeId,
        file.name,
        file.type,
        BigInt(file.size),
        hashBlob,
        description,
        false // isConfidential
      ) as { ok?: string; err?: string }

      if (result && 'ok' in result && result.ok) {
        return { success: true, evidenceId: result.ok }
      } else {
        const errMsg = result && 'err' in result ? String(result.err) : 'Unknown error'
        return { success: false, error: errMsg }
      }
    } catch (err) {
      const errorMsg = `Failed to submit evidence: ${err}`
      setError(errorMsg)
      return { success: false, error: errorMsg }
    } finally {
      setIsLoading(false)
    }
  }, [actor])

  const triggerAIAnalysis = useCallback(async (
    disputeId: string
  ): Promise<{ success: boolean; error?: string }> => {
    if (!actor) return { success: false, error: 'Not authenticated' }

    setIsLoading(true)
    setError(null)

    try {
      const result = await (actor as any).triggerAIAnalysis(disputeId) as { ok?: string; err?: string }

      if (result && 'ok' in result) {
        return { success: true }
      } else {
        const errMsg = result && 'err' in result ? String(result.err) : 'Unknown error'
        return { success: false, error: errMsg }
      }
    } catch (err) {
      const errorMsg = `Failed to trigger AI analysis: ${err}`
      setError(errorMsg)
      return { success: false, error: errorMsg }
    } finally {
      setIsLoading(false)
    }
  }, [actor])

  const getDispute = useCallback(async (disputeId: string): Promise<Dispute | null> => {
    if (!actor) return null

    try {
      const result = await (actor as any).getDispute(disputeId) as { ok?: any; err?: string }
      
      if (result && 'ok' in result && result.ok) {
        return convertBackendDispute(result.ok)
      } else {
        const errMsg = result && 'err' in result ? String(result.err) : 'Unknown error'
        setError(`Failed to get dispute: ${errMsg}`)
        return null
      }
    } catch (err) {
      setError(`Failed to fetch dispute: ${err}`)
      return null
    }
  }, [actor])

  const getUserDisputes = useCallback(async (): Promise<Dispute[]> => {
    if (!actor || !identity) return []

    try {
      const disputes = await (actor as any).getUserDisputes(identity) as any[]
      return disputes.map(convertBackendDispute)
    } catch (err) {
      setError(`Failed to fetch user disputes: ${err}`)
      return []
    }
  }, [actor, identity])

  return {
    actor,
    isLoading,
    error,
    createDispute,
    submitEvidence,
    triggerAIAnalysis,
    getDispute,
    getUserDisputes
  }
}

