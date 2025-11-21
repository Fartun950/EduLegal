// Notification Routes
// Defines routes for notification-related operations
// All routes require authentication

import express from 'express';
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} from '../controllers/notificationController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

/**
 * GET /api/notifications
 * Get all notifications for current user
 * Protected route - requires authentication
 */
router.get('/', protect, getNotifications);

/**
 * GET /api/notifications/unread-count
 * Get unread notifications count
 * Protected route - requires authentication
 */
router.get('/unread-count', protect, getUnreadCount);

/**
 * PUT /api/notifications/:id/read
 * Mark notification as read
 * Protected route - requires authentication
 */
router.put('/:id/read', protect, markAsRead);

/**
 * PUT /api/notifications/read-all
 * Mark all notifications as read
 * Protected route - requires authentication
 */
router.put('/read-all', protect, markAllAsRead);

/**
 * DELETE /api/notifications/:id
 * Delete notification
 * Protected route - requires authentication
 */
router.delete('/:id', protect, deleteNotification);

export default router;

