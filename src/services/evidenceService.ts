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
    _disputeId: string,
    _fileHash: string,
    _description: string
  ): Promise<string> {
    throw new Error('Evidence submission not yet implemented');
  }

  async getEvidence(_evidenceId: string): Promise<any> {
    throw new Error('Get evidence not yet implemented');
  }

  async getDisputeEvidence(_disputeId: string): Promise<any[]> {
    throw new Error('Get dispute evidence not yet implemented');
  }
}

export const evidenceService = new EvidenceService();

