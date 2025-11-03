import React from 'react'
import { InternetIdentity } from '../auth/InternetIdentity'
import { Scale, Home, FileText } from 'lucide-react'

interface LayoutProps {
  children: React.ReactNode
  currentPage?: string
  onNavigate?: (page: string | 'dashboard' | 'create' | 'dispute-detail') => void
}

export const Layout: React.FC<LayoutProps> = ({ 
  children, 
  currentPage = 'dashboard',
  onNavigate 
}) => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Scale className="h-8 w-8 text-blue-600" />
                <span className="text-xl font-bold text-gray-900">Arbitra</span>
              </div>
              
              {/* Navigation */}
              <nav className="hidden md:flex space-x-8 ml-8">
                <button
                  onClick={() => onNavigate?.('dashboard')}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    currentPage === 'dashboard'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Home size={16} />
                  <span>Dashboard</span>
                </button>
                
                <button
                  onClick={() => onNavigate?.('create')}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    currentPage === 'create'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <FileText size={16} />
                  <span>New Dispute</span>
                </button>
              </nav>
            </div>

            <InternetIdentity />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-500">
              Powered by ICP Blockchain & Constellation Network
            </div>
            <div className="flex space-x-6 text-sm text-gray-500">
              <span>Arbitra v1.0</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

