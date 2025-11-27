// Forum Service
// Note: Forum routes are not yet implemented in backend
// This service is prepared for future backend integration
import api from './api'

export const forumService = {
  // Get all forum posts (public or protected based on backend implementation)
  getPosts: async () => {
    try {
      const response = await api.get('/forum/posts')
      return response.data
    } catch (error) {
      // If forum endpoint doesn't exist yet, return mock data
      console.warn('Forum endpoint not available, using mock data:', error)
      return {
        success: true,
        data: {
          posts: []
        }
      }
    }
  },

  // Get single post by ID
  getPostById: async (postId) => {
    try {
      const response = await api.get(`/forum/posts/${postId}`)
      return response.data
    } catch (error) {
      console.warn('Forum endpoint not available:', error)
      return { success: false, message: 'Forum post not found' }
    }
  },

  // Create new forum post
  createPost: async (postData) => {
    try {
      const response = await api.post('/forum/posts', postData)
      return response.data
    } catch (error) {
      console.warn('Forum endpoint not available:', error)
      throw error
    }
  },

  // Update forum post
  updatePost: async (postId, updates) => {
    try {
      const response = await api.put(`/forum/posts/${postId}`, updates)
      return response.data
    } catch (error) {
      console.warn('Forum endpoint not available:', error)
      throw error
    }
  },

  // Delete forum post
  deletePost: async (postId) => {
    try {
      const response = await api.delete(`/forum/posts/${postId}`)
      return response.data
    } catch (error) {
      console.warn('Forum endpoint not available:', error)
      throw error
    }
  },

  // Add comment/reply to post
  addComment: async (postId, comment) => {
    try {
      const response = await api.post(`/forum/posts/${postId}/comments`, comment)
      return response.data
    } catch (error) {
      console.warn('Forum endpoint not available:', error)
      throw error
    }
  },
}












