// Notification Model
// Defines the Notification schema for the database
// Notifications are sent to users for various events (case assigned, status changed, etc.)

import mongoose from 'mongoose';

/**
 * Notification Schema
 * Defines the structure of notification documents in the database
 */
const notificationSchema = mongoose.Schema(
  {
    // Reference to User who receives the notification
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
    },
    // Notification type
    type: {
      type: String,
      enum: {
        values: ['info', 'warning', 'success', 'error'],
        message: 'Type must be info, warning, success, or error',
      },
      default: 'info',
    },
    // Notification title
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    // Notification message
    message: {
      type: String,
      required: [true, 'Message is required'],
      trim: true,
    },
    // Read status
    read: {
      type: Boolean,
      default: false,
    },
    // Type of related entity (case, forum, user, etc.)
    relatedEntityType: {
      type: String,
      enum: {
        values: ['case', 'forum', 'user', 'system'],
        message: 'Related entity type must be case, forum, user, or system',
      },
      default: 'system',
    },
    // ID of related entity (e.g., case ID, forum post ID)
    relatedEntityId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
  },
  {
    // Automatically add createdAt and updatedAt timestamps
    timestamps: true,
  }
);

/**
 * Index on user for faster queries when filtering by user
 */
notificationSchema.index({ user: 1 });

/**
 * Index on read status for faster queries when filtering unread notifications
 */
notificationSchema.index({ read: 1 });

/**
 * Compound index on user and read for efficient queries
 */
notificationSchema.index({ user: 1, read: 1 });

/**
 * Index on createdAt for sorting
 */
notificationSchema.index({ createdAt: -1 });

// Create and export Notification model
export default mongoose.model('Notification', notificationSchema);

