import { useState, useCallback } from 'react';
import { evidenceService } from '../services/evidenceService';
import type { Evidence } from '../types';
import { Principal } from '@dfinity/principal';

export const useEvidence = (disputeId: string) => {
  const [evidence, setEvidence] = useState<Evidence[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEvidence = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const evidenceList = await evidenceService.getEvidenceByDispute(disputeId);
      setEvidence(evidenceList);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch evidence');
    } finally {
      setLoading(false);
    }
  }, [disputeId]);

  const submitEvidence = useCallback(async (
    evidenceType: Evidence['evidenceType'],
    contentHash: string,
    description: string,
    submittedBy: Principal
  ) => {
    try {
      setLoading(true);
      setError(null);
      const evidenceId = await evidenceService.submitEvidence(
        disputeId,
        evidenceType,
        contentHash,
        description,
        submittedBy
      );
      await fetchEvidence(); // Refresh list
      return evidenceId;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to submit evidence';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [disputeId, fetchEvidence]);

  return {
    evidence,
    loading,
    error,
    fetchEvidence,
    submitEvidence,
  };
};

