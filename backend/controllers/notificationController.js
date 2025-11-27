// Notification Controller
// Handles notification-related operations
// All routes require authentication

import Notification from '../models/Notification.js';

/**
 * Get all notifications for current user
 * GET /api/notifications
 * Returns all notifications for the authenticated user
 */
export const getNotifications = async (req, res) => {
  try {
    // Get all notifications for the authenticated user
    // Sort by newest first
    const notifications = await Notification.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(100); // Limit to most recent 100 notifications
    
    res.status(200).json({
      success: true,
      count: notifications.length,
      data: {
        notifications,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching notifications',
      error: error.message,
    });
  }
};

/**
 * Get unread notifications count
 * GET /api/notifications/unread-count
 * Returns count of unread notifications for authenticated user
 */
export const getUnreadCount = async (req, res) => {
  try {
    // Count unread notifications for the authenticated user
    const unreadCount = await Notification.countDocuments({
      user: req.user._id,
      read: false,
    });
    
    res.status(200).json({
      success: true,
      data: {
        unreadCount,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching unread count',
      error: error.message,
    });
  }
};

/**
 * Mark notification as read
 * PUT /api/notifications/:id/read
 * Marks a specific notification as read
 * User can only mark their own notifications as read
 */
export const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find notification and verify it belongs to the user
    const notification = await Notification.findOne({
      _id: id,
      user: req.user._id,
    });
    
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found or access denied',
      });
    }
    
    // Mark as read
    notification.read = true;
    await notification.save();
    
    res.status(200).json({
      success: true,
      message: 'Notification marked as read',
      data: {
        notification,
      },
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Notification not found',
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error marking notification as read',
      error: error.message,
    });
  }
};

/**
 * Mark all notifications as read
 * PUT /api/notifications/read-all
 * Marks all notifications as read for authenticated user
 */
export const markAllAsRead = async (req, res) => {
  try {
    // Mark all unread notifications for the user as read
    const result = await Notification.updateMany(
      {
        user: req.user._id,
        read: false,
      },
      {
        $set: { read: true },
      }
    );
    
    res.status(200).json({
      success: true,
      message: 'All notifications marked as read',
      data: {
        updatedCount: result.modifiedCount,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error marking all notifications as read',
      error: error.message,
    });
  }
};

/**
 * Delete notification
 * DELETE /api/notifications/:id
 * Deletes a specific notification
 * User can only delete their own notifications
 */
export const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find notification and verify it belongs to the user
    const notification = await Notification.findOne({
      _id: id,
      user: req.user._id,
    });
    
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found or access denied',
      });
    }
    
    // Delete notification
    await Notification.findByIdAndDelete(id);
    
    res.status(200).json({
      success: true,
      message: 'Notification deleted successfully',
      data: {},
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Notification not found',
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error deleting notification',
      error: error.message,
    });
  }
};

