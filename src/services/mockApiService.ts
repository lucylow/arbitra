// services/mockApiService.ts
import { MockDataGenerator } from '../utils/mockGenerators';
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
  MockDemoScenario
} from '../types/mockData';

export class MockApiService {
  private users: MockUser[];
  private disputes: MockDispute[];
  private arbitrators: MockArbitrator[];
  private aiAnalysis: MockAIAnalysis[];
  private escrowData: MockEscrow[];
  private settlements: MockSettlement[];
  private constellationVerifications: MockConstellationVerification[];
  private platformAnalytics: MockPlatformAnalytics;
  private demoScenario: MockDemoScenario;

  constructor() {
    this.users = MockDataGenerator.generateUsers();
    this.disputes = MockDataGenerator.generateDisputes();
    this.arbitrators = MockDataGenerator.generateArbitrators();
    this.aiAnalysis = MockDataGenerator.generateAIAnalysis();
    this.escrowData = MockDataGenerator.generateEscrowData();
    this.settlements = MockDataGenerator.generateSettlements();
    this.constellationVerifications = MockDataGenerator.generateConstellationVerifications();
    this.platformAnalytics = MockDataGenerator.generatePlatformAnalytics();
    this.demoScenario = MockDataGenerator.generateDemoScenario();
  }

  // User methods
  async getUsers(): Promise<MockUser[]> {
    return new Promise((resolve) => {
      setTimeout(() => resolve(this.users), 500);
    });
  }

  async getUserById(id: string): Promise<MockUser | undefined> {
    return new Promise((resolve) => {
      setTimeout(() => resolve(this.users.find(user => user.id === id)), 300);
    });
  }

  // Dispute methods
  async getDisputes(): Promise<MockDispute[]> {
    return new Promise((resolve) => {
      setTimeout(() => resolve(this.disputes), 600);
    });
  }

  async getDisputeById(id: string | number): Promise<MockDispute | undefined> {
    return new Promise((resolve) => {
      setTimeout(() => resolve(this.disputes.find(dispute => dispute.id === id || String(dispute.id) === String(id))), 400);
    });
  }

  async createDispute(disputeData: Partial<MockDispute>): Promise<MockDispute> {
    return new Promise((resolve) => {
      const newDispute: MockDispute = {
        id: `disp_${Date.now()}`,
        title: disputeData.title || 'New Dispute',
        description: disputeData.description || '',
        category: disputeData.category || 'ecommerce',
        amount: disputeData.amount || 0,
        currency: disputeData.currency || 'USD',
        status: 'created',
        parties: disputeData.parties || [],
        evidence: [],
        created_at: Date.now(),
        updated_at: Date.now()
      };

      this.disputes.push(newDispute);
      
      setTimeout(() => resolve(newDispute), 800);
    });
  }

  // Evidence methods
  async addEvidence(disputeId: string | number, evidenceData: Partial<MockEvidence>): Promise<MockEvidence> {
    return new Promise((resolve) => {
      const newEvidence: MockEvidence = {
        id: `ev_${Date.now()}`,
        dispute_id: disputeId,
        file_name: evidenceData.file_name || 'evidence.file',
        file_type: evidenceData.file_type || 'document',
        file_size: evidenceData.file_size || 0,
        constellation_hash: evidenceData.constellation_hash || `Qm${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`,
        submitted_by: evidenceData.submitted_by || '',
        timestamp: Date.now(),
        verified: true
      };

      const dispute = this.disputes.find(d => d.id === disputeId);
      if (dispute) {
        dispute.evidence.push(newEvidence);
        dispute.status = 'evidence_submission';
        dispute.updated_at = Date.now();
      }

      setTimeout(() => resolve(newEvidence), 700);
    });
  }

  // AI Analysis methods
  async getAIAnalysis(disputeId: string | number): Promise<MockAIAnalysis | undefined> {
    return new Promise((resolve) => {
      const analysis = this.aiAnalysis.find(a => 
        a.dispute_id === disputeId || String(a.dispute_id) === String(disputeId)
      );
      setTimeout(() => resolve(analysis), 500);
    });
  }

  async triggerAIAnalysis(disputeId: string | number): Promise<MockAIAnalysis> {
    return new Promise((resolve) => {
      // Simulate AI processing time
      setTimeout(() => {
        const dispute = this.disputes.find(d => 
          d.id === disputeId || String(d.id) === String(disputeId)
        );
        if (dispute) {
          dispute.status = 'AI_Analyzing';
          if (dispute.updated_at !== undefined) {
            dispute.updated_at = Date.now();
          }
        }

        const newAnalysis: MockAIAnalysis = {
          id: `ai_${Date.now()}`,
          dispute_id: disputeId,
          confidence_score: Math.random() * 0.3 + 0.7, // 0.7 - 1.0
          suggested_ruling: ['plaintiff', 'defendant', 'split'][Math.floor(Math.random() * 3)] as 'plaintiff' | 'defendant' | 'split',
          reasoning: 'AI analysis completed based on submitted evidence and contract terms.',
          key_factors: [
            'Contract terms analysis',
            'Evidence credibility assessment',
            'Transaction pattern evaluation',
            'Historical precedent comparison'
          ],
          timestamp: Date.now(),
          analysis_timestamp: Date.now()
        };

        this.aiAnalysis.push(newAnalysis);
        resolve(newAnalysis);
      }, 2000); // Simulate 2 second AI processing
    });
  }

  // Arbitrator methods
  async getArbitrators(): Promise<MockArbitrator[]> {
    return new Promise((resolve) => {
      setTimeout(() => resolve(this.arbitrators), 400);
    });
  }

  // Escrow methods
  async getEscrowStatus(disputeId: string | number): Promise<MockEscrow | undefined> {
    return new Promise((resolve) => {
      setTimeout(() => resolve(this.escrowData.find(e => 
        e.dispute_id === disputeId || String(e.dispute_id) === String(disputeId)
      )), 300);
    });
  }

  async lockFunds(disputeId: string | number, amount: number, currency: 'ckBTC' | 'ICP'): Promise<MockEscrow> {
    return new Promise((resolve) => {
      const newEscrow: MockEscrow = {
        dispute_id: disputeId,
        amount,
        currency,
        status: 'locked',
        transaction_hash: `0x${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`
      };

      this.escrowData.push(newEscrow);
      
      setTimeout(() => resolve(newEscrow), 1000);
    });
  }

  async releaseFunds(disputeId: string | number, releasedTo: string): Promise<MockEscrow> {
    return new Promise((resolve) => {
      const escrow = this.escrowData.find(e => e.dispute_id === disputeId);
      if (escrow) {
        escrow.status = 'released';
        escrow.released_to = releasedTo;
        
        const dispute = this.disputes.find(d => d.id === disputeId);
        if (dispute) {
          dispute.status = 'resolved';
          if (dispute.updated_at !== undefined) {
            dispute.updated_at = Date.now();
          }
        }
      }

      setTimeout(() => resolve(escrow!), 800);
    });
  }

  // Settlement methods
  async getSettlements(): Promise<MockSettlement[]> {
    return new Promise((resolve) => {
      setTimeout(() => resolve(this.settlements), 400);
    });
  }

  async getSettlementByDisputeId(disputeId: string | number): Promise<MockSettlement | undefined> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(this.settlements.find(s => s.dispute_id === disputeId));
      }, 300);
    });
  }

  async createSettlement(settlementData: Partial<MockSettlement>): Promise<MockSettlement> {
    return new Promise((resolve) => {
      const newSettlement: MockSettlement = {
        settlement_id: settlementData.settlement_id || `SETTLE_${Date.now()}`,
        dispute_id: settlementData.dispute_id || '',
        final_amount: settlementData.final_amount || 0,
        ruling_party: settlementData.ruling_party || 'Plaintiff',
        settlement_timestamp: settlementData.settlement_timestamp || Date.now(),
        settlement_terms: settlementData.settlement_terms || '',
        execution_method: settlementData.execution_method || 'Smart Contract Automatic Release',
        transaction_id: settlementData.transaction_id,
        status: 'Completed'
      };

      this.settlements.push(newSettlement);

      // Update related dispute and escrow
      const dispute = this.disputes.find(d => d.id === newSettlement.dispute_id);
      if (dispute) {
        dispute.status = 'Resolved';
        dispute.settlement_amount = newSettlement.final_amount;
      }

      const escrow = this.escrowData.find(e => e.dispute_id === newSettlement.dispute_id);
      if (escrow) {
        escrow.status = 'Settled';
        escrow.released_to = settlementData.ruling_party === 'Plaintiff' 
          ? String(dispute?.parties[0]) 
          : String(dispute?.parties[1]);
      }

      setTimeout(() => resolve(newSettlement), 1000);
    });
  }

  // Constellation Verification methods
  async getConstellationVerification(evidenceId: string | number): Promise<MockConstellationVerification | undefined> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(this.constellationVerifications.find(v => v.evidence_id === evidenceId));
      }, 300);
    });
  }

  async verifyEvidence(evidenceId: string | number, constellationTxId: string): Promise<MockConstellationVerification> {
    return new Promise((resolve) => {
      // Simulate Constellation network verification
      setTimeout(() => {
        const verification: MockConstellationVerification = {
          evidence_id: evidenceId,
          constellation_tx_id: constellationTxId,
          block_height: Math.floor(Math.random() * 20000000) + 18000000,
          timestamp: Date.now(),
          verification_status: 'Verified',
          data_integrity: 'Intact',
          merkle_root: `0x${Math.random().toString(16).substring(2, 66)}`,
          confirming_nodes: 13,
          network_consensus: 100.0
        };

        this.constellationVerifications.push(verification);
        resolve(verification);
      }, 1500);
    });
  }

  // Analytics methods
  async getPlatformAnalytics(): Promise<MockPlatformAnalytics> {
    return new Promise((resolve) => {
      setTimeout(() => resolve(this.platformAnalytics), 500);
    });
  }

  // Demo Scenario methods
  async getDemoScenario(): Promise<MockDemoScenario> {
    return new Promise((resolve) => {
      setTimeout(() => resolve(this.demoScenario), 300);
    });
  }

  // Enhanced Dispute methods
  async getDisputesByStatus(status: string): Promise<MockDispute[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(this.disputes.filter(d => d.status === status));
      }, 400);
    });
  }

  async getDisputesByCategory(category: string): Promise<MockDispute[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(this.disputes.filter(d => d.category === category));
      }, 400);
    });
  }

  // Enhanced Evidence methods
  async getEvidenceByDispute(disputeId: string | number): Promise<MockEvidence[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const dispute = this.disputes.find(d => d.id === disputeId);
        resolve(dispute?.evidence || []);
      }, 300);
    });
  }

  // Enhanced AI Analysis methods
  async getAIAnalysisByDispute(disputeId: string | number): Promise<MockAIAnalysis | undefined> {
    return this.getAIAnalysis(String(disputeId));
  }
}

