// Case Controller
// Handles all case-related operations
// Guest users can only create cases
// Admin and legalOfficer can view, edit, update, and delete cases

import Case from '../models/Case.js';

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

    // Filter by category if provided
    if (category) {
      filter.category = category;
    }

    // Filter by status if provided
    if (status) {
      filter.status = status;
    }

    // Filter by assigned officer if provided
    if (assignedTo) {
      filter.assignedTo = assignedTo;
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

    // Build update object with only provided fields
    const updateData = {};
    if (title) updateData.title = title;
    if (description) updateData.description = description;
    if (category) updateData.category = category;
    if (status) updateData.status = status;
    if (priority) updateData.priority = priority;
    if (assignedTo !== undefined) updateData.assignedTo = assignedTo;

    // Update case
    caseData = await Case.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true, // Return updated document
        runValidators: true, // Run model validators
      }
    ).populate('createdBy', 'name email role').populate('assignedTo', 'name email role');

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
 * Only admin and legalOfficer can delete cases (protected by requireAdminOrOfficer middleware)
 * Guests cannot delete cases
 */
export const deleteCase = async (req, res) => {
  try {
    // Find and delete case by ID
    const caseData = await Case.findById(req.params.id);

    // Check if case exists
    if (!caseData) {
      return res.status(404).json({
        success: false,
        message: 'Case not found',
      });
    }

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
