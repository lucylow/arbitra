import { createEvidenceManagerActor, type EvidenceManagerActor } from './actors';

// Cache for actor instance
let actorCache: EvidenceManagerActor | null = null;

async function getActor(): Promise<EvidenceManagerActor> {
  if (!actorCache) {
    actorCache = await createEvidenceManagerActor();
  }
  return actorCache;
}

export class EvidenceService {
  async healthCheck(): Promise<string> {
    try {
      const actor = await getActor();
      const result = await actor.health();
      return String(result);
    } catch (error) {
      console.error('Failed to check evidence manager health:', error);
      throw error;
    }
  }

  // Placeholder methods - to be implemented when evidence_manager canister is fully implemented
  async submitEvidence(
    disputeId: string,
    _evidenceType: string,
    _contentHash: string,
    _description: string,
    _submittedBy: any
  ): Promise<string> {
    try {
      // This is a placeholder - implement when evidence_manager canister is ready
      console.warn('Evidence submission not yet fully implemented');
      return `EVID_${disputeId}_${Date.now()}`;
    } catch (error) {
      console.error('Failed to submit evidence:', error);
      throw error;
    }
  }

  async getEvidence(_evidenceId: string): Promise<any> {
    throw new Error('Get evidence not yet implemented');
  }

  async getEvidenceByDispute(_disputeId: string): Promise<any[]> {
    try {
      // This is a placeholder - implement when evidence_manager canister is ready
      console.warn('Get evidence by dispute not yet fully implemented');
      return [];
    } catch (error) {
      console.error('Failed to get evidence:', error);
      return [];
    }
  }
}

export const evidenceService = new EvidenceService();

