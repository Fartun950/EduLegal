// Complaint Model
// Defines the Complaint schema for the database
// Separate from Case model - handles public complaint submissions
// Supports Student, Staff, and Anonymous reporter types

import mongoose from 'mongoose';

/**
 * Complaint Schema
 * Defines the structure of complaint documents in the database
 */
const complaintSchema = mongoose.Schema(
  {
    // Reporter type: Student, Staff, or Anonymous
    reporterType: {
      type: String,
      enum: {
        values: ['student', 'staff', 'anonymous'],
        message: 'Reporter type must be student, staff, or anonymous',
      },
      required: [true, 'Reporter type is required'],
    },
    // Reporter name (required for student/staff, not stored for anonymous)
    reporterName: {
      type: String,
      trim: true,
      default: null,
    },
    // Reporter email (optional for student/staff, not stored for anonymous)
    reporterEmail: {
      type: String,
      trim: true,
      lowercase: true,
      default: null,
    },
    // Complaint title
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    // Complaint description/details
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    // Complaint category
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: {
        values: [
          'harassment',
          'academicIssue',
          'bullying',
          'discrimination',
          'gradeAppeal',
          'other',
          'staffScenario',
          'workplaceHarassment',
          'sexualHarassment',
          'staffMisconduct',
          'staffConflict',
          'discriminationStaff',
          'breachConfidentiality',
          'fraudCorruption',
          'abuseOfPower',
          'unfairWorkload',
          'workplaceSafety',
          'legal',
        ],
        message: 'Invalid category',
      },
    },
    // Complaint status
    status: {
      type: String,
      enum: {
        values: ['open', 'inProgress', 'closed'],
        message: 'Status must be open, inProgress, or closed',
      },
      default: 'open',
    },
    // Priority level
    priority: {
      type: String,
      enum: {
        values: ['low', 'medium', 'high', 'urgent'],
        message: 'Priority must be low, medium, high, or urgent',
      },
      default: 'medium',
    },
    // Reference to Legal Officer assigned to the complaint (optional)
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    // File attachments array - stores file paths/URLs
    attachments: {
      type: [String],
      default: [],
    },
  },
  {
    // Automatically add createdAt and updatedAt timestamps
    timestamps: true,
  }
);

/**
 * Index on reporterType for faster queries when filtering by reporter type
 */
complaintSchema.index({ reporterType: 1 });

/**
 * Index on status for faster queries when filtering by status
 */
complaintSchema.index({ status: 1 });

/**
 * Index on category for faster queries when filtering by category
 */
complaintSchema.index({ category: 1 });

/**
 * Index on assignedTo for faster queries when filtering by assigned officer
 */
complaintSchema.index({ assignedTo: 1 });

/**
 * Index on priority for faster queries when filtering by priority
 */
complaintSchema.index({ priority: 1 });

/**
 * Index on createdAt for sorting
 */
complaintSchema.index({ createdAt: -1 });

// Create and export Complaint model
export default mongoose.model('Complaint', complaintSchema);

