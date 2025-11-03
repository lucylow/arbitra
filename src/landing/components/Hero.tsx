import React from 'react'
import { Scale, ArrowRight, Shield, Zap, Globe } from 'lucide-react'

export const Hero: React.FC<{ onEnterApp?: () => void }> = ({ onEnterApp }) => {
  return (
    <section className="relative bg-gradient-to-br from-blue-50 via-white to-purple-50 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmMWY1ZjkiIGZpbGwtb3BhY2l0eT0iMC40Ij48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-20"></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-center">
        {/* Logo and Navigation */}
        <div className="flex justify-center items-center space-x-2 mb-8">
          <div className="flex items-center space-x-3">
            <Scale className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Arbitra
            </span>
          </div>
        </div>

        {/* Main Heading */}
        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
          AI-Powered Dispute Resolution
          <span className="block text-transparent bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text">
            On the Blockchain
          </span>
        </h1>

        <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
          Resolve commercial disputes instantly with AI arbitration, backed by immutable 
          evidence on ICP blockchain and Constellation network.
        </p>

        {/* Key Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 max-w-4xl mx-auto">
          <div className="flex items-center justify-center space-x-3 text-gray-700">
            <Zap className="h-5 w-5 text-green-500" />
            <span className="font-medium">Instant AI Analysis</span>
          </div>
          <div className="flex items-center justify-center space-x-3 text-gray-700">
            <Shield className="h-5 w-5 text-blue-500" />
            <span className="font-medium">Immutable Evidence</span>
          </div>
          <div className="flex items-center justify-center space-x-3 text-gray-700">
            <Globe className="h-5 w-5 text-purple-500" />
            <span className="font-medium">Cross-Chain Settlements</span>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <button 
            onClick={onEnterApp}
            className="group bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center space-x-2"
          >
            <span>Launch Arbitra dApp</span>
            <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </button>
          
          <button className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-xl font-semibold text-lg hover:border-blue-500 hover:text-blue-600 transition-all duration-200">
            View Demo Case
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-2xl mx-auto">
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900 mb-1">$32K+</div>
            <div className="text-gray-600 text-sm">Hackathon Prize Pool</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900 mb-1">284+</div>
            <div className="text-gray-600 text-sm">Active Hackers</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900 mb-1">19</div>
            <div className="text-gray-600 text-sm">Projects Built</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900 mb-1">&lt;5s</div>
            <div className="text-gray-600 text-sm">AI Analysis Time</div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-gray-400 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-gray-400 rounded-full mt-2"></div>
          </div>
        </div>
      </div>
    </section>
  )
}
