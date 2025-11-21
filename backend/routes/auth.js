// Authentication Routes
// Defines routes for user authentication (register, login)

import express from 'express';
import { register, login, getMe } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

/**
 * POST /api/auth/register
 * Register a new user
 * Public route - no authentication required
 * All users default to 'guest' role
 */
router.post('/register', register);

/**
 * POST /api/auth/login
 * Login user with email and password
 * Public route - no authentication required
 * Returns JWT token for authenticated requests
 */
router.post('/login', login);

/**
 * GET /api/auth/me
 * Get current authenticated user profile
 * Protected route - requires authentication
 */
router.get('/me', protect, getMe);

export default router;











