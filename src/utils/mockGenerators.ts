// utils/mockGenerators.ts
import type {
  MockUser,
  MockDispute,
  MockEvidence,
  MockAIAnalysis,
  MockEscrow,
  MockArbitrator,
  MockSettlement,
  MockConstellationVerification,
  MockPlatformAnalytics,
  MockDemoScenario,
} from '../types/mockData';

// Mock Users with Principal IDs
export const MOCK_USERS: {
  plaintiff: MockUser & { principal: string };
  defendant: MockUser & { principal: string };
  arbitrator: MockUser & { principal: string };
} = {
  plaintiff: {
    id: 'user_plaintiff',
    principal: '2vxsx-fae-aaaa-aaaap-2ai',
    type: 'business' as const,
    name: 'Sarah Chen',
    email: 'sarah@techsupply.com',
    company: 'TechSupply Inc.',
    profile: 'Manufacturer of electronic components',
    contact: 'sarah@techsupply.com',
    reputationScore: 95
  },
  defendant: {
    id: 'user_defendant',
    principal: '2vxsx-fae-aaaa-aaaap-2aj',
    type: 'business' as const,
    name: 'Michael Rodriguez',
    email: 'mike@quickdeliver.com',
    company: 'QuickDeliver Logistics',
    profile: 'International shipping and delivery services',
    contact: 'mike@quickdeliver.com',
    reputationScore: 88
  },
  arbitrator: {
    id: 'user_arbitrator',
    principal: '2vxsx-fae-aaaa-aaaap-2ak',
    type: 'arbitrator' as const,
    name: 'Dr. Elena Petrova',
    email: 'elena.petrova@iaa.org',
    company: 'International Arbitration Association',
    profile: '15+ years in commercial dispute resolution',
    contact: 'elena.petrova@iaa.org',
    reputationScore: 98
  }
};

export class MockDataGenerator {
  // User Data
  static generateUsers(): MockUser[] {
    return [
      MOCK_USERS.plaintiff,
      MOCK_USERS.defendant,
      MOCK_USERS.arbitrator,
      {
        id: 'user_3',
        principal: '2vxsx-fae-aaaa-aaaap-2al',
        type: 'business',
        name: 'Quality Control Labs',
        email: 'contact@qclabs.com',
        company: 'Quality Control Labs',
        profile: 'Independent testing and quality assurance',
        contact: 'contact@qclabs.com',
        reputationScore: 92
      },
      {
        id: 'user_4',
        principal: '2vxsx-fae-aaaa-aaaap-2am',
        type: 'business',
        name: 'CloudTech Solutions',
        email: 'support@cloudtech.com',
        company: 'CloudTech Solutions',
        profile: 'Cloud infrastructure provider',
        contact: 'support@cloudtech.com',
        reputationScore: 85
      },
      {
        id: 'user_5',
        principal: '2vxsx-fae-aaaa-aaaap-2an',
        type: 'business',
        name: 'Enterprise Services Co.',
        email: 'info@enterpriseservices.com',
        company: 'Enterprise Services Co.',
        profile: 'B2B service provider',
        contact: 'info@enterpriseservices.com',
        reputationScore: 90
      }
    ];
  }

  // Arbitrator Data
  static generateArbitrators(): MockArbitrator[] {
    return [
      {
        id: 'arb_1',
        principal: MOCK_USERS.arbitrator.principal,
        name: 'Dr. Elena Petrova',
        specialization: ['Commercial Contracts', 'International Law', 'Dispute Resolution'],
        cases_resolved: 145,
        success_rate: 96,
        rating: 4.9,
        hourly_rate: 350,
        company: 'International Arbitration Association',
        profile: '15+ years in commercial dispute resolution',
        available: true
      },
      {
        id: 'arb_2',
        name: 'Michael Torres, JD',
        specialization: ['Smart Contracts', 'DeFi', 'NFTs', 'Intellectual Property'],
        cases_resolved: 89,
        success_rate: 91,
        rating: 4.7,
        hourly_rate: 275,
        available: true
      },
      {
        id: 'arb_3',
        name: 'LegalTech Arbitration Group',
        specialization: ['Commercial Law', 'Contract Law', 'Tech Disputes'],
        cases_resolved: 256,
        success_rate: 96,
        rating: 4.9,
        hourly_rate: 350,
        available: true
      }
    ];
  }

  // Comprehensive Dispute Data
  static generateDisputes(): MockDispute[] {
    const disputes: MockDispute[] = [
      {
        id: 1001,
        title: 'Late Delivery - Electronic Components Order',
        description: 'Supplier failed to deliver 500 units of XT-890 processors by the agreed delivery date of March 15, 2025, causing production delays and financial losses.',
        category: 'Commercial Contract',
        amount: 125000,
        amount_in_dispute: 125000,
        currency: 'USD',
        status: 'AI_Analyzing',
        parties: [
          MOCK_USERS.plaintiff.principal,
          MOCK_USERS.defendant.principal
        ],
        evidence: [],
        created_at: 1742000000,
        updated_at: 1742005000,
        deadline: 1743000000,
        governing_law: 'United Nations Convention on Contracts for the International Sale of Goods (CISG)',
        escrow_status: 'Funded',
        priority: 'High'
      },
      {
        id: 1002,
        title: 'Defective Product Batch - Thermal Sensors',
        description: 'Batch #TL-456 of thermal sensors failed quality control tests with 23% failure rate, contrary to the 2% maximum defect rate specified in the quality agreement.',
        category: 'Product Quality',
        amount: 75000,
        amount_in_dispute: 75000,
        currency: 'USD',
        parties: [
          '2vxsx-fae-aaaa-aaaap-2al',
          MOCK_USERS.plaintiff.principal
        ],
        evidence: [],
        created_at: 1741900000,
        updated_at: 1741905000,
        deadline: 1742900000,
        governing_law: 'Uniform Commercial Code (UCC) Article 2',
        status: 'EvidenceSubmitted',
        escrow_status: 'PartiallyFunded',
        priority: 'Medium'
      },
      {
        id: 1003,
        title: 'Service Level Agreement Breach - Cloud Infrastructure',
        description: 'Provider failed to maintain 99.9% uptime guarantee for Q1 2025, with actual uptime of 97.2% causing service disruptions and customer complaints.',
        category: 'Service Agreement',
        amount: 45000,
        amount_in_dispute: 45000,
        currency: 'USD',
        parties: [
          '2vxsx-fae-aaaa-aaaap-2am',
          '2vxsx-fae-aaaa-aaaap-2an'
        ],
        evidence: [],
        created_at: 1741800000,
        updated_at: 1742800000,
        deadline: 1742800000,
        governing_law: 'Service Level Agreement Terms',
        status: 'Resolved',
        escrow_status: 'Settled',
        priority: 'Medium',
        settlement_amount: 32000
      }
    ];

    // Add evidence to disputes
    disputes[0].evidence = this.generateEvidenceForDispute(1001);
    disputes[1].evidence = this.generateEvidenceForDispute(1002);
    disputes[2].evidence = this.generateEvidenceForDispute(1003);

    return disputes;
  }

  // Comprehensive Evidence Data
  static generateEvidenceForDispute(disputeId: number): MockEvidence[] {
    const evidenceTemplates: Record<number, MockEvidence[]> = {
      1001: [
        {
          id: 2001,
          dispute_id: disputeId,
          title: 'Purchase Order #PO-789123',
          description: 'Original purchase order specifying delivery date and terms',
          file_name: 'PO-789123.pdf',
          file_type: 'PDF',
          file_size: 2457600,
          constellation_hash: 'a1b2c3d4e5f67890abcd1234ef5678901234abcd5678ef90123456abcd7890',
          constellation_tx_id: '0x8d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4',
          submitted_by: MOCK_USERS.plaintiff.principal,
          timestamp: 1742001000,
          submitted_at: 1742001000,
          verified: true,
          category: 'Contract Document',
          relevance_score: 0.95
        },
        {
          id: 2002,
          dispute_id: disputeId,
          title: 'Delivery Schedule Amendment',
          description: 'Email chain discussing and confirming March 15 delivery date',
          file_name: 'delivery_schedule_emails.eml',
          file_type: 'EML',
          file_size: 1259520,
          constellation_hash: 'b2c3d4e5f67890abcd1234ef5678901234abcd5678ef90123456abcd7890a1',
          constellation_tx_id: '0x9e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5',
          submitted_by: MOCK_USERS.plaintiff.principal,
          timestamp: 1742002000,
          submitted_at: 1742002000,
          verified: true,
          category: 'Communication',
          relevance_score: 0.88
        },
        {
          id: 2003,
          dispute_id: disputeId,
          title: 'Shipping Delay Notification',
          description: "Defendant's email notifying delay due to customs issues",
          file_name: 'delay_notification.eml',
          file_type: 'EML',
          file_size: 838860,
          constellation_hash: 'c3d4e5f67890abcd1234ef5678901234abcd5678ef90123456abcd7890a1b2',
          constellation_tx_id: '0xaf6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6',
          submitted_by: MOCK_USERS.defendant.principal,
          timestamp: 1742003000,
          submitted_at: 1742003000,
          verified: true,
          category: 'Communication',
          relevance_score: 0.92
        },
        {
          id: 2004,
          dispute_id: disputeId,
          title: 'Production Loss Calculation',
          description: 'Spreadsheet detailing financial impact of delivery delay',
          file_name: 'production_loss_calc.xlsx',
          file_type: 'XLSX',
          file_size: 3250585,
          constellation_hash: 'd4e5f67890abcd1234ef5678901234abcd5678ef90123456abcd7890a1b2c3',
          constellation_tx_id: '0xba7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7',
          submitted_by: MOCK_USERS.plaintiff.principal,
          timestamp: 1742004000,
          submitted_at: 1742004000,
          verified: true,
          category: 'Financial Document',
          relevance_score: 0.85
        }
      ],
      1002: [
        {
          id: 2005,
          dispute_id: disputeId,
          title: 'Quality Control Test Report',
          description: 'Independent lab results showing 23% failure rate',
          file_name: 'qc_test_report.pdf',
          file_type: 'PDF',
          file_size: 4404019,
          constellation_hash: 'e5f67890abcd1234ef5678901234abcd5678ef90123456abcd7890a1b2c3d4',
          constellation_tx_id: '0xc8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8',
          submitted_by: '2vxsx-fae-aaaa-aaaap-2al',
          timestamp: 1741901000,
          submitted_at: 1741901000,
          verified: true,
          category: 'Technical Report',
          relevance_score: 0.97
        }
      ],
      1003: []
    };

    return evidenceTemplates[disputeId] || [];
  }

  // Comprehensive AI Analysis Data
  static generateAIAnalysis(): MockAIAnalysis[] {
    return [
      {
        id: 'ai_1',
        analysis_id: 'AI_001_1001',
        dispute_id: 1001,
        confidence_score: 0.76,
        suggested_ruling: 'Partial ruling in favor of Plaintiff',
        reasoning: `The AI analysis finds strong evidence supporting the plaintiff's claim of breach of contract regarding delivery timelines. Key factors considered:
      
      1. Contractual Obligations: Purchase order clearly specifies March 15, 2025 delivery date
      2. Communication Evidence: Both parties acknowledged and confirmed this timeline
      3. Mitigating Circumstances: Defendant provided evidence of customs delays beyond their control
      4. Financial Impact: Plaintiff demonstrated quantifiable production losses
      
      Recommended settlement: $45,000 (36% of claimed amount) due to mitigating circumstances.`,
        key_factors: [
          {
            factor: 'Contractual Delivery Date',
            weight: 0.25,
            supporting_evidence: [2001, 2002],
            impact: 'Strongly supports plaintiff'
          },
          {
            factor: 'Force Majeure Circumstances',
            weight: 0.20,
            supporting_evidence: [2003],
            impact: 'Moderately supports defendant'
          },
          {
            factor: 'Financial Damages',
            weight: 0.30,
            supporting_evidence: [2004],
            impact: 'Strongly supports plaintiff'
          },
          {
            factor: 'Communication Timeline',
            weight: 0.15,
            supporting_evidence: [2002, 2003],
            impact: 'Neutral - both parties communicated appropriately'
          }
        ],
        timestamp: 1742005000,
        analysis_timestamp: 1742005000,
        legal_precedents: [
          {
            case: 'Hadley v. Baxendale (1854)',
            relevance: 'Establishes principle of foreseeable damages',
            application: "Supports plaintiff's claim for direct losses only"
          },
          {
            case: 'UCC § 2-615',
            relevance: 'Commercial impracticability defense',
            application: "May partially excuse defendant's delay"
          }
        ],
        risk_assessment: {
          plaintiff_win_probability: 0.72,
          defendant_win_probability: 0.28,
          expected_settlement_range: {
            min: 35000,
            max: 55000,
            recommended: 45000
          },
          litigation_complexity: 'Medium',
          estimated_resolution_time: '14-21 days'
        }
      },
      {
        id: 'ai_3',
        analysis_id: 'AI_003_1003',
        dispute_id: 1003,
        confidence_score: 0.89,
        suggested_ruling: 'Ruling in favor of Plaintiff',
        reasoning: 'Clear breach of SLA terms with documented evidence of service interruptions. Provider failed to meet uptime guarantee with 97.2% actual uptime vs 99.9% requirement.',
        key_factors: [
          'SLA terms clearly defined and agreed upon',
          'Documented evidence of service interruptions',
          'Quantifiable financial impact on plaintiff',
          'No mitigating circumstances provided by defendant'
        ],
        timestamp: 1741850000,
        analysis_timestamp: 1741850000
      }
    ];
  }

  // Comprehensive Escrow Data
  static generateEscrowData(): MockEscrow[] {
    return [
      {
        escrow_id: 'ESC_1001_20250320',
        dispute_id: 1001,
        total_amount: 125000,
        amount: 2.85,
        currency: 'ckBTC',
        ckbtc_equivalent: 2.85,
        status: 'Funded',
        plaintiff_contribution: 0,
        defendant_contribution: 125000,
        funded_at: 1742001500,
        transaction_hash: 'CKBTX_001_1001',
        release_conditions: [
          'Mutual agreement between parties',
          'Arbitrator ruling',
          'AI-suggested settlement accepted by both parties'
        ],
        transaction_history: [
          {
            tx_id: 'CKBTX_001_1001',
            type: 'Deposit',
            amount: 2.85,
            from: MOCK_USERS.defendant.principal,
            timestamp: 1742001500,
            status: 'Confirmed'
          }
        ]
      },
      {
        escrow_id: 'ESC_1002_20250319',
        dispute_id: 1002,
        total_amount: 75000,
        amount: 1.71,
        currency: 'ckBTC',
        ckbtc_equivalent: 1.71,
        status: 'PartiallyFunded',
        plaintiff_contribution: 25000,
        defendant_contribution: 50000,
        funded_at: 1741901500,
        transaction_hash: 'CKBTX_002_1002'
      },
      {
        escrow_id: 'ESC_1003_20250318',
        dispute_id: 1003,
        total_amount: 45000,
        amount: 32000,
        currency: 'USD',
        status: 'Settled',
        released_to: '2vxsx-fae-aaaa-aaaap-2am',
        transaction_hash: 'CKBTX_003_SETTLE',
        funded_at: 1741801500
      }
    ];
  }

  // Settlement Data
  static generateSettlements(): MockSettlement[] {
    return [
      {
        settlement_id: 'SETTLE_1003_20250318',
        dispute_id: 1003,
        final_amount: 32000,
        ruling_party: 'Plaintiff',
        settlement_timestamp: 1742800000,
        settlement_terms: `1. Defendant to pay $32,000 to Plaintiff within 7 business days
2. Both parties release each other from further claims related to Q1 2025 SLA
3. Service agreement to continue under revised terms
4. Confidentiality clause remains in effect`,
        execution_method: 'Smart Contract Automatic Release',
        transaction_id: 'CKBTX_003_SETTLE',
        status: 'Completed'
      }
    ];
  }

  // Constellation Verification Data
  static generateConstellationVerifications(): MockConstellationVerification[] {
    return [
      {
        evidence_id: 2001,
        constellation_tx_id: '0x8d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4',
        block_height: 18456732,
        timestamp: 1742001000,
        verification_status: 'Verified',
        data_integrity: 'Intact',
        merkle_root: '0x1234abcd5678ef9012345678abcdef0123456789abcdef0123456789abcdef01',
        confirming_nodes: 13,
        network_consensus: 100.0
      },
      {
        evidence_id: 2002,
        constellation_tx_id: '0x9e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5',
        block_height: 18456745,
        timestamp: 1742002000,
        verification_status: 'Verified',
        data_integrity: 'Intact',
        merkle_root: '0x5678ef9012345678abcdef0123456789abcdef0123456789abcdef0123456789',
        confirming_nodes: 13,
        network_consensus: 100.0
      }
    ];
  }

  // Platform Analytics
  static generatePlatformAnalytics(): MockPlatformAnalytics {
    return {
      overall_stats: {
        total_disputes: 47,
        resolved_disputes: 32,
        average_resolution_time: '18.5 days',
        total_value_disputed: 2850000,
        average_settlement_amount: 62350,
        ai_accuracy_rate: 0.84,
        user_satisfaction: 4.7
      },
      category_breakdown: [
        {
          category: 'Commercial Contracts',
          count: 18,
          resolution_rate: 0.78,
          average_amount: 89500
        },
        {
          category: 'Service Agreements',
          count: 12,
          resolution_rate: 0.83,
          average_amount: 45600
        },
        {
          category: 'Product Quality',
          count: 9,
          resolution_rate: 0.72,
          average_amount: 67300
        },
        {
          category: 'Intellectual Property',
          count: 8,
          resolution_rate: 0.65,
          average_amount: 124500
        }
      ],
      ai_performance: {
        confidence_threshold: 0.70,
        high_confidence_cases: 28,
        medium_confidence_cases: 14,
        low_confidence_cases: 5,
        human_arbitrator_override_rate: 0.23
      }
    };
  }

  // Demo Scenario
  static generateDemoScenario(): MockDemoScenario {
    return {
      step_by_step: [
        {
          step: 1,
          action: 'User Authentication',
          description: 'Sarah Chen logs in using Internet Identity',
          user: MOCK_USERS.plaintiff,
          timestamp: 1742000000
        },
        {
          step: 2,
          action: 'Dispute Creation',
          description: 'Creates new dispute for late delivery',
          data: { id: 1001, title: 'Late Delivery - Electronic Components Order' },
          timestamp: 1742000500
        },
        {
          step: 3,
          action: 'Evidence Submission',
          description: 'Uploads purchase order and email evidence',
          evidence_ids: [2001, 2002],
          constellation_verification: true,
          timestamp: 1742001000
        },
        {
          step: 4,
          action: 'Counter-Evidence Submission',
          description: 'Michael Rodriguez submits delay notification',
          evidence_ids: [2003],
          timestamp: 1742003000
        },
        {
          step: 5,
          action: 'AI Analysis Trigger',
          description: 'System processes all evidence through AI engine',
          analysis_id: 'AI_001_1001',
          timestamp: 1742005000
        },
        {
          step: 6,
          action: 'Results Presentation',
          description: 'AI suggests $45,000 settlement with detailed reasoning',
          analysis_id: 'AI_001_1001',
          timestamp: 1742005200
        },
        {
          step: 7,
          action: 'Settlement Execution',
          description: 'Both parties accept AI recommendation, smart contract executes',
          settlement_amount: 45000,
          transaction_id: 'CKBTX_SETTLE_1001',
          timestamp: 1742006000
        }
      ],
      technical_highlights: [
        'Internet Identity authentication - no passwords',
        'Evidence hashed and stored on Constellation network',
        'AI analysis running entirely on ICP canisters',
        'Smart contract settlement via ckBTC',
        '100% on-chain dispute resolution process'
      ]
    };
  }
}
