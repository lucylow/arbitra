import React from 'react'
import { Cpu, Link2, Database, Shield, Zap, Cloud } from 'lucide-react'

const technologies = [
  {
    name: 'Internet Computer Protocol',
    icon: Cloud,
    description: '100% on-chain dApp hosting with web-speed performance and reverse gas model.',
    features: ['Canister Smart Contracts', 'Internet Identity', 'Chain Fusion', 'HTTPS Outcalls'],
    color: 'blue'
  },
  {
    name: 'Constellation Network',
    icon: Database,
    description: 'Immutable evidence anchoring with DAG-based scalable data validation.',
    features: ['Hypergraph Protocol', 'Metagraphs', 'Digital Evidence', 'L0 Standard'],
    color: 'purple'
  },
  {
    name: 'AI Arbitration Engine',
    icon: Cpu,
    description: 'Advanced machine learning for legal pattern recognition and fair ruling generation.',
    features: ['Explainable AI', 'Legal Reasoning', 'Confidence Scoring', 'Pattern Analysis'],
    color: 'green'
  },
  {
    name: 'Cross-Chain Integration',
    icon: Link2,
    description: 'Native Bitcoin and Ethereum integration for universal dispute resolution.',
    features: ['ckBTC Settlements', 'EVM Compatibility', 'Multi-Chain Escrow', 'Chain Key Crypto'],
    color: 'orange'
  },
  {
    name: 'Zero-Knowledge Privacy',
    icon: Shield,
    description: 'Advanced privacy protection for sensitive case data and evidence.',
    features: ['vetKD Technology', 'Encrypted Storage', 'Selective Disclosure', 'Privacy Proofs'],
    color: 'indigo'
  },
  {
    name: 'Smart Contract Automation',
    icon: Zap,
    description: 'Automated settlement execution with tamper-proof smart contracts.',
    features: ['Automatic Payouts', 'Multi-sig Escrow', 'Conditional Logic', 'Dispute Resolution'],
    color: 'red'
  }
]

export const Technology: React.FC = () => {
  return (
    <section id="technology" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Powered by Cutting-Edge Technology
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Built on the most advanced blockchain and AI technologies to deliver 
            unprecedented speed, security, and fairness in dispute resolution.
          </p>
        </div>

        {/* Technology Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {technologies.map((tech, index) => {
            const colorClasses: Record<string, string> = {
              blue: 'bg-blue-100 text-blue-600',
              purple: 'bg-purple-100 text-purple-600',
              green: 'bg-green-100 text-green-600',
              orange: 'bg-orange-100 text-orange-600',
              indigo: 'bg-indigo-100 text-indigo-600',
              red: 'bg-red-100 text-red-600'
            }
            
            return (
              <div
                key={index}
                className="group bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-200 p-8 hover:border-blue-300 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                {/* Icon */}
                <div className={`w-16 h-16 ${colorClasses[tech.color] || colorClasses.blue} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <tech.icon className="h-8 w-8" />
                </div>

                {/* Title & Description */}
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {tech.name}
                </h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  {tech.description}
                </p>

                {/* Features */}
                <ul className="space-y-2">
                  {tech.features.map((feature, featureIndex) => {
                    const dotColors: Record<string, string> = {
                      blue: 'bg-blue-500',
                      purple: 'bg-purple-500',
                      green: 'bg-green-500',
                      orange: 'bg-orange-500',
                      indigo: 'bg-indigo-500',
                      red: 'bg-red-500'
                    }
                    return (
                      <li key={featureIndex} className="flex items-center space-x-2 text-sm text-gray-600">
                        <div className={`w-1.5 h-1.5 ${dotColors[tech.color] || dotColors.blue} rounded-full`}></div>
                        <span>{feature}</span>
                      </li>
                    )
                  })}
                </ul>
              </div>
            )
          })}
        </div>

        {/* Integration Diagram */}
        <div className="mt-20 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 border border-blue-200">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Seamless Technology Integration
            </h3>
            <p className="text-gray-600">
              How our technology stack works together to deliver end-to-end dispute resolution
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 text-center">
              <div className="bg-white p-4 rounded-xl border border-blue-200">
                <div className="text-blue-600 font-semibold">User Interface</div>
                <div className="text-xs text-gray-500 mt-1">React + TypeScript</div>
              </div>
              <div className="flex items-center justify-center text-gray-400">
                ↓
              </div>
              <div className="bg-white p-4 rounded-xl border border-purple-200">
                <div className="text-purple-600 font-semibold">ICP Blockchain</div>
                <div className="text-xs text-gray-500 mt-1">Smart Contracts</div>
              </div>
              <div className="flex items-center justify-center text-gray-400">
                ↓
              </div>
              <div className="bg-white p-4 rounded-xl border border-green-200">
                <div className="text-green-600 font-semibold">AI Engine</div>
                <div className="text-xs text-gray-500 mt-1">Analysis & Ruling</div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 text-center">
              <div className="bg-white p-4 rounded-xl border border-orange-200">
                <div className="text-orange-600 font-semibold">Constellation</div>
                <div className="text-xs text-gray-500 mt-1">Evidence Anchoring</div>
              </div>
              <div className="bg-white p-4 rounded-xl border border-indigo-200">
                <div className="text-indigo-600 font-semibold">Cross-Chain</div>
                <div className="text-xs text-gray-500 mt-1">Settlement Execution</div>
              </div>
              <div className="bg-white p-4 rounded-xl border border-red-200">
                <div className="text-red-600 font-semibold">Privacy Layer</div>
                <div className="text-xs text-gray-500 mt-1">Data Protection</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
