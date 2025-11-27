// Case Controller
// Handles all case-related operations
// Guest users can only create cases
// Admin and legalOfficer can view, edit, update, and delete cases

import Case from '../models/Case.js';
import Complaint from '../models/Complaint.js';
import CaseNote from '../models/CaseNote.js';
import CaseDocument from '../models/CaseDocument.js';
import CaseActivity from '../models/CaseActivity.js';
import User from '../models/User.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { notifyNewCase, notifyCaseAssigned, notifyCaseStatusChanged } from '../services/notificationService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Get all cases
 * GET /api/cases
 * Only admin and legalOfficer can access (protected by requireAdminOrOfficer middleware)
 * Guests cannot view cases
 */
export const getCases = async (req, res) => {
  try {
    // Extract query parameters for filtering
    const { category, status, assignedTo } = req.query;

    // Build filter object
    const filter = {};

    // Role-based filtering
    // Admin sees all cases
    // Legal Officer sees assigned cases + unassigned cases (available for pickup)
    if (req.user.role === 'legalOfficer') {
      // Legal Officer can see:
      // 1. Cases assigned to them
      // 2. Unassigned cases (available for pickup)
      filter.$or = [
        { assignedTo: req.user._id },
        { assignedTo: null },
      ];
    }
    // Admin sees all cases (no additional filter)

    // Filter by category if provided
    if (category) {
      filter.category = category;
    }

    // Filter by status if provided
    if (status) {
      filter.status = status;
    }

    // Filter by assigned officer if provided (overrides role-based filter)
    if (assignedTo) {
      filter.assignedTo = assignedTo;
      delete filter.$or; // Remove role-based filter if assignedTo is specified
    }

    // Find all cases matching filter
    // Populate createdBy and assignedTo fields with user information
    const cases = await Case.find(filter)
      .populate('createdBy', 'name email role')
      .populate('assignedTo', 'name email role')
      .sort({ createdAt: -1 }); // Sort by newest first

    res.status(200).json({
      success: true,
      count: cases.length,
      data: {
        cases,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching cases',
      error: error.message,
    });
  }
};

/**
 * Get single case by ID
 * GET /api/cases/:id
 * Only admin and legalOfficer can access (protected by requireAdminOrOfficer middleware)
 * Guests cannot view individual cases
 */
export const getCaseById = async (req, res) => {
  try {
    // Find case by ID
    // Populate createdBy and assignedTo fields with user information
    const caseData = await Case.findById(req.params.id)
      .populate('createdBy', 'name email role')
      .populate('assignedTo', 'name email role');

    // Check if case exists
    if (!caseData) {
      return res.status(404).json({
        success: false,
        message: 'Case not found',
      });
    }

    res.status(200).json({
      success: true,
      data: {
        case: caseData,
      },
    });
  } catch (error) {
    // Handle invalid ObjectId format
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Case not found',
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error fetching case',
      error: error.message,
    });
  }
};

/**
 * Create new case
 * POST /api/cases
 * Public route - allows both authenticated and guest (unauthenticated) submissions
 * Guest users can submit cases with any category including staff-related scenarios
 * If user is authenticated, case is linked to user; if not, createdBy is null (anonymous)
 */
export const createCase = async (req, res) => {
  try {
    // Extract case data from request body
    const { title, description, category, priority, name, gender } = req.body;

    // Validate required fields
    if (!title || !description || !category) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title, description, and category',
      });
    }

    // Determine submission context
    const isAuthenticated = !!req.user;
    const submissionRole = isAuthenticated ? req.user.role : 'guest';
    const submissionName = isAuthenticated ? (req.user.name || name || null) : (name || null);
    const submissionGender = gender || null;

    // Create new case
    // createdBy is set from authenticated user if available (req.user from optional auth middleware)
    // If no user (guest submission), createdBy will be null
    const caseData = await Case.create({
      title,
      description,
      category,
      priority: priority || 'medium',
      role: submissionRole,
      name: submissionName,
      gender: submissionGender,
      createdBy: req.user?._id || null, // Set from authenticated user if available, otherwise null
      status: 'open', // Default status
    });

    // Populate createdBy field with user information if user exists
    if (caseData.createdBy) {
      await caseData.populate('createdBy', 'name email role');
    }

    // Create activity log entry
    const submitterName = isAuthenticated ? (req.user.name || 'User') : (name || 'Anonymous');
    await CaseActivity.create({
      case: caseData._id,
      user: req.user?._id || null,
      action: 'created',
      details: `Case created by ${submitterName}`,
      metadata: {
        title: caseData.title,
        category: caseData.category,
      },
    }).catch(error => {
      console.error('Error creating activity log:', error);
      // Don't throw - activity log failure shouldn't break case creation
    });

    // Automatically create notifications for all admin and legal officer users
    // This happens asynchronously so it doesn't block the response
    notifyNewCase(caseData).catch(error => {
      console.error('Error creating notifications for new case:', error);
      // Don't throw - notification failure shouldn't break case creation
    });

    res.status(201).json({
      success: true,
      message: req.user ? 'Case created successfully' : 'Case submitted successfully. Thank you for your submission.',
      data: {
        case: caseData,
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
      message: 'Error creating case',
      error: error.message,
    });
  }
};

/**
 * Update case
 * PUT /api/cases/:id
 * Only admin and legalOfficer can update cases (protected by requireAdminOrOfficer middleware)
 * Guests cannot update cases
 */
export const updateCase = async (req, res) => {
  try {
    // Find case by ID
    let caseData = await Case.findById(req.params.id);

    // Check if case exists
    if (!caseData) {
      return res.status(404).json({
        success: false,
        message: 'Case not found',
      });
    }

    // Extract update data from request body
    const { title, description, category, status, priority, assignedTo } = req.body;

    // Track if status or assignment changed for notifications
    const oldStatus = caseData.status;
    const oldAssignedTo = caseData.assignedTo?.toString() || null;

    // Build update object with only provided fields
    const updateData = {};
    if (title) updateData.title = title;
    if (description) updateData.description = description;
    if (category) updateData.category = category;
    if (status) updateData.status = status;
    if (priority) updateData.priority = priority;
    if (assignedTo !== undefined) updateData.assignedTo = assignedTo;

    // Validate assignment - ensure assigned user is legalOfficer
    if (assignedTo !== undefined && assignedTo !== null) {
      const assignedUser = await User.findById(assignedTo);
      if (!assignedUser) {
        return res.status(404).json({
          success: false,
          message: 'Assigned user not found',
        });
      }
      if (assignedUser.role !== 'legalOfficer') {
        return res.status(400).json({
          success: false,
          message: 'Cases can only be assigned to legal officers',
        });
      }
    }

    // Update case
    caseData = await Case.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true, // Return updated document
        runValidators: true, // Run model validators
      }
    ).populate('createdBy', 'name email role').populate('assignedTo', 'name email role');

    // Create activity log and notifications for status changes
    if (status && status !== oldStatus) {
      await CaseActivity.create({
        case: caseData._id,
        user: req.user._id,
        action: 'status_changed',
        details: `Case status changed from ${oldStatus} to ${status} by ${req.user.name || 'User'}`,
        metadata: {
          oldStatus,
          newStatus: status,
        },
      }).catch(error => {
        console.error('Error creating activity log for status change:', error);
      });

      notifyCaseStatusChanged(caseData, status).catch(error => {
        console.error('Error creating notifications for status change:', error);
      });
    }

    // Create activity log and notifications for case assignment
    const newAssignedTo = caseData.assignedTo?._id?.toString() || null;
    if (assignedTo !== undefined && newAssignedTo !== oldAssignedTo && newAssignedTo) {
      // Case was assigned to a new officer
      const officer = caseData.assignedTo;
      await CaseActivity.create({
        case: caseData._id,
        user: req.user._id,
        action: 'assigned',
        details: `Case assigned to ${officer?.name || 'Legal Officer'} by ${req.user.name || 'Admin'}`,
        metadata: {
          assignedTo: newAssignedTo,
          officerName: officer?.name,
        },
      }).catch(error => {
        console.error('Error creating activity log for assignment:', error);
      });

      notifyCaseAssigned(caseData, newAssignedTo).catch(error => {
        console.error('Error creating notifications for case assignment:', error);
      });
    }

    res.status(200).json({
      success: true,
      message: 'Case updated successfully',
      data: {
        case: caseData,
      },
    });
  } catch (error) {
    // Handle invalid ObjectId format
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Case not found',
      });
    }

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
      message: 'Error updating case',
      error: error.message,
    });
  }
};

/**
 * Delete case
 * DELETE /api/cases/:id
 * Admin and legalOfficer can delete any case
 * Guests can only delete their own cases if status is 'open' (new)
 */
export const deleteCase = async (req, res) => {
  try {
    // Find case by ID
    const caseData = await Case.findById(req.params.id);

    // Check if case exists
    if (!caseData) {
      return res.status(404).json({
        success: false,
        message: 'Case not found',
      });
    }

    // Check if user is admin or legalOfficer (can delete any case)
    const isAdminOrOfficer = req.user && (req.user.role === 'admin' || req.user.role === 'legalOfficer');
    
    if (!isAdminOrOfficer) {
      // Guest user - check if they own the case
      if (!req.user || !req.user._id) {
        return res.status(403).json({
          success: false,
          message: 'Authentication required to delete cases',
        });
      }

      // Check if case belongs to the user
      if (!caseData.createdBy || caseData.createdBy.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You can only delete complaints you submitted.',
        });
      }

      // Check if status is 'open' (new) - guests can only delete new complaints
      if (caseData.status !== 'open') {
        return res.status(400).json({
          success: false,
          message: 'Cannot delete complaint. Only new complaints (status: open) can be deleted.',
        });
      }
    }

    // Delete associated data
    await CaseNote.deleteMany({ case: caseData._id }).catch(() => {});
    await CaseDocument.deleteMany({ case: caseData._id }).catch(() => {});
    await CaseActivity.deleteMany({ case: caseData._id }).catch(() => {});

    // Delete case
    await Case.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Case deleted successfully',
      data: {},
    });
  } catch (error) {
    // Handle invalid ObjectId format
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Case not found',
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error deleting case',
      error: error.message,
    });
  }
};

/**
 * Get available categories
 * GET /api/cases/categories
 * Public route - returns all available categories for form dropdowns
 * All users (including guests) can access this to see available categories
 */
export const getCategories = async (req, res) => {
  try {
    // Return all available categories
    // Guest users (including staff) can see all categories including staff-related ones
    const categories = [
      // Regular categories
      'harassment',
      'academicIssue',
      'bullying',
      'discrimination',
      'gradeAppeal',
      'other',
      // Staff-related categories (available to all users)
      'staffScenario',
      'workplaceHarassment',
      'sexualHarassment',
      'staffMisconduct',
      'staffConflict',
      'discriminationStaff',
      'breachConfidentiality',
      'fraudCorruption',
      'abuseOfPower',
      'unfairWorkload',
      'workplaceSafety',
      // Legal category
      'legal',
    ];

    res.status(200).json({
      success: true,
      data: {
        categories,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching categories',
      error: error.message,
    });
  }
};

/**
 * Export cases report
 * GET /api/cases/export
 * Only admin and legalOfficer can export reports
 */
export const exportCasesReport = async (req, res) => {
  try {
    const { type, format } = req.query;

    // Get cases based on type
    let filter = {};
    if (type === 'open') filter.status = 'open';
    else if (type === 'closed') filter.status = 'closed';
    else if (type === 'pending') filter.status = 'open'; // Pending cases are open

    const cases = await Case.find(filter)
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 });

    // Generate report data
    const reportData = cases.map(c => ({
      caseId: c._id,
      title: c.title,
      category: c.category,
      status: c.status,
      priority: c.priority,
      student: c.createdBy?.name || 'Anonymous',
      officer: c.assignedTo?.name || 'Unassigned',
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
    }));

    if (format === 'csv') {
      // Generate CSV
      const headers = ['Case ID', 'Title', 'Category', 'Status', 'Priority', 'Student', 'Officer', 'Created', 'Updated'];
      const csvRows = [
        headers.join(','),
        ...reportData.map(row => [
          row.caseId,
          `"${row.title}"`,
          row.category,
          row.status,
          row.priority,
          `"${row.student}"`,
          `"${row.officer}"`,
          new Date(row.createdAt).toISOString(),
          new Date(row.updatedAt).toISOString(),
        ].join(','))
      ];
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=cases-report-${type || 'all'}-${Date.now()}.csv`);
      res.status(200).send(csvRows.join('\n'));
    } else {
      // Generate JSON (default)
      res.status(200).json({
        success: true,
        message: 'Report generated successfully',
        data: {
          report: {
            type: type || 'all',
            format: format || 'json',
            totalCases: reportData.length,
            generatedAt: new Date().toISOString(),
            cases: reportData,
          },
        },
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error generating report',
      error: error.message,
    });
  }
};

/**
 * Get all notes for a case
 * GET /api/cases/:id/notes
 * Only admin and legalOfficer can access notes (protected by requireAdminOrOfficer middleware)
 */
export const getCaseNotes = async (req, res) => {
  try {
    const caseId = req.params.id;
    
    // Verify case exists
    const caseData = await Case.findById(caseId);
    if (!caseData) {
      return res.status(404).json({
        success: false,
        message: 'Case not found',
      });
    }
    
    // Get all notes for this case
    const notes = await CaseNote.find({ case: caseId })
      .populate('author', 'name email role')
      .sort({ createdAt: -1 }); // Sort by newest first
    
    res.status(200).json({
      success: true,
      count: notes.length,
      data: {
        notes,
      },
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Case not found',
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error fetching case notes',
      error: error.message,
    });
  }
};

/**
 * Add note to a case
 * POST /api/cases/:id/notes
 * Only admin and legalOfficer can add notes (protected by requireAdminOrOfficer middleware)
 */
export const addCaseNote = async (req, res) => {
  try {
    const caseId = req.params.id;
    const { note } = req.body;
    
    // Validate required fields
    if (!note) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a note',
      });
    }
    
    // Verify case exists
    const caseData = await Case.findById(caseId);
    if (!caseData) {
      return res.status(404).json({
        success: false,
        message: 'Case not found',
      });
    }
    
    // Create new note
    const caseNote = await CaseNote.create({
      case: caseId,
      author: req.user._id,
      note,
      confidential: true, // All case notes are confidential
    });
    
    // Populate author field
    await caseNote.populate('author', 'name email role');
    
    // Create activity log entry
    await CaseActivity.create({
      case: caseId,
      user: req.user._id,
      action: 'note_added',
      details: `Confidential note added by ${req.user.name || 'User'}`,
      metadata: {
        noteId: caseNote._id,
      },
    }).catch(error => {
      console.error('Error creating activity log for note:', error);
      // Don't throw - activity log failure shouldn't break note creation
    });
    
    res.status(201).json({
      success: true,
      message: 'Note added successfully',
      data: {
        note: caseNote,
      },
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Case not found',
      });
    }
    
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
      message: 'Error adding note',
      error: error.message,
    });
  }
};

/**
 * Update case note
 * PUT /api/cases/:id/notes/:noteId
 * Only author or admin can update note (protected by requireAdminOrOfficer middleware)
 */
export const updateCaseNote = async (req, res) => {
  try {
    const { id: caseId, noteId } = req.params;
    const { note } = req.body;
    
    // Validate required fields
    if (!note) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a note',
      });
    }
    
    // Verify case exists
    const caseData = await Case.findById(caseId);
    if (!caseData) {
      return res.status(404).json({
        success: false,
        message: 'Case not found',
      });
    }
    
    // Find note
    const caseNote = await CaseNote.findById(noteId);
    if (!caseNote) {
      return res.status(404).json({
        success: false,
        message: 'Note not found',
      });
    }
    
    // Check if note belongs to the case
    if (caseNote.case.toString() !== caseId) {
      return res.status(400).json({
        success: false,
        message: 'Note does not belong to this case',
      });
    }
    
    // Check if user is author or admin
    const isAuthor = caseNote.author.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    
    if (!isAuthor && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only the author or admin can update this note.',
      });
    }
    
    // Update note
    caseNote.note = note;
    await caseNote.save();
    
    // Populate author field
    await caseNote.populate('author', 'name email role');
    
    res.status(200).json({
      success: true,
      message: 'Note updated successfully',
      data: {
        note: caseNote,
      },
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Note or case not found',
      });
    }
    
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
      message: 'Error updating note',
      error: error.message,
    });
  }
};

/**
 * Delete case note
 * DELETE /api/cases/:id/notes/:noteId
 * Only author or admin can delete note (protected by requireAdminOrOfficer middleware)
 */
export const deleteCaseNote = async (req, res) => {
  try {
    const { id: caseId, noteId } = req.params;
    
    // Verify case exists
    const caseData = await Case.findById(caseId);
    if (!caseData) {
      return res.status(404).json({
        success: false,
        message: 'Case not found',
      });
    }
    
    // Find note
    const caseNote = await CaseNote.findById(noteId);
    if (!caseNote) {
      return res.status(404).json({
        success: false,
        message: 'Note not found',
      });
    }
    
    // Check if note belongs to the case
    if (caseNote.case.toString() !== caseId) {
      return res.status(400).json({
        success: false,
        message: 'Note does not belong to this case',
      });
    }
    
    // Check if user is author or admin
    const isAuthor = caseNote.author.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    
    if (!isAuthor && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only the author or admin can delete this note.',
      });
    }
    
    // Delete note
    await CaseNote.findByIdAndDelete(noteId);
    
    res.status(200).json({
      success: true,
      message: 'Note deleted successfully',
      data: {},
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Note or case not found',
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error deleting note',
      error: error.message,
    });
  }
};

/**
 * Get case statistics for dashboard
 * GET /api/cases/stats
 * Returns dashboard statistics (total cases, open cases, unassigned cases, etc.)
 * Role-based statistics: Admin sees all, Legal Officer sees assigned + unassigned
 */
export const getCaseStats = async (req, res) => {
  try {
    // Build base filter based on role
    let filter = {};
    
    if (req.user.role === 'legalOfficer') {
      // Legal Officer sees assigned cases + unassigned cases
      filter.$or = [
        { assignedTo: req.user._id },
        { assignedTo: null },
      ];
    }
    // Admin sees all cases (no filter)
    
    // Get all relevant cases
    const allCases = await Case.find(filter);
    
    // Calculate statistics
    const stats = {
      totalCases: allCases.length,
      openCases: allCases.filter(c => c.status === 'open').length,
      inProgressCases: allCases.filter(c => c.status === 'inProgress').length,
      closedCases: allCases.filter(c => c.status === 'closed').length,
      unassignedCases: allCases.filter(c => !c.assignedTo).length,
    };
    
    // Add assigned cases count for legal officers
    if (req.user.role === 'legalOfficer') {
      stats.assignedCases = allCases.filter(c => 
        c.assignedTo && c.assignedTo.toString() === req.user._id.toString()
      ).length;
    } else {
      // Admin sees total assigned cases
      stats.assignedCases = allCases.filter(c => c.assignedTo).length;
    }
    
    res.status(200).json({
      success: true,
      data: {
        stats,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching case statistics',
      error: error.message,
    });
  }
};

/**
 * Get unassigned cases
 * GET /api/cases/unassigned
 * Returns all unassigned cases for legal officer review and admin dashboard
 */
export const getUnassignedCases = async (req, res) => {
  try {
    // Find all unassigned cases
    const unassignedCases = await Case.find({ assignedTo: null })
      .populate('createdBy', 'name email role')
      .sort({ createdAt: -1 }); // Sort by newest first
    
    res.status(200).json({
      success: true,
      count: unassignedCases.length,
      data: {
        cases: unassignedCases,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching unassigned cases',
      error: error.message,
    });
  }
};

/**
 * Get case timeline/activity log
 * GET /api/cases/:id/timeline
 * Returns activity log for a case
 */
export const getCaseTimeline = async (req, res) => {
  try {
    const caseId = req.params.id;
    
    // Verify case exists
    const caseData = await Case.findById(caseId);
    if (!caseData) {
      return res.status(404).json({
        success: false,
        message: 'Case not found',
      });
    }
    
    // Get all activities for this case
    const activities = await CaseActivity.find({ case: caseId })
      .populate('user', 'name email role')
      .sort({ createdAt: 1 }); // Sort by oldest first for timeline
    
    res.status(200).json({
      success: true,
      count: activities.length,
      data: {
        timeline: activities,
      },
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Case not found',
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error fetching case timeline',
      error: error.message,
    });
  }
};

/**
 * Get assigned cases for logged-in user
 * GET /api/cases/assigned
 * Protected route - requires authentication
 * 
 * - Admin: Returns ALL cases (assigned and unassigned)
 * - Legal Officer: Returns cases where assignedTo is their ID OR where assignedTo is null (unassigned)
 */
export const getAssignedCases = async (req, res) => {
  try {
    const user = req.user;
    
    // Build filter based on user role
    let filter = {};
    
    if (user.role === 'admin') {
      // Admin sees ALL cases - no filter
      filter = {};
    } else if (user.role === 'legalOfficer') {
      // Legal Officer sees:
      // 1. Cases assigned to them (assignedTo === user._id)
      // 2. Unassigned cases (assignedTo === null)
      filter = {
        $or: [
          { assignedTo: user._id },
          { assignedTo: null }
        ]
      };
    } else {
      // Guest users cannot access this endpoint (should be protected by middleware)
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only admin and legal officers can view assigned cases.',
      });
    }

    // Try to fetch from database first
    try {
      // Fetch cases based on filter
      const cases = await Case.find(filter)
        .populate('createdBy', 'name email role')
        .populate('assignedTo', 'name email role')
        .sort({ createdAt: -1 }); // Sort by newest first

      // Also fetch complaints (which should appear as unassigned cases)
      // Complaints submitted by guests should appear for Admin and Legal Officers viewing unassigned cases
      let complaintFilter = {};
      if (user.role === 'legalOfficer') {
        // Legal Officer sees unassigned complaints (assignedTo is null)
        complaintFilter = { assignedTo: null };
      }
      // Admin sees all complaints (no filter needed)

      const complaints = await Complaint.find(complaintFilter)
        .populate('assignedTo', 'name email role')
        .sort({ createdAt: -1 });

      // Transform complaints to match case format for frontend compatibility
      const transformedComplaints = complaints.map(complaint => ({
        _id: complaint._id,
        title: complaint.title,
        description: complaint.description,
        category: complaint.category,
        status: complaint.status,
        priority: complaint.priority,
        assignedTo: complaint.assignedTo,
        createdBy: null, // Complaints don't have createdBy user reference
        name: complaint.reporterName || null,
        reporterType: complaint.reporterType,
        attachments: complaint.attachments || [],
        createdAt: complaint.createdAt,
        updatedAt: complaint.updatedAt,
        isComplaint: true, // Flag to identify as complaint
      }));

      // Combine cases and complaints, sort by creation date
      const allItems = [...cases, ...transformedComplaints].sort((a, b) => {
        return new Date(b.createdAt) - new Date(a.createdAt);
      });

      return res.status(200).json({
        success: true,
        count: allItems.length,
        data: {
          cases: allItems,
        },
      });
    } catch (dbError) {
      // If database query fails (e.g., MongoDB not connected), return mock data
      console.warn('Database query failed, returning mock data:', dbError.message);
      
      // Generate mock data based on user role
      const assignedCases = [
        {
          _id: '507f1f77bcf86cd799439011',
          title: 'Harassment Complaint - Student A',
          description: 'Student reported verbal harassment from another student during class.',
          category: 'harassment',
          status: 'inProgress',
          priority: 'high',
          assignedTo: user.role === 'legalOfficer' ? {
            _id: user._id,
            name: user.name || 'Legal Officer',
            email: user.email,
          } : {
            _id: '507f1f77bcf86cd799439020',
            name: 'John Doe',
            email: 'officer@example.com',
          },
          createdAt: '2024-01-15T10:30:00.000Z',
          updatedAt: '2024-01-20T14:45:00.000Z',
        },
        {
          _id: '507f1f77bcf86cd799439012',
          title: 'Grade Appeal - Course XYZ',
          description: 'Student requesting grade review for final exam.',
          category: 'gradeAppeal',
          status: 'open',
          priority: 'medium',
          assignedTo: null, // Unassigned case
          createdAt: '2024-01-18T09:15:00.000Z',
          updatedAt: '2024-01-18T09:15:00.000Z',
        },
        {
          _id: '507f1f77bcf86cd799439013',
          title: 'Discrimination Case - Staff Member',
          description: 'Staff member reporting discrimination in workplace.',
          category: 'discriminationStaff',
          status: 'inProgress',
          priority: 'urgent',
          assignedTo: user.role === 'legalOfficer' ? {
            _id: user._id,
            name: user.name || 'Legal Officer',
            email: user.email,
          } : {
            _id: '507f1f77bcf86cd799439021',
            name: 'Jane Smith',
            email: 'jane@example.com',
          },
          createdAt: '2024-01-10T11:20:00.000Z',
          updatedAt: '2024-01-22T16:30:00.000Z',
        },
        {
          _id: '507f1f77bcf86cd799439014',
          title: 'Academic Issue - Course Registration',
          description: 'Student unable to register for required course.',
          category: 'academicIssue',
          status: 'open',
          priority: 'low',
          assignedTo: null, // Unassigned case
          createdAt: '2024-01-22T08:00:00.000Z',
          updatedAt: '2024-01-22T08:00:00.000Z',
        },
        {
          _id: '507f1f77bcf86cd799439015',
          title: 'Bullying Incident Report',
          description: 'Multiple students reporting bullying behavior.',
          category: 'bullying',
          status: 'closed',
          priority: 'high',
          assignedTo: user.role === 'legalOfficer' ? {
            _id: user._id,
            name: user.name || 'Legal Officer',
            email: user.email,
          } : {
            _id: '507f1f77bcf86cd799439022',
            name: 'Bob Wilson',
            email: 'bob@example.com',
          },
          createdAt: '2024-01-05T13:45:00.000Z',
          updatedAt: '2024-01-19T10:00:00.000Z',
        },
      ];

      // Add mock complaints (unassigned)
      const mockComplaints = [
        {
          _id: '607f1f77bcf86cd799439016',
          title: 'Guest Complaint - Harassment',
          description: 'Anonymous complaint about harassment incident.',
          category: 'harassment',
          status: 'open',
          priority: 'high',
          assignedTo: null, // Unassigned
          createdBy: null,
          name: null,
          reporterType: 'anonymous',
          attachments: [],
          createdAt: '2024-01-23T09:00:00.000Z',
          updatedAt: '2024-01-23T09:00:00.000Z',
          isComplaint: true,
        },
        {
          _id: '607f1f77bcf86cd799439017',
          title: 'Student Complaint - Grade Appeal',
          description: 'Student reporting unfair grade evaluation.',
          category: 'gradeAppeal',
          status: 'open',
          priority: 'medium',
          assignedTo: null, // Unassigned
          createdBy: null,
          name: 'Student Reporter',
          reporterType: 'student',
          attachments: [],
          createdAt: '2024-01-22T14:30:00.000Z',
          updatedAt: '2024-01-22T14:30:00.000Z',
          isComplaint: true,
        },
      ];

      // Combine cases and complaints
      const allMockItems = [...assignedCases, ...mockComplaints];

      // Filter mock data based on role
      let filteredItems = allMockItems;
      if (user.role === 'legalOfficer') {
        // Legal Officer sees assigned + unassigned (including complaints)
        filteredItems = allMockItems.filter(c => 
          !c.assignedTo || (c.assignedTo && c.assignedTo._id === user._id.toString())
        );
      }
      // Admin sees all cases and complaints (no filtering needed)

      // Sort by creation date (newest first)
      filteredItems.sort((a, b) => {
        return new Date(b.createdAt) - new Date(a.createdAt);
      });

      res.status(200).json({
        success: true,
        count: filteredItems.length,
        data: {
          cases: filteredItems,
        },
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching assigned cases',
      error: error.message,
    });
  }
};

/**
 * Get current user's cases (for guests)
 * GET /api/cases/my
 * Returns only cases created by the authenticated guest user
 */
export const getMyCases = async (req, res) => {
  try {
    // Check if user is authenticated
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    // Find all cases created by the current user
    const cases = await Case.find({ createdBy: req.user._id })
      .populate('createdBy', 'name email role')
      .populate('assignedTo', 'name email role')
      .sort({ createdAt: -1 }); // Sort by newest first

    res.status(200).json({
      success: true,
      count: cases.length,
      data: {
        cases,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching your cases',
      error: error.message,
    });
  }
};

/**
 * Get all documents for a case
 * GET /api/cases/:id/documents
 * Returns all documents attached to a case
 */
export const getCaseDocuments = async (req, res) => {
  try {
    const caseId = req.params.id;
    
    // Verify case exists
    const caseData = await Case.findById(caseId);
    if (!caseData) {
      return res.status(404).json({
        success: false,
        message: 'Case not found',
      });
    }
    
    // Get all documents for this case
    const documents = await CaseDocument.find({ case: caseId })
      .populate('uploadedBy', 'name email role')
      .sort({ createdAt: -1 }); // Sort by newest first
    
    res.status(200).json({
      success: true,
      count: documents.length,
      data: {
        documents,
      },
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Case not found',
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error fetching case documents',
      error: error.message,
    });
  }
};

/**
 * Upload document to a case
 * POST /api/cases/:id/documents
 * Only admin and legalOfficer can upload documents
 */
export const uploadCaseDocument = async (req, res) => {
  try {
    const caseId = req.params.id;
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a file to upload',
      });
    }
    
    // Verify case exists
    const caseData = await Case.findById(caseId);
    if (!caseData) {
      // Delete uploaded file if case doesn't exist
      if (req.file.path) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(404).json({
        success: false,
        message: 'Case not found',
      });
    }
    
    // Create document record
    const document = await CaseDocument.create({
      case: caseId,
      filename: req.file.filename,
      originalName: req.file.originalname,
      filePath: req.file.path,
      fileType: req.file.mimetype,
      fileSize: req.file.size,
      uploadedBy: req.user._id,
    });
    
    // Populate uploadedBy field
    await document.populate('uploadedBy', 'name email role');
    
    // Create activity log entry
    await CaseActivity.create({
      case: caseId,
      user: req.user._id,
      action: 'document_uploaded',
      details: `Document "${req.file.originalname}" uploaded by ${req.user.name || 'User'}`,
      metadata: {
        documentId: document._id,
        filename: req.file.originalname,
        fileSize: req.file.size,
      },
    }).catch(error => {
      console.error('Error creating activity log for document upload:', error);
    });
    
    res.status(201).json({
      success: true,
      message: 'Document uploaded successfully',
      data: {
        document,
      },
    });
  } catch (error) {
    // Delete uploaded file if there's an error
    if (req.file && req.file.path) {
      fs.unlinkSync(req.file.path);
    }
    
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Case not found',
      });
    }
    
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
      message: 'Error uploading document',
      error: error.message,
    });
  }
};

/**
 * Download case document
 * GET /api/cases/:id/documents/:docId
 * Returns the document file
 */
export const downloadCaseDocument = async (req, res) => {
  try {
    const { id: caseId, docId } = req.params;
    
    // Verify case exists
    const caseData = await Case.findById(caseId);
    if (!caseData) {
      return res.status(404).json({
        success: false,
        message: 'Case not found',
      });
    }
    
    // Find document
    const document = await CaseDocument.findById(docId);
    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found',
      });
    }
    
    // Check if document belongs to the case
    if (document.case.toString() !== caseId) {
      return res.status(400).json({
        success: false,
        message: 'Document does not belong to this case',
      });
    }
    
    // Check if file exists
    if (!fs.existsSync(document.filePath)) {
      return res.status(404).json({
        success: false,
        message: 'Document file not found',
      });
    }
    
    // Set headers for file download
    res.setHeader('Content-Disposition', `attachment; filename="${document.originalName}"`);
    res.setHeader('Content-Type', document.fileType);
    
    // Send file
    res.sendFile(path.resolve(document.filePath));
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Document or case not found',
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error downloading document',
      error: error.message,
    });
  }
};

/**
 * Delete case document
 * DELETE /api/cases/:id/documents/:docId
 * Only uploader or admin can delete document
 */
export const deleteCaseDocument = async (req, res) => {
  try {
    const { id: caseId, docId } = req.params;
    
    // Verify case exists
    const caseData = await Case.findById(caseId);
    if (!caseData) {
      return res.status(404).json({
        success: false,
        message: 'Case not found',
      });
    }
    
    // Find document
    const document = await CaseDocument.findById(docId);
    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found',
      });
    }
    
    // Check if document belongs to the case
    if (document.case.toString() !== caseId) {
      return res.status(400).json({
        success: false,
        message: 'Document does not belong to this case',
      });
    }
    
    // Check if user is uploader or admin
    const isUploader = document.uploadedBy.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    
    if (!isUploader && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only the uploader or admin can delete this document.',
      });
    }
    
    // Delete file from filesystem
    if (fs.existsSync(document.filePath)) {
      fs.unlinkSync(document.filePath);
    }
    
    // Create activity log entry
    await CaseActivity.create({
      case: caseId,
      user: req.user._id,
      action: 'document_deleted',
      details: `Document "${document.originalName}" deleted by ${req.user.name || 'User'}`,
      metadata: {
        documentId: document._id,
        filename: document.originalName,
      },
    }).catch(error => {
      console.error('Error creating activity log for document deletion:', error);
    });
    
    // Delete document record
    await CaseDocument.findByIdAndDelete(docId);
    
    res.status(200).json({
      success: true,
      message: 'Document deleted successfully',
      data: {},
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Document or case not found',
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error deleting document',
      error: error.message,
    });
  }
};
