// Report Routes
// Defines routes for dashboard reports and metrics
// All routes require authentication

import express from 'express';
import { getMetrics, getTrends } from '../controllers/reportController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

/**
 * GET /api/reports/metrics
 * Get dashboard metrics (Open, In Progress, Closed, Urgent counts)
 * Protected route - requires authentication
 * Returns dummy/mock data for testing
 */
router.get('/metrics', protect, getMetrics);

/**
 * GET /api/reports/trends
 * Get monthly case filing trend data
 * Protected route - requires authentication
 * Returns dummy/mock data for testing
 */
router.get('/trends', protect, getTrends);

export default router;



