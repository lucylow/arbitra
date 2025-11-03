import { useState, useEffect } from 'react'
import { AuthClient } from '@dfinity/auth-client'
import { Principal } from '@dfinity/principal'
import { getAuthClient, login, logout, isAuthenticated as checkAuth, getPrincipal } from '../services/agent'

export const useInternetIdentity = () => {
  const [identity, setIdentity] = useState<Principal | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const initAuth = async () => {
      try {
        await getAuthClient()
        
        const authenticated = await checkAuth()
        setIsAuthenticated(authenticated)
        
        if (authenticated) {
          const principal = await getPrincipal()
          setIdentity(principal)
        }
      } catch (error) {
        console.error('Auth initialization failed:', error)
      } finally {
        setIsLoading(false)
      }
    }

    initAuth()
  }, [])

  const handleLogin = async () => {
    try {
      await login()
      const authenticated = await checkAuth()
      setIsAuthenticated(authenticated)
      
      if (authenticated) {
        const principal = await getPrincipal()
        setIdentity(principal)
      }
    } catch (error) {
      console.error('Login failed:', error)
      throw error
    }
  }

  const handleLogout = async () => {
    try {
      await logout()
      setIdentity(null)
      setIsAuthenticated(false)
    } catch (error) {
      console.error('Logout failed:', error)
      // Even if logout fails, reset local state
      setIdentity(null)
      setIsAuthenticated(false)
    }
  }

  return {
    identity,
    isAuthenticated,
    isLoading,
    login: handleLogin,
    logout: handleLogout
  }
}

