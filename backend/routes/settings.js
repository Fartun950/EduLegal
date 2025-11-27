// Settings Routes
// Defines routes for settings-related operations
// Guest users can delete their own complaints and update theme preferences

import express from 'express';
import {
  deleteGuestComplaint,
  updatePreferences,
  getPreferences,
} from '../controllers/settingsController.js';
import { optionalAuth, protect } from '../middleware/auth.js';

const router = express.Router();

/**
 * DELETE /api/settings/complaint/:id
 * Delete guest complaint
 * Public route - uses optionalAuth to support both authenticated and anonymous guests
 * Authenticated users can delete if they created it
 * Anonymous guests can delete if they provide name/email verification
 */
router.delete('/complaint/:id', optionalAuth, deleteGuestComplaint);

/**
 * GET /api/settings/preferences
 * Get user preferences
 * Protected route - requires authentication
 */
router.get('/preferences', protect, getPreferences);

/**
 * PUT /api/settings/preferences
 * Update user preferences (theme, etc.)
 * Protected route - requires authentication
 */
router.put('/preferences', protect, updatePreferences);

export default router;

