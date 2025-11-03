import { Principal } from '@dfinity/principal';
import type { Dispute, DisputeStatus } from '../types';
import { createArbitraBackendActor, type ArbitraBackendActor } from './actors';

// Helper to convert backend status to frontend status
function convertBackendStatus(
  status: {
    'EvidenceSubmission'?: null;
    'UnderReview'?: null;
    'Closed'?: null;
    'Decided'?: null;
    'Appealed'?: null;
    'Pending'?: null;
  }
): DisputeStatus {
  if ('Pending' in status) return 'Pending';
  if ('EvidenceSubmission' in status) return 'EvidenceSubmission';
  if ('UnderReview' in status) return 'UnderReview';
  if ('Decided' in status) return 'Decided';
  if ('Appealed' in status) return 'Appealed';
  if ('Closed' in status) return 'Closed';
  return 'Pending';
}

// Helper to convert frontend dispute to backend format
function convertBackendDispute(backendDispute: {
  id: string;
  claimant: Principal;
  respondent: Principal;
  arbitrator?: [] | [Principal];
  title: string;
  description: string;
  amount: bigint;
  status: {
    'EvidenceSubmission'?: null;
    'UnderReview'?: null;
    'Closed'?: null;
    'Decided'?: null;
    'Appealed'?: null;
    'Pending'?: null;
  };
  createdAt: bigint;
  updatedAt: bigint;
  decision?: [] | [string];
  escrowId?: [] | [string];
}): Dispute {
  return {
    id: backendDispute.id,
    claimant: backendDispute.claimant,
    respondent: backendDispute.respondent,
    arbitrator: backendDispute.arbitrator && backendDispute.arbitrator.length > 0
      ? backendDispute.arbitrator[0]
      : undefined,
    title: backendDispute.title,
    description: backendDispute.description,
    amount: backendDispute.amount,
    status: convertBackendStatus(backendDispute.status),
    createdAt: backendDispute.createdAt,
    updatedAt: backendDispute.updatedAt,
    decision: backendDispute.decision && backendDispute.decision.length > 0
      ? backendDispute.decision[0]
      : undefined,
    escrowId: backendDispute.escrowId && backendDispute.escrowId.length > 0
      ? backendDispute.escrowId[0]
      : undefined,
  };
}

// Cache for actor instance
let actorCache: ArbitraBackendActor | null = null;

async function getActor(): Promise<ArbitraBackendActor> {
  if (!actorCache) {
    try {
      console.log('🔌 Initializing Arbitra Backend actor...');
      actorCache = await createArbitraBackendActor();
      console.log('✅ Arbitra Backend actor initialized');
    } catch (error) {
      console.error('❌ Failed to initialize actor:', error);
      // Clear cache so next attempt can retry
      actorCache = null;
      throw error;
    }
  }
  return actorCache;
}

export class DisputeService {
  async createDispute(
    respondent: Principal,
    title: string,
    description: string,
    amount: bigint
  ): Promise<string> {
    try {
      const actor = await getActor();
      const result = await actor.createDispute(respondent, title, description, amount) as { ok?: string; err?: string };
      
      if (result && 'ok' in result && result.ok) {
        return result.ok;
      } else {
        const errMsg = result && 'err' in result ? String(result.err) : 'Unknown error';
        throw new Error(errMsg);
      }
    } catch (error) {
      console.error('Failed to create dispute:', error);
      throw error;
    }
  }

  async getDispute(disputeId: string): Promise<Dispute | null> {
    try {
      const actor = await getActor();
      const result = await actor.getDispute(disputeId) as any[];
      
      if (result && Array.isArray(result) && result.length > 0) {
        return convertBackendDispute(result[0]);
      }
      return null;
    } catch (error) {
      console.error('Failed to get dispute:', error);
      throw error;
    }
  }

  async getAllDisputes(): Promise<Dispute[]> {
    try {
      const actor = await getActor();
      const disputes = await actor.getAllDisputes() as any[];
      return disputes.map(convertBackendDispute);
    } catch (error) {
      console.error('Failed to get all disputes:', error);
      // Return empty array on error to prevent app from breaking
      return [];
    }
  }

  async getDisputesByUser(user: Principal): Promise<Dispute[]> {
    try {
      const actor = await getActor();
      const disputes = await actor.getDisputesByUser(user) as any[];
      return disputes.map(convertBackendDispute);
    } catch (error) {
      console.error('Failed to get disputes by user:', error);
      return [];
    }
  }

  async assignArbitrator(disputeId: string, arbitrator: Principal): Promise<void> {
    try {
      const actor = await getActor();
      const result = await actor.assignArbitrator(disputeId, arbitrator) as { ok?: null; err?: string };
      
      if (result && 'err' in result && result.err) {
        throw new Error(String(result.err));
      }
    } catch (error) {
      console.error('Failed to assign arbitrator:', error);
      throw error;
    }
  }

  async updateDisputeStatus(disputeId: string, status: DisputeStatus): Promise<void> {
    try {
      const actor = await getActor();
      
      // Convert frontend status to backend format
      const backendStatus = (() => {
        switch (status) {
          case 'Pending': return { 'Pending': null };
          case 'EvidenceSubmission': return { 'EvidenceSubmission': null };
          case 'UnderReview': return { 'UnderReview': null };
          case 'Decided': return { 'Decided': null };
          case 'Appealed': return { 'Appealed': null };
          case 'Closed': return { 'Closed': null };
          default: return { 'Pending': null };
        }
      })();
      
      const result = await actor.updateDisputeStatus(disputeId, backendStatus) as { ok?: null; err?: string };
      
      if (result && 'err' in result && result.err) {
        throw new Error(String(result.err));
      }
    } catch (error) {
      console.error('Failed to update dispute status:', error);
      throw error;
    }
  }

  async submitDecision(disputeId: string, decision: string): Promise<void> {
    try {
      const actor = await getActor();
      const result = await actor.submitDecision(disputeId, decision) as { ok?: null; err?: string };
      
      if (result && 'err' in result && result.err) {
        throw new Error(String(result.err));
      }
    } catch (error) {
      console.error('Failed to submit decision:', error);
      throw error;
    }
  }

  async registerUser(name: string, email: string, role: string): Promise<void> {
    try {
      const actor = await getActor();
      
      // Convert role string to backend format
      const backendRole = (() => {
        switch (role) {
          case 'Arbitrator': return { 'Arbitrator': null };
          case 'Admin': return { 'Admin': null };
          case 'Claimant': return { 'Claimant': null };
          case 'Respondent': return { 'Respondent': null };
          default: return { 'Claimant': null };
        }
      })();
      
      const result = await actor.registerUser(name, email, backendRole) as { ok?: null; err?: string };
      
      if (result && 'err' in result && result.err) {
        throw new Error(String(result.err));
      }
    } catch (error) {
      console.error('Failed to register user:', error);
      throw error;
    }
  }

  async linkEscrow(disputeId: string, escrowId: string): Promise<void> {
    try {
      const actor = await getActor();
      const result = await actor.linkEscrow(disputeId, escrowId) as { ok?: null; err?: string };
      
      if (result && 'err' in result && result.err) {
        throw new Error(String(result.err));
      }
    } catch (error) {
      console.error('Failed to link escrow:', error);
      throw error;
    }
  }
}

export const disputeService = new DisputeService();
