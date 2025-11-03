import { createAIAnalysisActor, type AIAnalysisActor } from './actors';

// Cache for actor instance
let actorCache: AIAnalysisActor | null = null;

async function getActor(): Promise<AIAnalysisActor> {
  if (!actorCache) {
    actorCache = await createAIAnalysisActor();
  }
  return actorCache;
}

export class AIAnalysisService {
  async healthCheck(): Promise<string> {
    try {
      const actor = await getActor();
      const result = await actor.health();
      return String(result);
    } catch (error) {
      console.error('Failed to check AI analysis health:', error);
      throw error;
    }
  }

  // Placeholder methods - to be implemented when ai_analysis canister is fully implemented
  async analyzeDispute(_disputeId: string): Promise<any> {
    throw new Error('AI analysis not yet implemented');
  }

  async getAnalysis(_disputeId: string): Promise<any> {
    throw new Error('Get analysis not yet implemented');
  }
}

export const aiAnalysisService = new AIAnalysisService();

