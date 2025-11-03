import { createContext, useContext, ReactNode } from 'react';
import { useDisputes } from '../hooks/useDisputes';
import type { Dispute } from '../types';
import { Principal } from '@dfinity/principal';

interface DisputeContextType {
  disputes: Dispute[];
  loading: boolean;
  error: string | null;
  createDispute: (
    respondent: Principal,
    title: string,
    description: string,
    amount: bigint
  ) => Promise<string>;
  refreshDisputes: () => Promise<void>;
}

const DisputeContext = createContext<DisputeContextType | undefined>(undefined);

export const DisputeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const disputesData = useDisputes();

  return (
    <DisputeContext.Provider value={disputesData}>
      {children}
    </DisputeContext.Provider>
  );
};

export const useDisputeContext = () => {
  const context = useContext(DisputeContext);
  if (context === undefined) {
    throw new Error('useDisputeContext must be used within a DisputeProvider');
  }
  return context;
};

