import React from 'react'
import { useInternetIdentity } from '../../hooks/useInternetIdentity'
import { LogIn, LogOut, User } from 'lucide-react'

export const InternetIdentity: React.FC = () => {
  const { identity, isAuthenticated, isLoading, login, logout } = useInternetIdentity()

  if (isLoading) {
    return (
      <div className="animate-pulse bg-gray-200 rounded-lg px-4 py-2 w-32">
        <div className="h-4 bg-gray-300 rounded"></div>
      </div>
    )
  }

  return (
    <div className="flex items-center space-x-4">
      {isAuthenticated ? (
        <>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <User size={16} />
            <span className="font-mono">
              {identity?.toString().substring(0, 8)}...
            </span>
          </div>
          <button
            onClick={logout}
            className="flex items-center space-x-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </>
      ) : (
        <button
          onClick={login}
          className="flex items-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <LogIn size={16} />
          <span>Login with Internet Identity</span>
        </button>
      )}
    </div>
  )
}

