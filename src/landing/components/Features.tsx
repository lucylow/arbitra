import React from 'react'
import { Brain, Shield, Zap, Scale, Lock, Globe } from 'lucide-react'

const features = [
  {
    icon: Brain,
    title: 'AI-Powered Arbitration',
    description: 'Advanced machine learning analyzes evidence and suggests fair rulings with explainable reasoning and confidence scores.',
    color: 'purple'
  },
  {
    icon: Shield,
    title: 'Immutable Evidence Storage',
    description: 'All evidence cryptographically hashed and anchored to Constellation Network for tamper-proof verification.',
    color: 'blue'
  },
  {
    icon: Zap,
    title: 'Instant Settlements',
    description: 'Automated smart contract execution on ICP enables instant, trustless settlement payments across multiple chains.',
    color: 'green'
  },
  {
    icon: Scale,
    title: 'Legal Compliance',
    description: 'Built-in compliance with international arbitration standards and customizable legal frameworks.',
    color: 'orange'
  },
  {
    icon: Lock,
    title: 'Zero-Knowledge Privacy',
    description: 'Advanced privacy features using ICP\'s vetKD technology to protect sensitive case information.',
    color: 'red'
  },
  {
    icon: Globe,
    title: 'Cross-Chain Integration',
    description: 'Native Bitcoin and Ethereum integration through ICP\'s Chain Fusion technology for universal dispute resolution.',
    color: 'indigo'
  }
]

export const Features: React.FC = () => {
  const getColorClasses = (color: string) => {
    const colors: Record<string, string> = {
      purple: 'bg-purple-100 text-purple-600',
      blue: 'bg-blue-100 text-blue-600',
      green: 'bg-green-100 text-green-600',
      orange: 'bg-orange-100 text-orange-600',
      red: 'bg-red-100 text-red-600',
      indigo: 'bg-indigo-100 text-indigo-600'
    }
    return colors[color] || colors.blue
  }

  return (
    <section id="features" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Revolutionizing Dispute Resolution
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Combining artificial intelligence with blockchain technology to create 
            the world's most efficient and trustworthy arbitration platform.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group p-8 bg-white rounded-2xl border border-gray-200 hover:border-blue-300 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
            >
              <div className={`w-14 h-14 ${getColorClasses(feature.color)} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon className="h-7 w-7" />
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                {feature.title}
              </h3>
              
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>

              {/* Hover Effect Line */}
              <div className="mt-6 w-0 group-hover:w-12 h-0.5 bg-blue-500 transition-all duration-300"></div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 border border-blue-200">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Ready to Transform Your Dispute Resolution?
            </h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Join the future of legal tech with instant AI arbitration, immutable evidence tracking, 
              and automated cross-chain settlements.
            </p>
            <button className="bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors duration-200">
              Start Your First Case
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
