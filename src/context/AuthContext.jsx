// Authentication Context
import { createContext, useState, useEffect, useContext } from 'react'
import { authService } from '../services/authService'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    // Check if user is logged in on mount
    const token = authService.getToken()
    const storedUser = authService.getUser()
    
    if (token && storedUser) {
      setUser(storedUser)
      setIsAuthenticated(true)
      // Verify token is still valid
      authService.getMe()
        .then((response) => {
          // Backend returns: { success: true, data: { user: {...} } }
          const userData = response?.data?.user || response?.data?.data?.user || storedUser
          if (userData) {
            // Normalize role if needed
            let role = userData.role || storedUser?.role || 'guest'
            if (role === 'legalOfficer') {
              role = 'legal'
            }
            const normalizedUser = { ...userData, role }
            setUser(normalizedUser)
            localStorage.setItem('user', JSON.stringify(normalizedUser))
            localStorage.setItem('role', role)
          }
        })
        .catch((error) => {
          // Token invalid or network error, logout
          console.warn('Token verification failed:', error.message)
          authService.logout()
          setUser(null)
          setIsAuthenticated(false)
        })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const login = async (credentials) => {
    try {
      const response = await authService.login(credentials)
      // Backend returns: { success: true, token, role }
      // Create user object from response
      const role = response.role || response.data?.role || 'guest'
      const userData = { role }
      setUser(userData)
      setIsAuthenticated(true)
      localStorage.setItem('role', role)
      localStorage.setItem('user', JSON.stringify(userData))
      return response
    } catch (error) {
      throw error
    }
  }

  const register = async (userData) => {
    try {
      const response = await authService.register(userData)
      // Backend returns: { success: true, token, role }
      // Create user object from response
      const role = response.role || response.data?.role || 'guest'
      const userData_response = { role }
      setUser(userData_response)
      setIsAuthenticated(true)
      localStorage.setItem('role', role)
      localStorage.setItem('user', JSON.stringify(userData_response))
      return response
    } catch (error) {
      throw error
    }
  }

  const logout = () => {
    authService.logout()
    setUser(null)
    setIsAuthenticated(false)
  }

  const updateUser = (userData) => {
    setUser(userData)
    localStorage.setItem('user', JSON.stringify(userData))
  }

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    updateUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

