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
  getCaseNotes,
  addCaseNote,
  updateCaseNote,
  deleteCaseNote,
  getCaseStats,
  getUnassignedCases,
  getCaseTimeline,
  getCaseDocuments,
  uploadCaseDocument,
  downloadCaseDocument,
  deleteCaseDocument,
  getMyCases,
  getAssignedCases,
} from '../controllers/caseController.js';
import { protect, optionalAuth } from '../middleware/auth.js';
import { requireAdminOrOfficer } from '../middleware/roles.js';
import { uploadSingle, handleUploadError } from '../middleware/upload.js';

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
 * Protected route - requires admin or legalOfficer role
 */
router.get('/export', protect, requireAdminOrOfficer, exportCasesReport);

/**
 * GET /api/cases/stats
 * Get case statistics for dashboard
 * Protected route - requires admin or legalOfficer role
 */
router.get('/stats', protect, requireAdminOrOfficer, getCaseStats);

/**
 * GET /api/cases/unassigned
 * Get all unassigned cases
 * Protected route - requires admin or legalOfficer role
 */
router.get('/unassigned', protect, requireAdminOrOfficer, getUnassignedCases);

/**
 * GET /api/cases/my
 * Get current user's cases (for guests)
 * Protected route - requires authentication
 * Returns only cases created by the authenticated user
 */
router.get('/my', protect, getMyCases);

/**
 * GET /api/cases/assigned
 * Get cases assigned to the logged-in officer
 * Protected route - requires authentication
 * Returns dummy/mock data for testing
 */
router.get('/assigned', protect, getAssignedCases);

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
 * GET /api/cases/:id/notes
 * Get all notes for a case
 * Protected route - requires admin or legalOfficer role
 */
router.get('/:id/notes', protect, requireAdminOrOfficer, getCaseNotes);

/**
 * POST /api/cases/:id/notes
 * Add note to a case
 * Protected route - requires admin or legalOfficer role
 */
router.post('/:id/notes', protect, requireAdminOrOfficer, addCaseNote);

/**
 * PUT /api/cases/:id/notes/:noteId
 * Update case note
 * Protected route - requires admin or legalOfficer role
 */
router.put('/:id/notes/:noteId', protect, requireAdminOrOfficer, updateCaseNote);

/**
 * DELETE /api/cases/:id/notes/:noteId
 * Delete case note
 * Protected route - requires admin or legalOfficer role
 */
router.delete('/:id/notes/:noteId', protect, requireAdminOrOfficer, deleteCaseNote);

/**
 * GET /api/cases/:id/timeline
 * Get case timeline/activity log
 * Protected route - requires admin or legalOfficer role
 */
router.get('/:id/timeline', protect, requireAdminOrOfficer, getCaseTimeline);

/**
 * GET /api/cases/:id/documents
 * Get all documents for a case
 * Protected route - requires admin or legalOfficer role
 */
router.get('/:id/documents', protect, requireAdminOrOfficer, getCaseDocuments);

/**
 * POST /api/cases/:id/documents
 * Upload document to a case
 * Protected route - requires admin or legalOfficer role
 */
router.post('/:id/documents', protect, requireAdminOrOfficer, uploadSingle, handleUploadError, uploadCaseDocument);

/**
 * GET /api/cases/:id/documents/:docId
 * Download case document
 * Protected route - requires admin or legalOfficer role
 */
router.get('/:id/documents/:docId', protect, requireAdminOrOfficer, downloadCaseDocument);

/**
 * DELETE /api/cases/:id/documents/:docId
 * Delete case document
 * Protected route - requires admin or legalOfficer role
 */
router.delete('/:id/documents/:docId', protect, requireAdminOrOfficer, deleteCaseDocument);

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
 * Protected route - requires authentication
 * Admin and legalOfficer can delete any case
 * Guests can only delete their own cases if status is 'open' (new)
 */
router.delete('/:id', protect, deleteCase);

export default router;



