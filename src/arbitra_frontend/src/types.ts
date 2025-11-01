import { Principal } from '@dfinity/principal';

export type UserRole = 'Claimant' | 'Respondent' | 'Arbitrator' | 'Admin';

export type DisputeStatus = 
  | 'Pending' 
  | 'EvidenceSubmission' 
  | 'UnderReview' 
  | 'Decided' 
  | 'Appealed' 
  | 'Closed';

export type EvidenceType = 'Document' | 'Image' | 'Video' | 'Audio' | 'Text';

export type EscrowStatus = 'Pending' | 'Funded' | 'Released' | 'Refunded' | 'Disputed';

export interface Evidence {
  id: string;
  disputeId: string;
  submittedBy: Principal;
  evidenceType: EvidenceType;
  contentHash: string;
  description: string;
  timestamp: bigint;
  verified: boolean;
}

export interface Dispute {
  id: string;
  claimant: Principal;
  respondent: Principal;
  arbitrator: Principal | null;
  title: string;
  description: string;
  amount: bigint;
  status: DisputeStatus;
  createdAt: bigint;
  updatedAt: bigint;
  decision: string | null;
  escrowId: string | null;
}

export interface Arbitrator {
  principal: Principal;
  name: string;
  expertise: string[];
  casesHandled: bigint;
  rating: number;
  available: boolean;
}

export interface AIAnalysis {
  disputeId: string;
  summary: string;
  keyPoints: string[];
  recommendation: string;
  confidence: number;
  timestamp: bigint;
}

export interface Escrow {
  id: string;
  disputeId: string;
  amount: bigint;
  depositor: Principal;
  beneficiary: Principal;
  status: EscrowStatus;
  createdAt: bigint;
  releasedAt: bigint | null;
}

export interface UserProfile {
  principal: Principal;
  name: string;
  email: string;
  role: UserRole;
  joinedAt: bigint;
  casesInvolved: string[];
}
