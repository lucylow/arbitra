import React, { useState } from 'react'
import { Scale, Lock, Brain, Bitcoin } from 'lucide-react'

export const LoginPage: React.FC = () => {
  const [connecting, setConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleInternetIdentity = async () => {
    setError('Internet Identity integration coming soon!')
  }

  const handlePlugWallet = async () => {
    setConnecting(true)
    setError(null)

    try {
      // Check if Plug is installed
      const hasPlug = window.ic?.plug !== undefined

      if (!hasPlug) {
        window.open('https://plugwallet.ooo/', '_blank')
        setError('Please install Plug Wallet first')
        setConnecting(false)
        return
      }

      // Request connection
      const connected = await window.ic.plug.requestConnect({
        whitelist: [],
        host: window.location.origin,
      })

      if (connected) {
        console.log('✅ Plug wallet connected successfully')
        const principal = await window.ic.plug.agent.getPrincipal()
        console.log('Principal:', principal.toString())
        // TODO: Navigate to main app or dashboard
      }
    } catch (err) {
      console.error('Plug wallet connection error:', err)
      setError(err instanceof Error ? err.message : 'Failed to connect Plug wallet')
    } finally {
      setConnecting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 flex flex-col items-center justify-center px-4">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center space-x-3 mb-4">
          <Scale className="h-12 w-12 text-white" />
          <h1 className="text-5xl font-bold text-white">Arbitra</h1>
        </div>
        <p className="text-xl text-blue-100">Decentralized Legal Dispute Resolution</p>
      </div>

      {/* Login Card */}
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold text-blue-600 text-center mb-4">
          Welcome to Arbitra
        </h2>
        
        <p className="text-gray-600 text-center mb-8 leading-relaxed">
          A blockchain-based platform for fair and transparent dispute resolution 
          powered by Internet Computer Protocol.
        </p>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Login Buttons */}
        <div className="space-y-4">
          <button
            onClick={handleInternetIdentity}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-xl font-semibold text-lg hover:shadow-lg transform hover:scale-105 transition-all duration-200"
          >
            Login with Internet Identity
          </button>

          <button
            onClick={handlePlugWallet}
            disabled={connecting}
            className="w-full border-2 border-blue-600 text-blue-600 py-4 rounded-xl font-semibold text-lg hover:bg-blue-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {connecting ? 'Connecting...' : 'Install Plug Wallet'}
          </button>
        </div>
      </div>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 max-w-5xl w-full">
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center text-white">
          <Lock className="h-8 w-8 mx-auto mb-3 text-yellow-300" />
          <h3 className="font-bold text-lg mb-2">🔒 Secure</h3>
          <p className="text-sm text-blue-100">
            Evidence stored on-chain with cryptographic verification
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center text-white">
          <Brain className="h-8 w-8 mx-auto mb-3 text-green-300" />
          <h3 className="font-bold text-lg mb-2">🧠 AI-Powered</h3>
          <p className="text-sm text-blue-100">
            Intelligent analysis to support arbitration decisions
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center text-white">
          <Bitcoin className="h-8 w-8 mx-auto mb-3 text-orange-300" />
          <h3 className="font-bold text-lg mb-2">₿ Bitcoin Escrow</h3>
          <p className="text-sm text-blue-100">
            Automated fund management with ICP Bitcoin integration
          </p>
        </div>
      </div>
    </div>
  )
}
