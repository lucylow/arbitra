import { Principal } from '@dfinity/principal';
import { createBitcoinEscrowActor, type BitcoinEscrowActor } from './actors';

// Cache for actor instance
let actorCache: BitcoinEscrowActor | null = null;

async function getActor(): Promise<BitcoinEscrowActor> {
  if (!actorCache) {
    actorCache = await createBitcoinEscrowActor();
  }
  return actorCache;
}

export class EscrowService {
  async healthCheck(): Promise<string> {
    try {
      const actor = await getActor();
      return await actor.health();
    } catch (error) {
      console.error('Failed to check escrow health:', error);
      throw error;
    }
  }

  // Placeholder methods - to be implemented when bitcoin_escrow canister is fully implemented
  async createEscrow(
    _disputeId: string,
    _amount: bigint,
    _depositor: Principal,
    _beneficiary: Principal
  ): Promise<string> {
    throw new Error('Escrow creation not yet implemented');
  }

  async fundEscrow(_escrowId: string, _amount: bigint): Promise<void> {
    throw new Error('Fund escrow not yet implemented');
  }

  async releaseEscrow(_escrowId: string): Promise<void> {
    throw new Error('Release escrow not yet implemented');
  }

  async refundEscrow(_escrowId: string): Promise<void> {
    throw new Error('Refund escrow not yet implemented');
  }
}

export const escrowService = new EscrowService();

