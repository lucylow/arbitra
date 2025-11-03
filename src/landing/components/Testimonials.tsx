import React from 'react'
import { Star, Quote } from 'lucide-react'

const testimonials = [
  {
    name: 'Sarah Chen',
    role: 'Legal Director, TechCorp International',
    content: 'Arbitra reduced our contract dispute resolution time from 3 months to under 48 hours. The AI analysis was remarkably accurate and the blockchain evidence tracking eliminated authenticity challenges.',
    rating: 5,
    case: 'Resolved $2.4M service agreement dispute'
  },
  {
    name: 'Marcus Rodriguez',
    role: 'CEO, SupplyChain Innovations',
    content: 'The cross-border capabilities are game-changing. We resolved a complex international logistics dispute without worrying about jurisdictional issues. The automated settlement saved us weeks of paperwork.',
    rating: 5,
    case: 'International shipping dispute resolution'
  },
  {
    name: 'Dr. Emily Watson',
    role: 'General Counsel, FinTech Global',
    content: 'As a legal professional, I was skeptical about AI arbitration. But Arbitra\'s explainable reasoning and high confidence scores won me over. It\'s the future of legal dispute resolution.',
    rating: 5,
    case: 'DeFi protocol smart contract dispute'
  },
  {
    name: 'James Kim',
    role: 'E-commerce Entrepreneur',
    content: 'For small businesses, legal disputes were always cost-prohibitive. Arbitra made professional dispute resolution accessible. The cost savings are incredible.',
    rating: 5,
    case: 'Consumer protection case resolution'
  },
  {
    name: 'Lisa Thompson',
    role: 'COO, Manufacturing Consortium',
    content: 'The supply chain dispute resolution feature transformed our operations. Real-time evidence tracking and instant settlements improved our partner relationships significantly.',
    rating: 5,
    case: 'Supply chain quality dispute'
  },
  {
    name: 'Robert Michaels',
    role: 'Blockchain Developer',
    content: 'Finally, a dispute resolution platform that understands crypto and DeFi. The native cross-chain integration and smart contract automation are exactly what the space needed.',
    rating: 5,
    case: 'DAO governance dispute resolution'
  }
]

export const Testimonials: React.FC = () => {
  return (
    <section id="testimonials" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Trusted by Industry Leaders
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            See how forward-thinking organizations are transforming their dispute 
            resolution processes with Arbitra's AI-powered platform.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="group bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-200 p-8 hover:border-blue-300 hover:shadow-xl transition-all duration-300"
            >
              {/* Quote Icon */}
              <div className="text-blue-100 mb-4 group-hover:text-blue-200 transition-colors duration-300">
                <Quote className="h-8 w-8" />
              </div>

              {/* Rating */}
              <div className="flex items-center space-x-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>

              {/* Content */}
              <blockquote className="text-gray-700 mb-6 leading-relaxed italic">
                "{testimonial.content}"
              </blockquote>

              {/* Case Study */}
              <div className="mb-6">
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                  Case Study
                </div>
                <div className="text-sm text-blue-600 font-medium">
                  {testimonial.case}
                </div>
              </div>

              {/* Author */}
              <div className="border-t border-gray-200 pt-6">
                <div className="font-semibold text-gray-900">{testimonial.name}</div>
                <div className="text-sm text-gray-600">{testimonial.role}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Stats Bar */}
        <div className="mt-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold mb-2">98%</div>
              <div className="text-blue-100 text-sm">User Satisfaction</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-2">5,000+</div>
              <div className="text-blue-100 text-sm">Cases Resolved</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-2">$50M+</div>
              <div className="text-blue-100 text-sm">Dispute Value</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-2">24/7</div>
              <div className="text-blue-100 text-sm">Global Operation</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
