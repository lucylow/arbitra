import React from 'react'
import { ArrowRight, Zap, Shield, Globe } from 'lucide-react'

export const CTASection: React.FC<{ onEnterApp?: () => void }> = ({ onEnterApp }) => {
  return (
    <section className="relative py-20 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-20"></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Header */}
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
          Ready to Revolutionize Your Dispute Resolution?
        </h2>
        
        <p className="text-xl text-blue-100 mb-12 max-w-3xl mx-auto leading-relaxed">
          Join thousands of forward-thinking organizations already using Arbitra to 
          resolve disputes faster, cheaper, and more fairly than ever before.
        </p>

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12 max-w-4xl mx-auto">
          <div className="flex flex-col items-center text-white">
            <Zap className="h-8 w-8 text-yellow-300 mb-3" />
            <div className="font-semibold mb-1">Instant Resolution</div>
            <div className="text-blue-100 text-sm">Resolve disputes in hours, not months</div>
          </div>
          <div className="flex flex-col items-center text-white">
            <Shield className="h-8 w-8 text-green-300 mb-3" />
            <div className="font-semibold mb-1">100% Secure</div>
            <div className="text-blue-100 text-sm">Blockchain-verified evidence & rulings</div>
          </div>
          <div className="flex flex-col items-center text-white">
            <Globe className="h-8 w-8 text-cyan-300 mb-3" />
            <div className="font-semibold mb-1">Global Access</div>
            <div className="text-blue-100 text-sm">Cross-border disputes made simple</div>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
          <button 
            onClick={onEnterApp}
            className="group bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-200 flex items-center space-x-2"
          >
            <span>Start Your First Case</span>
            <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </button>
          
          <button className="border-2 border-white text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white hover:text-blue-600 transition-all duration-200">
            Schedule Demo
          </button>
        </div>

        {/* Additional Info */}
        <div className="text-blue-100 text-sm">
          <p>No credit card required • Free for first 3 cases • 24/7 Support</p>
        </div>

        {/* Trust Indicators */}
        <div className="mt-12 pt-8 border-t border-blue-500">
          <p className="text-blue-200 text-sm mb-4">TRUSTED BY INDUSTRY LEADERS</p>
          <div className="flex flex-wrap items-center justify-center gap-8 opacity-80">
            {['Fortune 500', 'LegalTech Awards', 'Blockchain Alliance', 'Global Enterprises'].map((trust, index) => (
              <div key={index} className="text-white font-semibold text-sm">
                {trust}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg 
          viewBox="0 0 1200 120" 
          preserveAspectRatio="none" 
          className="w-full h-12 text-white"
        >
          <path 
            d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" 
            opacity=".25" 
            fill="currentColor"
          ></path>
          <path 
            d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" 
            opacity=".5" 
            fill="currentColor"
          ></path>
          <path 
            d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z" 
            fill="currentColor"
          ></path>
        </svg>
      </div>
    </section>
  )
}
