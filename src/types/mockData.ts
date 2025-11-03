// types/mockData.ts

export interface MockUser {
  id: string;
  principal?: string; // DFinity Principal ID
  type: 'individual' | 'business' | 'arbitrator';
  name: string;
  email: string;
  walletAddress?: string;
  reputationScore?: number;
  company?: string;
  profile?: string;
  contact?: string;
}

export interface MockDispute {
  id: string | number;
  title: string;
  description: string;
  category: 'ecommerce' | 'defi' | 'smart_contract' | 'service' | 'nft' | 'Commercial Contract' | 'Product Quality' | 'Service Agreement' | 'Intellectual Property';
  amount: number;
  amount_in_dispute?: number; // For detailed disputes
  currency: 'USD' | 'ckBTC' | 'ICP';
  status: 'created' | 'evidence_submission' | 'EvidenceSubmitted' | 'ai_analysis' | 'AI_Analyzing' | 'arbitrator_review' | 'resolved' | 'Resolved' | 'appealed' | 'Closed';
  parties: string[]; // User IDs or Principal IDs
  evidence: MockEvidence[];
  created_at: number;
  updated_at?: number;
  deadline?: number;
  governing_law?: string;
  escrow_status?: 'Funded' | 'PartiallyFunded' | 'Settled' | 'Pending';
  priority?: 'High' | 'Medium' | 'Low';
  settlement_amount?: number;
}

export interface MockEvidence {
  id: string | number;
  dispute_id: string | number;
  title?: string;
  file_name: string;
  description?: string;
  file_type: string;
  file_size: number | string;
  constellation_hash: string;
  constellation_tx_id?: string; // Constellation transaction ID
  submitted_by: string;
  timestamp: number;
  submitted_at?: number;
  verified: boolean;
  category?: string; // e.g., 'Contract Document', 'Communication', 'Financial Document'
  relevance_score?: number;
}

export interface MockKeyFactor {
  factor: string;
  weight: number;
  supporting_evidence: (string | number)[];
  impact: string;
}

export interface MockLegalPrecedent {
  case: string;
  relevance: string;
  application: string;
}

export interface MockRiskAssessment {
  plaintiff_win_probability: number;
  defendant_win_probability: number;
  expected_settlement_range: {
    min: number;
    max: number;
    recommended: number;
  };
  litigation_complexity: string;
  estimated_resolution_time: string;
}

export interface MockAIAnalysis {
  id: string;
  analysis_id?: string;
  dispute_id: string | number;
  confidence_score: number;
  suggested_ruling: 'plaintiff' | 'defendant' | 'split' | 'dismissed' | 'Partial ruling in favor of Plaintiff' | 'Ruling in favor of Plaintiff';
  reasoning: string;
  key_factors: (string | MockKeyFactor)[];
  timestamp: number;
  analysis_timestamp?: number;
  legal_precedents?: MockLegalPrecedent[];
  risk_assessment?: MockRiskAssessment;
}

export interface MockEscrowTransaction {
  tx_id: string;
  type: 'Deposit' | 'Withdrawal' | 'Release';
  amount: number;
  from: string;
  to?: string;
  timestamp: number;
  status: 'Confirmed' | 'Pending' | 'Failed';
}

export interface MockEscrow {
  escrow_id?: string;
  dispute_id: string | number;
  total_amount?: number;
  amount: number;
  currency: 'ckBTC' | 'ICP' | 'USD';
  ckbtc_equivalent?: number;
  status: 'locked' | 'released' | 'refunded' | 'Funded' | 'PartiallyFunded' | 'Settled' | 'Pending';
  released_to?: string;
  transaction_hash?: string;
  plaintiff_contribution?: number;
  defendant_contribution?: number;
  funded_at?: number;
  release_conditions?: string[];
  transaction_history?: MockEscrowTransaction[];
}

export interface MockSettlement {
  settlement_id: string;
  dispute_id: string | number;
  final_amount: number;
  ruling_party: 'Plaintiff' | 'Defendant' | 'Split';
  settlement_timestamp: number;
  settlement_terms: string;
  execution_method: string;
  transaction_id?: string;
  status: 'Pending' | 'Completed' | 'Rejected';
}

export interface MockConstellationVerification {
  evidence_id: string | number;
  constellation_tx_id: string;
  block_height?: number;
  timestamp: number;
  verification_status: 'Verified' | 'Pending' | 'Failed';
  data_integrity: 'Intact' | 'Compromised';
  merkle_root?: string;
  confirming_nodes?: number;
  network_consensus?: number;
}

export interface MockArbitrator {
  id: string;
  principal?: string;
  name: string;
  specialization: string[];
  cases_resolved: number;
  success_rate: number;
  rating: number;
  hourly_rate: number;
  company?: string;
  profile?: string;
  available?: boolean;
}

export interface MockCategoryBreakdown {
  category: string;
  count: number;
  resolution_rate: number;
  average_amount: number;
}

export interface MockAIPerformance {
  confidence_threshold: number;
  high_confidence_cases: number;
  medium_confidence_cases: number;
  low_confidence_cases: number;
  human_arbitrator_override_rate: number;
}

export interface MockPlatformAnalytics {
  overall_stats: {
    total_disputes: number;
    resolved_disputes: number;
    average_resolution_time: string;
    total_value_disputed: number;
    average_settlement_amount: number;
    ai_accuracy_rate: number;
    user_satisfaction: number;
  };
  category_breakdown: MockCategoryBreakdown[];
  ai_performance: MockAIPerformance;
}

export interface MockDemoStep {
  step: number;
  action: string;
  description: string;
  user?: MockUser;
  data?: any;
  evidence_ids?: (string | number)[];
  constellation_verification?: boolean;
  analysis_id?: string;
  settlement_amount?: number;
  transaction_id?: string;
  timestamp: number;
}

export interface MockDemoScenario {
  step_by_step: MockDemoStep[];
  technical_highlights: string[];
}

