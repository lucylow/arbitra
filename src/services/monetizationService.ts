import { Principal } from '@dfinity/principal';
import { walletService, WalletBalance } from './walletService';

export interface PlatformFee {
  dispute_creation: number; // Fixed fee for creating dispute
  settlement_percentage: number; // Percentage of settlement amount
  subscription_monthly: number; // Monthly subscription fee
  arbitration_hourly: number; // Hourly rate for human arbitrators
}

export interface RevenueModel {
  fees: PlatformFee;
  total_revenue: number;
  pending_payouts: number;
  treasury_balance: WalletBalance;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  price_monthly: number;
  price_annual: number;
  features: string[];
  disputes_included: number;
  ai_analysis_credits: number;
  human_arbitration_discount: number;
}

interface FeeTransaction {
  dispute_id: string;
  user_id?: Principal;
  amount: number;
  fee_type: string;
  transaction_hash: string;
  timestamp: number;
}

class MonetizationService {
  private readonly PLATFORM_FEES: PlatformFee = {
    dispute_creation: 50, // $50 fixed fee
    settlement_percentage: 0.015, // 1.5% of settlement amount
    subscription_monthly: 99, // $99/month for premium
    arbitration_hourly: 200 // $200/hour for human arbitrators
  };

  private readonly SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
    {
      id: 'basic',
      name: 'Basic',
      price_monthly: 0,
      price_annual: 0,
      features: [
        '3 disputes per month',
        'Basic AI analysis',
        'Standard support',
        'Community arbitration'
      ],
      disputes_included: 3,
      ai_analysis_credits: 5,
      human_arbitration_discount: 0
    },
    {
      id: 'professional',
      name: 'Professional',
      price_monthly: 99,
      price_annual: 999,
      features: [
        '15 disputes per month',
        'Advanced AI analysis',
        'Priority support',
        'Human arbitration credits',
        'Custom legal templates'
      ],
      disputes_included: 15,
      ai_analysis_credits: 50,
      human_arbitration_discount: 0.1
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price_monthly: 299,
      price_annual: 2999,
      features: [
        'Unlimited disputes',
        'Premium AI analysis',
        '24/7 dedicated support',
        'Advanced arbitration tools',
        'API access',
        'Custom integrations'
      ],
      disputes_included: 999,
      ai_analysis_credits: 500,
      human_arbitration_discount: 0.2
    }
  ];

  async calculateDisputeFees(disputeAmount: number): Promise<{
    creation_fee: number;
    settlement_fee: number;
    total_estimated_fees: number;
  }> {
    const creation_fee = this.PLATFORM_FEES.dispute_creation;
    const settlement_fee = disputeAmount * this.PLATFORM_FEES.settlement_percentage;
    
    return {
      creation_fee,
      settlement_fee,
      total_estimated_fees: creation_fee + settlement_fee
    };
  }

  async processDisputeCreationFee(
    disputeId: string,
    userId: Principal,
    disputeAmount: number
  ): Promise<{ success: boolean; transaction_hash: string }> {
    try {
      const fees = await this.calculateDisputeFees(disputeAmount);
      
      // Check user's subscription
      const subscription = await this.getUserSubscription(userId);
      const feeAmount = subscription.plan.id === 'basic' ? fees.creation_fee : 0;

      if (feeAmount > 0) {
        // Process payment
        const txHash = await walletService.transferFunds(
          this.getPlatformAccountId(),
          feeAmount,
          'ICP'
        );

        // Record the transaction
        await this.recordFeeTransaction({
          dispute_id: disputeId,
          user_id: userId,
          amount: feeAmount,
          fee_type: 'dispute_creation',
          transaction_hash: txHash,
          timestamp: Date.now()
        });

        return { success: true, transaction_hash: txHash };
      }

      return { success: true, transaction_hash: 'waived_by_subscription' };
    } catch (error: any) {
      console.error('Fee processing failed:', error);
      throw new Error(`Payment processing failed: ${error.message}`);
    }
  }

  async processSettlementFee(
    disputeId: string,
    settlementAmount: number
  ): Promise<{ success: boolean; fee_amount: number; transaction_hash: string }> {
    try {
      const feeAmount = settlementAmount * this.PLATFORM_FEES.settlement_percentage;
      
      // Deduct fee from settlement amount before distribution
      const netSettlement = settlementAmount - feeAmount;

      // Process fee collection (from escrow)
      const txHash = await this.collectFeeFromEscrow(disputeId, feeAmount);

      await this.recordFeeTransaction({
        dispute_id: disputeId,
        amount: feeAmount,
        fee_type: 'settlement',
        transaction_hash: txHash,
        timestamp: Date.now()
      });

      return {
        success: true,
        fee_amount: feeAmount,
        transaction_hash: txHash
      };
    } catch (error: any) {
      console.error('Settlement fee processing failed:', error);
      throw error;
    }
  }

  async getUserSubscription(userId: Principal): Promise<{
    plan: SubscriptionPlan;
    status: 'active' | 'canceled' | 'expired';
    valid_until: number;
    disputes_used: number;
    credits_remaining: number;
  }> {
    // Mock implementation - would query subscription canister
    // In production, this would call a subscription canister or backend API
    return {
      plan: this.SUBSCRIPTION_PLANS[1], // Professional plan as default
      status: 'active',
      valid_until: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days from now
      disputes_used: 8,
      credits_remaining: 42
    };
  }

  async subscribeToPlan(
    userId: Principal,
    planId: string,
    paymentMethod: 'icp' | 'ckbtc' | 'credit_card'
  ): Promise<{ success: boolean; transaction_hash: string }> {
    const plan = this.SUBSCRIPTION_PLANS.find(p => p.id === planId);
    if (!plan) {
      throw new Error('Invalid subscription plan');
    }

    const amount = plan.price_monthly;

    try {
      let txHash: string;

      if (paymentMethod === 'credit_card') {
        // Process credit card payment (would integrate with Stripe, etc.)
        txHash = await this.processCreditCardPayment(userId, amount);
      } else {
        // Process crypto payment
        const connectedWallet = walletService.getConnectedWallet();
        if (!connectedWallet) {
          throw new Error('Wallet not connected. Please connect your wallet first.');
        }

        txHash = await walletService.transferFunds(
          this.getPlatformAccountId(),
          amount,
          paymentMethod.toUpperCase() as 'ICP' | 'ckBTC'
        );
      }

      // Activate subscription
      await this.activateUserSubscription(userId, planId, txHash);

      return { success: true, transaction_hash: txHash };
    } catch (error: any) {
      console.error('Subscription payment failed:', error);
      throw new Error(`Subscription payment failed: ${error.message}`);
    }
  }

  async getRevenueAnalytics(): Promise<RevenueModel> {
    // Mock implementation - would aggregate from transactions
    // In production, this would query the escrow canister or a revenue tracking canister
    return {
      fees: this.PLATFORM_FEES,
      total_revenue: 125000,
      pending_payouts: 25000,
      treasury_balance: {
        icp: 8500,
        ckbtc: 1.2,
        usd_value: 125000
      }
    };
  }

  private getPlatformAccountId(): string {
    // Return platform treasury account ID
    // In production, this would be stored in environment variables or config
    return 'platform_treasury_account_id';
  }

  private async collectFeeFromEscrow(disputeId: string, amount: number): Promise<string> {
    // Mock implementation - would interact with escrow canister
    // In production, this would call the escrow canister's fee collection method
    return `fee_tx_${disputeId}_${Date.now()}`;
  }

  private async processCreditCardPayment(userId: Principal, amount: number): Promise<string> {
    // Mock implementation - would integrate with payment processor (Stripe, etc.)
    // In production, this would create a payment intent and process the transaction
    return `cc_tx_${userId.toText()}_${Date.now()}`;
  }

  private async activateUserSubscription(userId: Principal, planId: string, txHash: string): Promise<void> {
    // Mock implementation - would update user subscription in canister
    // In production, this would call a subscription canister to activate the plan
    console.log(`Activated ${planId} subscription for ${userId.toText()} - Transaction: ${txHash}`);
  }

  private async recordFeeTransaction(transaction: FeeTransaction): Promise<void> {
    // Mock implementation - would record in transactions canister
    // In production, this would call a transaction logging canister
    console.log('Recorded fee transaction:', transaction);
  }

  getSubscriptionPlans(): SubscriptionPlan[] {
    return this.SUBSCRIPTION_PLANS;
  }

  getPlatformFees(): PlatformFee {
    return this.PLATFORM_FEES;
  }
}

export const monetizationService = new MonetizationService();

