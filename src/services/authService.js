// Authentication Service
import api from './api'

export const authService = {
  // Register new user
  register: async (userData) => {
    try {
      const response = await api.post('/auth/register', userData, { public: true })
      
      // Backend returns: { success: true, token, role }
      if (response.data && response.data.success) {
        if (response.data.token) {
          let role = response.data.role || 'guest'
          if (role === 'legalOfficer') {
            role = 'legal'
          }
          
          // Store token and user data
          localStorage.setItem('token', response.data.token)
          localStorage.setItem('role', role)
          
          // Store userId if available
          if (response.data.user?.id) {
            localStorage.setItem('userId', response.data.user.id)
            
            // Store legalOfficerId if user is a legal officer
            if (role === 'legal' || role === 'legalOfficer') {
              localStorage.setItem('legalOfficerId', response.data.user.id)
            }
          }
          
          // Store full user object if provided, otherwise just role
          const userData = response.data.user || { role }
          localStorage.setItem('user', JSON.stringify(userData))
          
          return response.data
        } else {
          throw new Error('Token not received from server')
        }
      } else {
        throw new Error(response.data?.message || 'Registration failed')
      }
    } catch (error) {
      console.error('Register service error:', error)
      // Re-throw with better error message
      if (error.response) {
        throw {
          response: error.response,
          message: error.response.data?.message || 'Registration failed',
        }
      } else {
        throw {
          isNetworkError: true,
          message: error.message || 'Unable to connect to server',
        }
      }
    }
  },

  // Login user
  login: async (credentials) => {
    try {
      const response = await api.post('/auth/login', credentials, { public: true })
      
      // Backend returns: { success: true, token, role, user: {...} }
      if (response.data && response.data.success) {
        if (response.data.token) {
          let role = response.data.role || 'guest'
          if (role === 'legalOfficer') {
            role = 'legal'
          }
          
          // Store token and user data
          localStorage.setItem('token', response.data.token)
          localStorage.setItem('role', role)
          
          // Store userId if available
          if (response.data.user?.id) {
            localStorage.setItem('userId', response.data.user.id)
          }
          
          // Store full user object if provided, otherwise just role
          const userData = response.data.user || { role }
          localStorage.setItem('user', JSON.stringify(userData))
          
          return response.data
        } else {
          throw new Error('Token not received from server')
        }
      } else {
        throw new Error(response.data?.message || 'Login failed')
      }
    } catch (error) {
      console.error('Login service error:', error)
      // Re-throw with better error message
      if (error.response) {
        // Server responded with error
        throw {
          response: error.response,
          message: error.response.data?.message || 'Login failed',
        }
      } else {
        // Network error or other issue
        throw {
          isNetworkError: true,
          message: error.message || 'Unable to connect to server',
        }
      }
    }
  },

  // Get current user profile
  getMe: async () => {
    const response = await api.get('/auth/me')
    return response.data
  },

  // Logout user
  logout: () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('role')
    localStorage.removeItem('userId')
    localStorage.removeItem('intendedDashboard')
    localStorage.removeItem('intendedRole')
  },

  // Get stored token
  getToken: () => {
    return localStorage.getItem('token')
  },

  // Get stored user
  getUser: () => {
    const user = localStorage.getItem('user')
    return user ? JSON.parse(user) : null
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    return !!localStorage.getItem('token')
  },
}

