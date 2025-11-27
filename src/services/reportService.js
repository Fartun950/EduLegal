// Report Service
// Handles dashboard reports and metrics
import api from './api'

export const reportService = {
  // Get dashboard metrics (Open, In Progress, Closed, Urgent counts)
  getMetrics: async () => {
    try {
      const response = await api.get('/reports/metrics')
      return response.data
    } catch (error) {
      console.error('Failed to fetch metrics:', error)
      throw error
    }
  },

  // Get monthly case filing trends
  getTrends: async () => {
    try {
      const response = await api.get('/reports/trends')
      return response.data
    } catch (error) {
      console.error('Failed to fetch trends:', error)
      throw error
    }
  },
}



