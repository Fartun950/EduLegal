// Notification Service
// Note: Notification routes are not yet implemented in backend
// This service is prepared for future backend integration
import api from './api'

export const notificationService = {
  // Get all notifications for current user
  getNotifications: async () => {
    try {
      const response = await api.get('/notifications')
      return response.data
    } catch (error) {
      // If notifications endpoint doesn't exist yet, return empty array
      console.warn('Notifications endpoint not available:', error)
      return {
        success: true,
        data: {
          notifications: []
        }
      }
    }
  },

  // Get unread notifications count
  getUnreadCount: async () => {
    try {
      const response = await api.get('/notifications/unread-count')
      return response.data
    } catch (error) {
      console.warn('Notifications endpoint not available:', error)
      return { success: true, data: { count: 0 } }
    }
  },

  // Mark notification as read
  markAsRead: async (notificationId) => {
    try {
      const response = await api.put(`/notifications/${notificationId}/read`)
      return response.data
    } catch (error) {
      console.warn('Notifications endpoint not available:', error)
      throw error
    }
  },

  // Mark all notifications as read
  markAllAsRead: async () => {
    try {
      const response = await api.put('/notifications/read-all')
      return response.data
    } catch (error) {
      console.warn('Notifications endpoint not available:', error)
      throw error
    }
  },

  // Delete notification
  deleteNotification: async (notificationId) => {
    try {
      const response = await api.delete(`/notifications/${notificationId}`)
      return response.data
    } catch (error) {
      console.warn('Notifications endpoint not available:', error)
      throw error
    }
  },
}









