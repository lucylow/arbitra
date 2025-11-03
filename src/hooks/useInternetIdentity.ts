import { useState, useEffect } from 'react'
import { Principal } from '@dfinity/principal'
import { getAuthClient, login, logout, isAuthenticated as checkAuth, getPrincipal } from '../services/agent'

export const useInternetIdentity = () => {
  const [identity, setIdentity] = useState<Principal | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const initAuth = async () => {
      try {
        getAuthClient() // Initialize auth client
        
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
      setIsLoading(true)
      await login()
      
      // Verify authentication state after login
      const authenticated = await checkAuth()
      setIsAuthenticated(authenticated)
      
      if (authenticated) {
        const principal = await getPrincipal()
        setIdentity(principal)
      } else {
        throw new Error('Authentication verification failed after login')
      }
    } catch (error) {
      console.error('Login failed:', error)
      setIsAuthenticated(false)
      setIdentity(null)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      setIsLoading(true)
      await logout()
      // logout() already reloads the page, but reset state just in case
      setIdentity(null)
      setIsAuthenticated(false)
    } catch (error) {
      console.error('Logout failed:', error)
      // Even if logout fails, reset local state
      setIdentity(null)
      setIsAuthenticated(false)
      // Reload page to clear any cached state
      if (typeof window !== 'undefined') {
        window.location.reload()
      }
    } finally {
      setIsLoading(false)
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

