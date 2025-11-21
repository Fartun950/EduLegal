// Case Routes
// Defines routes for case-related operations
// Guest users can only create cases (POST)
// Admin and legalOfficer can view, edit, update, and delete cases

import express from 'express';
import {
  getCases,
  getCaseById,
  createCase,
  updateCase,
  deleteCase,
  getCategories,
  exportCasesReport,
} from '../controllers/caseController.js';
import { protect, optionalAuth } from '../middleware/auth.js';
import { requireAdminOrOfficer } from '../middleware/roles.js';

const router = express.Router();

/**
 * GET /api/cases/categories
 * Get all available categories
 * Public route - no authentication required
 * Returns all categories including staff-related ones
 */
router.get('/categories', getCategories);

/**
 * GET /api/cases/export
 * Export cases report
 * Public route - no authentication required (for admin/legal officer access)
 */
router.get('/export', exportCasesReport);

/**
 * POST /api/cases
 * Create a new case
 * Public route - no authentication required for guest submissions
 * Uses optionalAuth to link user if authenticated, but allows guest submissions
 * If authenticated, user info is linked; if not, case is created as anonymous
 * Guest, admin, and legalOfficer can all create cases
 * Guest users can submit cases with any category including staff-related scenarios
 */
router.post('/', optionalAuth, createCase);

/**
 * GET /api/cases
 * Get all cases with optional filtering
 * Protected route - requires admin or legalOfficer role
 * Guest users cannot view cases list
 */
router.get('/', protect, requireAdminOrOfficer, getCases);

/**
 * GET /api/cases/:id
 * Get single case by ID
 * Protected route - requires admin or legalOfficer role
 * Guest users cannot view individual cases
 */
router.get('/:id', protect, requireAdminOrOfficer, getCaseById);

/**
 * PUT /api/cases/:id
 * Update a case
 * Protected route - requires admin or legalOfficer role
 * Guest users cannot update cases
 */
router.put('/:id', protect, requireAdminOrOfficer, updateCase);

/**
 * DELETE /api/cases/:id
 * Delete a case
 * Protected route - requires admin or legalOfficer role
 * Guest users cannot delete cases
 */
router.delete('/:id', protect, requireAdminOrOfficer, deleteCase);

export default router;



