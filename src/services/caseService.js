// Case Service
import api from './api'

const handleServiceError = (error, defaultMessage = 'Service unavailable') => {
  if (error.isNetworkError) {
    return {
      success: false,
      error: {
        type: 'network',
        message: 'Unable to connect to the server. Please check your internet connection.',
      },
      data: { cases: [] },
    }
  }

  if (error.isEndpointUnavailable) {
    return {
      success: false,
      error: {
        type: 'unavailable',
        message: 'Service temporarily unavailable. Please try again later.',
      },
      data: { cases: [] },
    }
  }

  if (error.isServerError) {
    return {
      success: false,
      error: {
        type: 'server',
        message: 'Server error occurred. Please try again later.',
      },
      data: { cases: [] },
    }
  }

  return {
    success: false,
    error: {
      type: 'unknown',
      message: error.response?.data?.message || defaultMessage,
    },
    data: { cases: [] },
  }
}

export const caseService = {
  // Get all cases (admin/officer only)
  getCases: async (filters = {}) => {
    try {
      const params = new URLSearchParams()
      if (filters.category) params.append('category', filters.category)
      if (filters.status) params.append('status', filters.status)
      if (filters.assignedTo) params.append('assignedTo', filters.assignedTo)
      
      const queryString = params.toString()
      const url = queryString ? `/cases?${queryString}` : '/cases'
      
      const response = await api.get(url)
      return response.data
    } catch (error) {
      console.warn('Failed to fetch cases:', error)
      return handleServiceError(error, 'Failed to load cases')
    }
  },

  // Get case by ID (admin/officer only)
  getCaseById: async (caseId) => {
    try {
      const response = await api.get(`/cases/${caseId}`)
      return response.data
    } catch (error) {
      console.warn(`Failed to fetch case ${caseId}:`, error)
      return handleServiceError(error, 'Failed to load case details')
    }
  },

  // Create new case
  // Backend accepts both authenticated and guest submissions
  createCase: async (caseData) => {
    try {
      const response = await api.post('/cases', caseData)
      return response.data
    } catch (error) {
      console.error('Failed to create case:', error)
      throw error // Re-throw for UI to handle with user feedback
    }
  },

  // Update case (admin/officer only)
  updateCase: async (caseId, updates) => {
    try {
      const response = await api.put(`/cases/${caseId}`, updates)
      return response.data
    } catch (error) {
      console.error(`Failed to update case ${caseId}:`, error)
      throw error // Re-throw for UI to handle
    }
  },

  // Delete case (admin/officer only)
  deleteCase: async (caseId) => {
    try {
      const response = await api.delete(`/cases/${caseId}`)
      return response.data
    } catch (error) {
      console.error(`Failed to delete case ${caseId}:`, error)
      throw error // Re-throw for UI to handle
    }
  },

  // Get categories (public)
  getCategories: async () => {
    try {
      const response = await api.get('/cases/categories', { public: true })
      return response.data
    } catch (error) {
      console.warn('Failed to fetch case categories, using defaults:', error)
      // Return default categories if backend is unavailable
      return {
        success: true,
        data: {
          categories: [
            'Harassment',
            'Discrimination',
            'Academic Dispute',
            'Bullying',
            'Other',
          ],
        },
      }
    }
  },

  // Export cases report
  exportReport: async (type = 'all', format = 'json') => {
    try {
      const response = await api.get(`/cases/export?type=${type}&format=${format}`, { public: true })
      return response.data
    } catch (error) {
      console.error('Failed to export report:', error)
      throw error
    }
  },
}

