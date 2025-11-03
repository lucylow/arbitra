import React, { useState } from 'react'
import { Home, FileText, Menu, X, Scale, Search, Settings, LogOut } from 'lucide-react'
import { useInternetIdentity } from '../../hooks/useInternetIdentity'

interface NavigationProps {
  currentPage?: string
  onNavigate?: (page: string | 'dashboard' | 'create' | 'dispute-detail') => void
}

export const Navigation: React.FC<NavigationProps> = ({ 
  currentPage = 'dashboard',
  onNavigate 
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { logout, identity } = useInternetIdentity()

  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: Home,
      path: 'dashboard'
    },
    {
      id: 'create',
      label: 'New Dispute',
      icon: FileText,
      path: 'create'
    }
  ]

  const handleNavClick = (page: string) => {
    onNavigate?.(page as 'dashboard' | 'create' | 'dispute-detail')
    setMobileMenuOpen(false)
  }

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  const formatPrincipal = (principal: any) => {
    if (!principal) return 'Not logged in'
    const text = principal.toString()
    return text.length > 20 ? `${text.slice(0, 10)}...${text.slice(-8)}` : text
  }

  return (
    <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 cursor-pointer" onClick={() => handleNavClick('dashboard')}>
              <Scale className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">Arbitra</span>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex md:space-x-1 ml-8">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = currentPage === item.id
                
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.path)}
                    className={`
                      flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                      ${isActive
                        ? 'bg-blue-50 text-blue-700 shadow-sm'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }
                    `}
                  >
                    <Icon size={18} className={isActive ? 'text-blue-600' : 'text-gray-500'} />
                    <span>{item.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Right Side - User Actions */}
          <div className="flex items-center space-x-4">
            {/* Search (Optional) */}
            <button
              className="hidden md:flex items-center justify-center w-10 h-10 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
              title="Search"
            >
              <Search size={18} />
            </button>

            {/* Settings (Optional) */}
            <button
              className="hidden md:flex items-center justify-center w-10 h-10 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
              title="Settings"
            >
              <Settings size={18} />
            </button>

            {/* User Info - Desktop */}
            <div className="hidden md:flex items-center space-x-3">
              <div className="text-right">
                <div className="text-xs text-gray-500">Logged in as</div>
                <div className="text-sm font-mono text-gray-700">{formatPrincipal(identity)}</div>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-red-600 transition-colors"
                title="Logout"
              >
                <LogOut size={16} />
                <span className="hidden lg:inline">Logout</span>
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden flex items-center justify-center w-10 h-10 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t bg-white">
          <div className="px-4 py-2 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = currentPage === item.id
              
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.path)}
                  className={`
                    w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors
                    ${isActive
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-50'
                    }
                  `}
                >
                  <Icon size={20} className={isActive ? 'text-blue-600' : 'text-gray-500'} />
                  <span>{item.label}</span>
                </button>
              )
            })}
            
            <div className="border-t my-2"></div>
            
            {/* Mobile User Info */}
            <div className="px-4 py-2">
              <div className="text-xs text-gray-500 mb-1">Logged in as</div>
              <div className="text-sm font-mono text-gray-700 mb-3">{formatPrincipal(identity)}</div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut size={18} />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
