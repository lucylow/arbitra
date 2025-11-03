import React, { useState } from 'react';
import { monetizationService, SubscriptionPlan } from '../../services/monetizationService';
import { walletService } from '../../services/walletService';

const SubscriptionPlans: React.FC = () => {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'icp' | 'ckbtc' | 'credit_card'>('icp');
  const [isProcessing, setIsProcessing] = useState(false);

  const plans = monetizationService.getSubscriptionPlans();

  const handleSubscribe = async (plan: SubscriptionPlan) => {
    const connectedWallet = walletService.getConnectedWallet();
    if (!connectedWallet && plan.price_monthly > 0) {
      alert('Please connect your wallet first');
      return;
    }

    if (!connectedWallet && paymentMethod !== 'credit_card') {
      alert('Please connect your wallet to pay with crypto');
      return;
    }

    setIsProcessing(true);
    try {
      const result = await monetizationService.subscribeToPlan(
        connectedWallet!.principal,
        plan.id,
        paymentMethod
      );

      if (result.success) {
        alert(`Successfully subscribed to ${plan.name}! Transaction: ${result.transaction_hash}`);
        setSelectedPlan(plan.id);
      }
    } catch (error: any) {
      alert(`Subscription failed: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="subscription-plans p-6 bg-white rounded-lg shadow-lg">
      <h3 className="text-2xl font-bold mb-2">Choose Your Plan</h3>
      <p className="subtitle text-gray-600 mb-6">
        Select the plan that best fits your dispute resolution needs
      </p>

      <div className="plans-grid grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`plan-card relative p-6 border-2 rounded-lg transition-all ${
              selectedPlan === plan.id
                ? 'border-blue-500 shadow-lg scale-105'
                : 'border-gray-200 hover:border-blue-300 hover:shadow-md'
            } ${plan.id === 'professional' ? 'ring-2 ring-blue-200' : ''}`}
          >
            {plan.id === 'professional' && (
              <div className="absolute top-0 right-0 bg-blue-500 text-white px-3 py-1 rounded-bl-lg text-xs font-semibold">
                POPULAR
              </div>
            )}

            <div className="plan-header mb-4">
              <h4 className="text-xl font-bold mb-3">{plan.name}</h4>
              <div className="price">
                {plan.price_monthly === 0 ? (
                  <div className="free text-3xl font-bold text-green-600">FREE</div>
                ) : (
                  <>
                    <div className="monthly text-3xl font-bold text-gray-800">
                      ${plan.price_monthly}
                      <span className="text-lg text-gray-500">/month</span>
                    </div>
                    {plan.price_annual > 0 && (
                      <div className="annual text-sm text-gray-600 mt-1">
                        ${plan.price_annual}/year <span className="text-green-600 font-semibold">(Save 16%)</span>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            <div className="plan-features mb-6">
              <ul className="space-y-2">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span className="text-gray-700 text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            {plan.price_monthly > 0 && (
              <div className="payment-section mb-4">
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as any)}
                  className="payment-select w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="icp">Pay with ICP</option>
                  <option value="ckbtc">Pay with ckBTC</option>
                  <option value="credit_card">Credit Card</option>
                </select>
              </div>
            )}

            <button
              onClick={() => handleSubscribe(plan)}
              disabled={isProcessing || (plan.price_monthly > 0 && !selectedPlan)}
              className={`subscribe-button w-full px-4 py-3 rounded-lg font-semibold transition-all ${
                plan.price_monthly === 0
                  ? 'bg-green-500 text-white hover:bg-green-600'
                  : 'bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed'
              }`}
            >
              {isProcessing
                ? 'Processing...'
                : plan.price_monthly === 0
                ? 'Get Started'
                : 'Subscribe Now'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SubscriptionPlans;

