// Complaint Service
// Handles complaint submission operations with file upload support
import api from './api'

export const complaintService = {
  // Submit a new complaint with optional file attachments
  // Public endpoint - no authentication required
  // Supports multipart/form-data for file uploads
  submitComplaint: async (complaintData, files = null) => {
    try {
      let response;
      
      // If files are provided, use FormData
      if (files && files.length > 0) {
        const formData = new FormData();
        
        // Append all complaint fields to FormData
        Object.keys(complaintData).forEach(key => {
          if (complaintData[key] !== null && complaintData[key] !== undefined) {
            formData.append(key, complaintData[key]);
          }
        });
        
        // Append files to FormData with the field name 'attachments'
        files.forEach((file) => {
          formData.append('attachments', file);
        });
        
        // Send multipart/form-data request
        // Don't set Content-Type header - let browser set it with boundary
        response = await api.post('/complaints', formData, {
          public: true,
        });
      } else {
        // No files - send as JSON
        response = await api.post('/complaints', complaintData, { public: true });
      }
      
      return response.data;
    } catch (error) {
      console.error('Failed to submit complaint:', error);
      throw error; // Re-throw for UI to handle with user feedback
    }
  },
}

