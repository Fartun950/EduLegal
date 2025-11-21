// API Configuration and Axios instance
import axios from 'axios'

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
      // Token expired or invalid - only redirect if not on guest/public pages or admin/legal officer pages
      const publicPaths = ['/welcome', '/complaint', '/resources']
      const adminLegalPaths = ['/admin', '/admin-dashboard', '/legal', '/legal-dashboard', '/officer']
      const currentPath = window.location.pathname
      
      // Don't redirect if on public pages or admin/legal officer pages (they don't require auth)
      const isPublicPath = publicPaths.some(path => currentPath.startsWith(path))
      const isAdminLegalPath = adminLegalPaths.some(path => currentPath.startsWith(path))
      
      if (!isPublicPath && !isAdminLegalPath) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        // Only redirect protected routes to login, guest routes and admin/legal officer routes stay
        window.location.href = '/welcome'
      }

    }
    return Promise.reject(error)
  }
)

export default api


