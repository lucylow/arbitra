import { Principal } from '@dfinity/principal';
import { createActor, CANISTER_IDS } from './agent';
import type { Dispute, DisputeStatus } from '../types';

// IDL Factory for arbitra_backend (simplified for demo)
const arbitraBackendIdl = ({ IDL }: any) => {
  const UserRole = IDL.Variant({
    'Claimant': IDL.Null,
    'Respondent': IDL.Null,
    'Arbitrator': IDL.Null,
    'Admin': IDL.Null,
  });
  
  const DisputeStatus = IDL.Variant({
    'Pending': IDL.Null,
    'EvidenceSubmission': IDL.Null,
    'UnderReview': IDL.Null,
    'Decided': IDL.Null,
    'Appealed': IDL.Null,
    'Closed': IDL.Null,
  });

  const Dispute = IDL.Record({
    'id': IDL.Text,
    'claimant': IDL.Principal,
    'respondent': IDL.Principal,
    'arbitrator': IDL.Opt(IDL.Principal),
    'title': IDL.Text,
    'description': IDL.Text,
    'amount': IDL.Nat,
    'status': DisputeStatus,
    'createdAt': IDL.Int,
    'updatedAt': IDL.Int,
    'decision': IDL.Opt(IDL.Text),
    'escrowId': IDL.Opt(IDL.Text),
  });

  const Result = IDL.Variant({
    'ok': IDL.Text,
    'err': IDL.Text,
  });

  return IDL.Service({
    'createDispute': IDL.Func([IDL.Principal, IDL.Text, IDL.Text, IDL.Nat], [Result], []),
    'getDispute': IDL.Func([IDL.Text], [IDL.Opt(Dispute)], ['query']),
    'getAllDisputes': IDL.Func([], [IDL.Vec(Dispute)], ['query']),
    'getDisputesByUser': IDL.Func([IDL.Principal], [IDL.Vec(Dispute)], ['query']),
    'assignArbitrator': IDL.Func([IDL.Text, IDL.Principal], [Result], []),
    'updateDisputeStatus': IDL.Func([IDL.Text, DisputeStatus], [Result], []),
    'submitDecision': IDL.Func([IDL.Text, IDL.Text], [Result], []),
    'registerUser': IDL.Func([IDL.Text, IDL.Text, UserRole], [Result], []),
    'linkEscrow': IDL.Func([IDL.Text, IDL.Text], [Result], []),
  });
};

export class DisputeService {
  private actor: any = null;

  async getActor() {
    if (!this.actor) {
      if (!CANISTER_IDS.arbitra_backend) {
        throw new Error('Arbitra backend canister ID not configured. Please set ARBITRA_BACKEND_CANISTER_ID environment variable.');
      }
      this.actor = await createActor(CANISTER_IDS.arbitra_backend, arbitraBackendIdl);
    }
    return this.actor;
  }

  async createDispute(
    respondent: Principal,
    title: string,
    description: string,
    amount: bigint
  ): Promise<string> {
    try {
      const actor = await this.getActor();
      const result = await actor.createDispute(respondent, title, description, amount);
      
      if ('ok' in result) {
        return result.ok;
      } else {
        throw new Error(result.err);
      }
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to create dispute');
    }
  }

  async getDispute(disputeId: string): Promise<Dispute | null> {
    try {
      const actor = await this.getActor();
      const result = await actor.getDispute(disputeId);
      // IDL.Opt returns an array with 0 or 1 element
      return (result as any[]).length > 0 ? (result as any[])[0] : null;
    } catch (error) {
      console.error('Failed to get dispute:', error);
      return null;
    }
  }

  async getAllDisputes(): Promise<Dispute[]> {
    try {
      const actor = await this.getActor();
      return await actor.getAllDisputes();
    } catch (error) {
      console.error('Failed to get all disputes:', error);
      return [];
    }
  }

  async getDisputesByUser(user: Principal): Promise<Dispute[]> {
    const actor = await this.getActor();
    return await actor.getDisputesByUser(user);
  }

  async assignArbitrator(disputeId: string, arbitrator: Principal): Promise<void> {
    const actor = await this.getActor();
    const result = await actor.assignArbitrator(disputeId, arbitrator);
    
    if ('err' in result) {
      throw new Error(result.err);
    }
  }

  async updateDisputeStatus(disputeId: string, status: DisputeStatus): Promise<void> {
    const actor = await this.getActor();
    const result = await actor.updateDisputeStatus(disputeId, { [status]: null });
    
    if ('err' in result) {
      throw new Error(result.err);
    }
  }

  async submitDecision(disputeId: string, decision: string): Promise<void> {
    const actor = await this.getActor();
    const result = await actor.submitDecision(disputeId, decision);
    
    if ('err' in result) {
      throw new Error(result.err);
    }
  }

  async registerUser(name: string, email: string, role: string): Promise<void> {
    const actor = await this.getActor();
    const result = await actor.registerUser(name, email, { [role]: null });
    
    if ('err' in result) {
      throw new Error(result.err);
    }
  }

  async linkEscrow(disputeId: string, escrowId: string): Promise<void> {
    const actor = await this.getActor();
    const result = await actor.linkEscrow(disputeId, escrowId);
    
    if ('err' in result) {
      throw new Error(result.err);
    }
  }
}

export const disputeService = new DisputeService();
