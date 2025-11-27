// User Routes
// Defines routes for user-related operations
// Admin can list all users and manage roles
// Users can view/update their own profile

import express from 'express';
import {
  getUsers,
  getUserById,
  updateUser,
  updateUserRole,
} from '../controllers/userController.js';
import { protect } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/roles.js';

const router = express.Router();

/**
 * GET /api/users
 * Get all users with optional role filtering
 * Protected route - requires admin role
 */
router.get('/', protect, requireAdmin, getUsers);

/**
 * GET /api/users/:id
 * Get single user profile
 * Protected route - requires authentication
 * User can view their own profile, admin can view any profile
 */
router.get('/:id', protect, getUserById);

/**
 * PUT /api/users/:id
 * Update user profile
 * Protected route - requires authentication
 * User can update their own profile, admin can update any profile
 */
router.put('/:id', protect, updateUser);

/**
 * PUT /api/users/:id/role
 * Update user role
 * Protected route - requires admin role
 */
router.put('/:id/role', protect, requireAdmin, updateUserRole);

export default router;

