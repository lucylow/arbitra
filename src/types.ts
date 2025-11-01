import { Principal } from '@dfinity/principal';

// User roles
export type UserRole = 'Claimant' | 'Respondent' | 'Arbitrator' | 'Admin';

// Dispute status
export type DisputeStatus = 'Pending' | 'EvidenceSubmission' | 'UnderReview' | 'Decided' | 'Appealed' | 'Closed';

// Evidence type
export type EvidenceType = 'Document' | 'Image' | 'Video' | 'Audio' | 'Text';

// Evidence entry
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

// Dispute case
export interface Dispute {
  id: string;
  claimant: Principal;
  respondent: Principal;
  arbitrator?: Principal;
  title: string;
  description: string;
  amount: bigint;
  status: DisputeStatus;
  createdAt: bigint;
  updatedAt: bigint;
  decision?: string;
  escrowId?: string;
}

// Arbitrator profile
export interface Arbitrator {
  principal: Principal;
  name: string;
  expertise: string[];
  casesHandled: number;
  rating: number;
  available: boolean;
}

// AI Analysis result
export interface AIAnalysis {
  disputeId: string;
  summary: string;
  keyPoints: string[];
  recommendation: string;
  confidence: number;
  timestamp: bigint;
}

// Bitcoin escrow
export type EscrowStatus = 'Pending' | 'Funded' | 'Released' | 'Refunded' | 'Disputed';

export interface Escrow {
  id: string;
  disputeId: string;
  amount: bigint;
  depositor: Principal;
  beneficiary: Principal;
  status: EscrowStatus;
  createdAt: bigint;
  releasedAt?: bigint;
}

// User profile
export interface UserProfile {
  principal: Principal;
  name: string;
  email: string;
  role: UserRole;
  joinedAt: bigint;
  casesInvolved: string[];
}
