import React from 'react'
import { Building, Users, Globe, CreditCard, Truck, FileText } from 'lucide-react'

const useCases = [
  {
    icon: Building,
    title: 'Enterprise Contracts',
    description: 'Resolve B2B contract disputes efficiently with AI-powered analysis of complex commercial agreements.',
    examples: ['Service Level Agreements', 'Supply Chain Contracts', 'Partnership Disputes'],
    stats: '70% faster resolution',
    color: 'blue'
  },
  {
    icon: Users,
    title: 'Consumer Protection',
    description: 'Protect consumer rights with accessible, low-cost dispute resolution for e-commerce and services.',
    examples: ['Product Quality Issues', 'Service Delivery Disputes', 'Refund Claims'],
    stats: '90% cost reduction',
    color: 'green'
  },
  {
    icon: Globe,
    title: 'Cross-Border Commerce',
    description: 'Overcome jurisdictional challenges with blockchain-based international dispute resolution.',
    examples: ['International Trade', 'Remote Work Agreements', 'Global Services'],
    stats: 'No borders limitation',
    color: 'purple'
  },
  {
    icon: CreditCard,
    title: 'DeFi & Crypto',
    description: 'Secure resolution for decentralized finance disputes and smart contract interpretations.',
    examples: ['DeFi Protocol Issues', 'Token Disputes', 'DAO Governance'],
    stats: '100% on-chain',
    color: 'orange'
  },
  {
    icon: Truck,
    title: 'Supply Chain',
    description: 'Streamline logistics disputes with immutable evidence tracking and automated settlements.',
    examples: ['Delivery Delays', 'Quality Assurance', 'Payment Terms'],
    stats: 'Real-time tracking',
    color: 'indigo'
  },
  {
    icon: FileText,
    title: 'Legal Documentation',
    description: 'Verify and enforce legal document authenticity with cryptographic proof and AI analysis.',
    examples: ['Contract Verification', 'Document Integrity', 'Digital Signatures'],
    stats: 'Immutable proof',
    color: 'red'
  }
]

export const UseCases: React.FC = () => {
  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; text: string; hover: string }> = {
      blue: { bg: 'bg-blue-100', text: 'text-blue-600', hover: 'hover:bg-blue-100' },
      green: { bg: 'bg-green-100', text: 'text-green-600', hover: 'hover:bg-green-100' },
      purple: { bg: 'bg-purple-100', text: 'text-purple-600', hover: 'hover:bg-purple-100' },
      orange: { bg: 'bg-orange-100', text: 'text-orange-600', hover: 'hover:bg-orange-100' },
      indigo: { bg: 'bg-indigo-100', text: 'text-indigo-600', hover: 'hover:bg-indigo-100' },
      red: { bg: 'bg-red-100', text: 'text-red-600', hover: 'hover:bg-red-100' }
    }
    return colors[color] || colors.blue
  }

  const getDotColor = (color: string) => {
    const dots: Record<string, string> = {
      blue: 'bg-blue-500',
      green: 'bg-green-500',
      purple: 'bg-purple-500',
      orange: 'bg-orange-500',
      indigo: 'bg-indigo-500',
      red: 'bg-red-500'
    }
    return dots[color] || dots.blue
  }

  return (
    <section id="use-cases" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Trusted Across Industries
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Arbitra's flexible platform adapts to diverse dispute resolution needs, 
            from enterprise contracts to consumer protection.
          </p>
        </div>

        {/* Use Cases Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {useCases.map((useCase, index) => {
            const colorClasses = getColorClasses(useCase.color)
            const dotColor = getDotColor(useCase.color)
            
            return (
              <div
                key={index}
                className="group bg-white rounded-2xl border border-gray-200 p-8 hover:border-blue-300 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                {/* Icon and Header */}
                <div className="flex items-start justify-between mb-6">
                  <div className={`w-14 h-14 ${colorClasses.bg} ${colorClasses.text} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                    <useCase.icon className="h-7 w-7" />
                  </div>
                  <span className="text-sm font-semibold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                    {useCase.stats}
                  </span>
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {useCase.title}
                </h3>
                
                <p className="text-gray-600 mb-6 leading-relaxed">
                  {useCase.description}
                </p>

                {/* Examples */}
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                    Common Cases
                  </h4>
                  <ul className="space-y-1">
                    {useCase.examples.map((example, exampleIndex) => (
                      <li key={exampleIndex} className="flex items-center space-x-2 text-sm text-gray-600">
                        <div className={`w-1.5 h-1.5 ${dotColor} rounded-full`}></div>
                        <span>{example}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Hover Action */}
                <div className="mt-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <button className={`w-full ${colorClasses.bg} ${colorClasses.text} py-2 rounded-lg font-semibold text-sm ${colorClasses.hover} transition-colors duration-200`}>
                    View Case Study →
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        {/* Industry Adoption */}
        <div className="mt-20 bg-white rounded-2xl p-8 border border-gray-200">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Adopted by Industry Leaders
            </h3>
            <p className="text-gray-600">
              Trusted by forward-thinking organizations across multiple sectors
            </p>
          </div>

          {/* Logos Grid - Mock */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 items-center justify-items-center opacity-60">
            {['Tech Corp', 'LegalChain', 'Global Trade', 'FinTech Inc', 'SupplyLogix', 'eCommerce Pro'].map((company, index) => (
              <div key={index} className="text-gray-400 font-semibold text-lg">
                {company}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
