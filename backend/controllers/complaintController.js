// Complaint Controller
// Handles complaint-related operations
// Public complaint submissions with reporterType support and file uploads

import Complaint from '../models/Complaint.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Create new complaint with optional file attachments
 * POST /api/complaints
 * Public route - no authentication required
 * Handles Student, Staff, and Anonymous submissions
 * Supports multipart/form-data with file uploads via Multer
 */
export const createComplaint = async (req, res) => {
  try {
    // Extract complaint data from request body
    // If multipart/form-data, fields are in req.body as strings
    // Files are in req.files array
    const { reporterType, reporterName, reporterEmail, title, description, category, priority } = req.body;

    // Validate required fields
    if (!reporterType) {
      return res.status(400).json({
        success: false,
        message: 'Reporter type is required',
      });
    }

    if (!title || !description || !category) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title, description, and category',
      });
    }

    // Validate reporterType
    const validReporterTypes = ['student', 'staff', 'anonymous'];
    if (!validReporterTypes.includes(reporterType)) {
      return res.status(400).json({
        success: false,
        message: 'Reporter type must be student, staff, or anonymous',
      });
    }

    // Conditional validation based on reporterType
    let finalReporterName = null;
    let finalReporterEmail = null;

    if (reporterType === 'anonymous') {
      // For anonymous complaints, do not store name or email
      finalReporterName = null;
      finalReporterEmail = null;
    } else if (reporterType === 'student' || reporterType === 'staff') {
      // For student/staff, reporterName is required
      if (!reporterName || reporterName.trim() === '') {
        return res.status(400).json({
          success: false,
          message: 'Reporter name is required for student and staff submissions',
        });
      }
      finalReporterName = reporterName.trim();
      // Email is optional for student/staff
      finalReporterEmail = reporterEmail && reporterEmail.trim() !== '' ? reporterEmail.trim().toLowerCase() : null;
    }

    // Handle file attachments if uploaded via Multer
    const attachments = [];
    if (req.files && req.files.length > 0) {
      // Extract file paths from uploaded files
      // Files are stored in uploads/complaints directory
      req.files.forEach((file) => {
        // Store relative path from uploads directory
        // Format: /uploads/complaints/filename
        const relativePath = `/uploads/complaints/${file.filename}`;
        attachments.push(relativePath);
      });
    }

    // Create new complaint with attachments
    const complaint = await Complaint.create({
      reporterType,
      reporterName: finalReporterName,
      reporterEmail: finalReporterEmail,
      title: title.trim(),
      description: description.trim(),
      category,
      priority: priority || 'medium',
      status: 'open', // Default status
      attachments, // Array of file paths
    });

    res.status(201).json({
      success: true,
      message: 'Complaint submitted successfully. Thank you for your submission.',
      data: {
        complaint: {
          _id: complaint._id,
          reporterType: complaint.reporterType,
          title: complaint.title,
          category: complaint.category,
          status: complaint.status,
          priority: complaint.priority,
          attachments: complaint.attachments, // Include attachments in response
          createdAt: complaint.createdAt,
        },
      },
    });
  } catch (error) {
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: messages,
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error submitting complaint',
      error: error.message,
    });
  }
};

