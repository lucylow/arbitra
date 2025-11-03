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

// Dispute case with legal framework compliance
export interface Dispute {
  id: string;
  claimant: Principal;
  respondent: Principal;
  arbitrator?: Principal; // Human arbitrator (required for enforceability)
  title: string;
  description: string;
  amount: bigint;
  // Legal framework fields
  seatOfArbitration?: string; // Jurisdiction where arbitration is seated (required for New York Convention)
  arbitrationAgreementHash?: string; // Hash of signed legal contract
  arbitrationAgreementVerified?: boolean; // Whether parties have signed separate legal agreement
  // AI and human decision separation
  aiRecommendation?: AIRecommendation; // Non-binding AI analysis (advisory only)
  finalRuling?: Ruling; // Final binding award issued by human arbitrator
  status: DisputeStatus;
  createdAt: bigint;
  updatedAt: bigint;
  decision?: string; // Legacy field - use finalRuling for full details
  escrowId?: string;
}

// Arbitrator profile with independence verification
export interface Arbitrator {
  principal: Principal;
  name: string;
  expertise: string[];
  qualifications?: string;
  jurisdiction?: string;
  verified?: boolean; // Whether arbitrator has been vetted
  conflicts?: Principal[]; // Parties with potential conflicts
  casesHandled: number;
  rating: number;
  available: boolean;
  independenceVerified?: boolean; // Compliance with independence requirements
}

// Arbitration Agreement verification
export interface ArbitrationAgreement {
  disputeId: string;
  agreementHash: string;
  plaintiffSigned: boolean;
  defendantSigned: boolean;
  signedAt: bigint;
  governingLaw: string;
  seatOfArbitration: string;
  rulesOfProcedure: string;
}

// AI Recommendation (non-binding, advisory only)
// Per legal framework: decision-making authority cannot be delegated to AI
export interface AIRecommendation {
  id: string;
  disputeId: string;
  summary: string;
  preliminaryRuling: string; // Non-binding suggestion
  reasoning: string;
  keyPoints: string[];
  evidenceAnalysis: string;
  confidenceScore: number;
  explainabilityData: string; // SHAP/LIME outputs for transparency
  generatedAt: bigint;
  isBinding: boolean; // Always false - for legal clarity
}

// Legacy AI Analysis (kept for backward compatibility)
export interface AIAnalysis {
  disputeId: string;
  summary: string;
  keyPoints: string[];
  recommendation: string;
  confidence: number;
  timestamp: bigint;
}

// Final Ruling (binding award issued by human arbitrator)
// Per legal framework: human arbitrator must maintain independent judgment
export interface Ruling {
  id: string;
  disputeId: string;
  decision: string;
  reasoning: string;
  keyFactors: string[];
  // Legal compliance fields
  applicableLaw: string;
  jurisdiction: string;
  // Reference to AI recommendation (if considered)
  consideredAIRecommendation: boolean;
  // Human arbitrator's independent judgment
  issuedBy: Principal; // Must be human arbitrator (not AI)
  issuedAt: bigint;
  // Award enforcement data
  awardNumber: string; // Unique identifier for enforcement
  isEnforceable: boolean; // Whether award meets New York Convention requirements
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
