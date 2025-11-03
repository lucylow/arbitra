import React from 'react'
import { Navigation } from './Navigation'
import { motion } from 'framer-motion'

interface LayoutProps {
  children: React.ReactNode
  currentPage?: string
  onNavigate?: (page: string | 'dashboard' | 'create' | 'dispute-detail') => void
}

const pageVariants = {
  initial: {
    opacity: 0,
    y: 10
  },
  in: {
    opacity: 1,
    y: 0
  },
  out: {
    opacity: 0,
    y: -10
  }
}

const pageTransition = {
  type: 'tween',
  ease: 'anticipate',
  duration: 0.3
}

export const Layout: React.FC<LayoutProps> = ({ 
  children, 
  currentPage = 'dashboard',
  onNavigate 
}) => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <Navigation currentPage={currentPage} onNavigate={onNavigate} />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <motion.div
          key={currentPage}
          initial="initial"
          animate="in"
          exit="out"
          variants={pageVariants}
          transition={pageTransition}
        >
          {children}
        </motion.div>
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

