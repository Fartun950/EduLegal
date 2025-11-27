// API Configuration and Axios instance
import axios from 'axios'
import { isPublicRoute, ROUTES } from '../config/routes'
import auditService from './auditService'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    // Only add token if this is not a public request and token exists
    if (!config.public) {
      const token = localStorage.getItem('token')
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    }
    
    // For FormData, let the browser set Content-Type with boundary
    // Don't override Content-Type for multipart/form-data
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type']
    }
    
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const currentPath = window.location.pathname
      
      // Log token expiration/invalid token
      if (error.response?.data?.message?.includes('expired')) {
        auditService.logTokenExpiration(currentPath)
      } else {
        auditService.logInvalidToken(currentPath)
      }
      
      // Only redirect if not on public pages
      if (!isPublicRoute(currentPath)) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        localStorage.removeItem('role')
        
        // Use navigation service if available, otherwise fallback
        // Note: Navigation service is initialized in App.jsx
        if (typeof window !== 'undefined') {
          const navigationService = window.__navigationService
          if (navigationService) {
            navigationService.redirectToWelcome()
          } else {
            // Fallback: use window.location.replace to avoid back button issues
            // This is better than window.location.href as it doesn't add to history
            window.location.replace(ROUTES.WELCOME)
          }
        }
      }
    }
    return Promise.reject(error)
  }
)

export default api


