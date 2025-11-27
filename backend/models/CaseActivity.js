// Case Activity Model
// Defines the CaseActivity schema for the database
// Tracks all activities/events related to cases for timeline/audit trail

import mongoose from 'mongoose';

/**
 * Case Activity Schema
 * Defines the structure of case activity documents in the database
 */
const caseActivitySchema = mongoose.Schema(
  {
    // Reference to Case this activity belongs to
    case: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Case',
      required: [true, 'Case reference is required'],
    },
    // Reference to User who performed the action (null for guest actions)
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null, // Can be null for guest submissions
    },
    // Action type
    action: {
      type: String,
      enum: {
        values: [
          'created',
          'assigned',
          'status_changed',
          'priority_changed',
          'note_added',
          'document_uploaded',
          'document_deleted',
          'updated',
          'deleted',
        ],
        message: 'Invalid action type',
      },
      required: [true, 'Action is required'],
    },
    // Action details/description
    details: {
      type: String,
      required: [true, 'Details are required'],
    },
    // Additional metadata (JSON object)
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    // Automatically add createdAt and updatedAt timestamps
    timestamps: true,
  }
);

/**
 * Index on case for faster queries when filtering by case
 */
caseActivitySchema.index({ case: 1 });

/**
 * Index on createdAt for sorting timeline
 */
caseActivitySchema.index({ createdAt: -1 });

/**
 * Compound index on case and createdAt for efficient timeline queries
 */
caseActivitySchema.index({ case: 1, createdAt: -1 });

// Create and export CaseActivity model
export default mongoose.model('CaseActivity', caseActivitySchema);

