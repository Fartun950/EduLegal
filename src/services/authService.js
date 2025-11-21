// Authentication Service
import api from './api'

export const authService = {
  // Register new user
  register: async (userData) => {
    const response = await api.post('/auth/register', userData, { public: true })
    // Backend returns: { success: true, token, role }
    if (response.data.success && response.data.token && response.data.role) {
      let role = response.data.role
      if (role === 'legalOfficer') {
        role = 'legal'
      }
      localStorage.setItem('token', response.data.token)
      localStorage.setItem('role', role)
      localStorage.setItem('user', JSON.stringify({ role }))
    }
    return response.data
  },

  // Login user
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials, { public: true })
    // Backend returns: { success: true, token, role }
    if (response.data.success && response.data.token && response.data.role) {
      let role = response.data.role
      if (role === 'legalOfficer') {
        role = 'legal'
      }
      localStorage.setItem('token', response.data.token)
      localStorage.setItem('role', role)
      localStorage.setItem('user', JSON.stringify({ role }))
    }
    return response.data
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

