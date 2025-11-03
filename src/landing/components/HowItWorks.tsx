import React from 'react'
import { FileText, Upload, Brain, Scale, CheckCircle } from 'lucide-react'

const steps = [
  {
    step: '01',
    icon: FileText,
    title: 'Create Dispute',
    description: 'Initiate a new arbitration case by providing dispute details, parties involved, and governing legal framework.',
    color: 'blue'
  },
  {
    step: '02',
    icon: Upload,
    title: 'Submit Evidence',
    description: 'Upload digital evidence securely anchored to Constellation Network with cryptographic proof of integrity.',
    color: 'purple'
  },
  {
    step: '03',
    icon: Brain,
    title: 'AI Analysis',
    description: 'Our advanced AI analyzes evidence, applies legal reasoning, and generates a fair ruling with confidence scoring.',
    color: 'green'
  },
  {
    step: '04',
    icon: Scale,
    title: 'Review & Accept',
    description: 'Parties review the AI ruling with explainable reasoning. Accept the decision or escalate to human arbitration.',
    color: 'orange'
  },
  {
    step: '05',
    icon: CheckCircle,
    title: 'Automated Settlement',
    description: 'Smart contracts automatically execute settlements via ICP\'s cross-chain capabilities with instant fund distribution.',
    color: 'indigo'
  }
]

export const HowItWorks: React.FC = () => {
  return (
    <section id="how-it-works" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            How Arbitra Works
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            A seamless, five-step process that transforms complex legal disputes into 
            efficient, technology-driven resolutions.
          </p>
        </div>

        {/* Steps Timeline */}
        <div className="relative">
          {/* Connecting Line */}
          <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 to-purple-500 transform -translate-x-1/2"></div>

          {/* Steps */}
          <div className="space-y-12 lg:space-y-0">
            {steps.map((step, index) => (
              <div
                key={index}
                className={`relative flex flex-col lg:flex-row items-center ${
                  index % 2 === 0 ? 'lg:flex-row-reverse' : ''
                }`}
              >
                {/* Content */}
                <div className={`lg:w-1/2 ${index % 2 === 0 ? 'lg:pr-12' : 'lg:pl-12'} mb-8 lg:mb-0`}>
                  <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-300">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className={`w-12 h-12 bg-${step.color}-100 text-${step.color}-600 rounded-xl flex items-center justify-center`}>
                        <step.icon className="h-6 w-6" />
                      </div>
                      <span className="text-sm font-semibold text-gray-500">Step {step.step}</span>
                    </div>
                    
                    <h3 className="text-xl font-bold text-gray-900 mb-3">
                      {step.title}
                    </h3>
                    
                    <p className="text-gray-600 leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>

                {/* Step Number Circle */}
                <div className="flex-shrink-0 w-16 h-16 bg-white border-4 border-blue-500 rounded-full flex items-center justify-center z-10">
                  <span className="text-xl font-bold text-blue-600">{step.step}</span>
                </div>

                {/* Spacer for alternating sides */}
                <div className="lg:w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
