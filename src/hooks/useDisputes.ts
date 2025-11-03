import { useState, useEffect, useCallback } from 'react';
import { disputeService } from '../services/disputeService';
import type { Dispute } from '../types';
import { Principal } from '@dfinity/principal';
import { getPrincipal } from '../services/agent';

export const useDisputes = () => {
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDisputes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const principal = await getPrincipal();
      if (!principal) {
        setLoading(false);
        return;
      }

      const userDisputes = await disputeService.getDisputesByUser(principal);
      setDisputes(userDisputes);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch disputes');
      console.error('Error fetching disputes:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const createDispute = useCallback(async (
    respondent: Principal,
    title: string,
    description: string,
    amount: bigint
  ) => {
    try {
      setError(null);
      const disputeId = await disputeService.createDispute(
        respondent,
        title,
        description,
        amount
      );
      await fetchDisputes(); // Refresh list
      return disputeId;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create dispute';
      setError(errorMessage);
      throw err;
    }
  }, [fetchDisputes]);

  useEffect(() => {
    fetchDisputes();
  }, [fetchDisputes]);

  return {
    disputes,
    loading,
    error,
    createDispute,
    refreshDisputes: fetchDisputes,
  };
};

