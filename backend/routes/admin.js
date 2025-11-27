// Admin Routes
// Defines routes for admin-only operations
// All routes require authentication and admin role

import express from 'express';
import { createLegalOfficer } from '../controllers/adminController.js';
import { protect } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/roles.js';

const router = express.Router();

/**
 * POST /api/admin/user
 * Create a new Legal Officer
 * Protected route - requires authentication and admin role
 */
router.post('/user', protect, requireAdmin, createLegalOfficer);

export default router;



