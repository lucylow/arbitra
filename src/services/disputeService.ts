import { Principal } from '@dfinity/principal';
import type { Dispute, DisputeStatus } from '../types';
import { getPrincipal } from './agent';

// Mock dispute storage - in-memory for Lovable preview
let mockDisputes: Dispute[] = [];
let disputeCounter = 1;

export class DisputeService {
  async createDispute(
    respondent: Principal,
    title: string,
    description: string,
    amount: bigint
  ): Promise<string> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const claimant = await getPrincipal();
    if (!claimant) {
      throw new Error('Not authenticated');
    }
    
    const disputeId = `DISPUTE-${disputeCounter++}`;
    const now = BigInt(Date.now() * 1000000); // Convert to nanoseconds
    
    const newDispute: Dispute = {
      id: disputeId,
      claimant,
      respondent,
      title,
      description,
      amount,
      status: 'Pending',
      createdAt: now,
      updatedAt: now,
    };
    
    mockDisputes.push(newDispute);
    
    // Store in localStorage to persist across page reloads
    localStorage.setItem('mockDisputes', JSON.stringify(mockDisputes.map(d => ({
      ...d,
      claimant: d.claimant.toString(),
      respondent: d.respondent.toString(),
      arbitrator: d.arbitrator?.toString(),
      amount: d.amount.toString(),
      createdAt: d.createdAt.toString(),
      updatedAt: d.updatedAt.toString(),
    }))));
    
    return disputeId;
  }

  async getDispute(disputeId: string): Promise<Dispute | null> {
    await new Promise(resolve => setTimeout(resolve, 100));
    
    this.loadFromLocalStorage();
    
    const dispute = mockDisputes.find(d => d.id === disputeId);
    return dispute || null;
  }

  async getAllDisputes(): Promise<Dispute[]> {
    await new Promise(resolve => setTimeout(resolve, 100));
    
    this.loadFromLocalStorage();
    
    return [...mockDisputes];
  }

  async getDisputesByUser(user: Principal): Promise<Dispute[]> {
    await new Promise(resolve => setTimeout(resolve, 100));
    
    this.loadFromLocalStorage();
    
    return mockDisputes.filter(d => 
      d.claimant.toText() === user.toText() || 
      d.respondent.toText() === user.toText()
    );
  }

  async assignArbitrator(disputeId: string, arbitrator: Principal): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 100));
    
    this.loadFromLocalStorage();
    
    const dispute = mockDisputes.find(d => d.id === disputeId);
    if (dispute) {
      dispute.arbitrator = arbitrator;
      this.saveToLocalStorage();
    }
  }

  async updateDisputeStatus(disputeId: string, status: DisputeStatus): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 100));
    
    this.loadFromLocalStorage();
    
    const dispute = mockDisputes.find(d => d.id === disputeId);
    if (dispute) {
      dispute.status = status;
      dispute.updatedAt = BigInt(Date.now() * 1000000);
      this.saveToLocalStorage();
    }
  }

  async submitDecision(disputeId: string, decision: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 100));
    
    this.loadFromLocalStorage();
    
    const dispute = mockDisputes.find(d => d.id === disputeId);
    if (dispute) {
      dispute.decision = decision;
      dispute.status = 'Decided';
      dispute.updatedAt = BigInt(Date.now() * 1000000);
      this.saveToLocalStorage();
    }
  }

  async registerUser(_name: string, _email: string, _role: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 100));
    // Mock implementation - nothing to do
  }

  async linkEscrow(disputeId: string, escrowId: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 100));
    
    this.loadFromLocalStorage();
    
    const dispute = mockDisputes.find(d => d.id === disputeId);
    if (dispute) {
      dispute.escrowId = escrowId;
      this.saveToLocalStorage();
    }
  }

  private loadFromLocalStorage() {
    const stored = localStorage.getItem('mockDisputes');
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as Array<{
          id: string;
          claimant: string;
          respondent: string;
          arbitrator?: string;
          title: string;
          description: string;
          amount: string;
          status: DisputeStatus;
          createdAt: string;
          updatedAt: string;
          decision?: string;
          escrowId?: string;
        }>;
        mockDisputes = parsed.map((d) => ({
          ...d,
          claimant: Principal.fromText(d.claimant),
          respondent: Principal.fromText(d.respondent),
          arbitrator: d.arbitrator ? Principal.fromText(d.arbitrator) : undefined,
          amount: BigInt(d.amount),
          createdAt: BigInt(d.createdAt),
          updatedAt: BigInt(d.updatedAt),
        }));
        disputeCounter = mockDisputes.length + 1;
      } catch (e) {
        console.error('Failed to load disputes from localStorage:', e);
      }
    }
  }

  private saveToLocalStorage() {
    localStorage.setItem('mockDisputes', JSON.stringify(mockDisputes.map(d => ({
      ...d,
      claimant: d.claimant.toString(),
      respondent: d.respondent.toString(),
      arbitrator: d.arbitrator?.toString(),
      amount: d.amount.toString(),
      createdAt: d.createdAt.toString(),
      updatedAt: d.updatedAt.toString(),
    }))));
  }
}

export const disputeService = new DisputeService();
