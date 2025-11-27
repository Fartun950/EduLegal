// Complaint Routes
// Defines routes for complaint-related operations
// Public complaint submissions with file upload support

import express from 'express';
import { createComplaint } from '../controllers/complaintController.js';
import { uploadComplaintFiles, handleComplaintUploadError } from '../middleware/complaintUpload.js';

const router = express.Router();

/**
 * POST /api/complaints
 * Create a new complaint with optional file attachments
 * Public route - no authentication required
 * Supports Student, Staff, and Anonymous submissions
 * Handles multipart/form-data for file uploads using Multer
 */
router.post(
  '/',
  uploadComplaintFiles,
  handleComplaintUploadError,
  createComplaint
);

export default router;

