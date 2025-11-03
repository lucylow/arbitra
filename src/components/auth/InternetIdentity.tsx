import React, { useState } from 'react'
import { useInternetIdentity } from '../../hooks/useInternetIdentity'
import { LogIn, LogOut, User, AlertCircle } from 'lucide-react'

export const InternetIdentity: React.FC = () => {
  const { identity, isAuthenticated, isLoading, login, logout } = useInternetIdentity()
  const [error, setError] = useState<string | null>(null)

  const handleLogin = async () => {
    try {
      setError(null)
      await login()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to connect with Internet Identity'
      setError(errorMessage)
      console.error('Login error:', err)
    }
  }

  const handleLogout = async () => {
    try {
      setError(null)
      await logout()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to logout'
      setError(errorMessage)
      console.error('Logout error:', err)
    }
  }

  if (isLoading) {
    return (
      <div className="animate-pulse bg-gray-200 rounded-lg px-4 py-2 w-32">
        <div className="h-4 bg-gray-300 rounded"></div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-end space-y-2">
      <div className="flex items-center space-x-4">
        {isAuthenticated ? (
          <>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <User size={16} />
              <span className="font-mono" title={identity?.toString()}>
                {identity?.toString().substring(0, 8)}...
              </span>
            </div>
            <button
              onClick={handleLogout}
              disabled={isLoading}
              className="flex items-center space-x-2 bg-red-500 hover:bg-red-600 disabled:bg-red-300 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition-colors"
            >
              <LogOut size={16} />
              <span>Logout</span>
            </button>
          </>
        ) : (
          <button
            onClick={handleLogin}
            disabled={isLoading}
            className="flex items-center space-x-2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition-colors"
          >
            <LogIn size={16} />
            <span>Login with Internet Identity</span>
          </button>
        )}
      </div>
      {error && (
        <div className="flex items-center space-x-2 text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2 max-w-md">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}
    </div>
  )
}

