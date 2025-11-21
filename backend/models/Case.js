// Case Model
// Defines the Case schema for the database
// Cases can be created by any authenticated user (guest, admin, legalOfficer)
// Only admin and legalOfficer can view, edit, update, or delete cases

import mongoose from 'mongoose';

/**
 * Case Schema
 * Defines the structure of case documents in the database
 */
const caseSchema = mongoose.Schema(
  {
    // Case title
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    // Case description/details
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    // Case category
    // Includes both regular categories (harassment, academicIssue, etc.)
    // and staff-related categories (workplaceHarassment, sexualHarassment, etc.)
    // Guest users (including staff) can submit cases with any category
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: {
        values: [
          // Regular categories
          'harassment',
          'academicIssue',
          'bullying',
          'discrimination',
          'gradeAppeal',
          'other',
          // Staff-related categories (guest users including staff can use these)
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
          // Legal category
          'legal',
        ],
        message: 'Invalid category',
      },
    },
    // Case status
    status: {
      type: String,
      enum: {
        values: ['open', 'inProgress', 'closed'],
        message: 'Status must be open, inProgress, or closed',
      },
      default: 'open',
    },
    // Reference to User who created the case
    // All authenticated users (guest, admin, legalOfficer) can create cases
    // Can be null for anonymous/guest submissions (public cases)
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false, // Changed to false to allow anonymous guest submissions
      default: null,
    },
    // Reference to Legal Officer assigned to the case (optional)
    // Only admin can assign officers
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    // Priority level (optional field)
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    // Submission role context (guest/admin/legalOfficer)
    role: {
      type: String,
      enum: ['guest', 'admin', 'legalOfficer'],
      default: 'guest',
    },
    // Optional name provided by guest or user at submission time
    name: {
      type: String,
      trim: true,
      default: null,
    },
    // Optional gender provided by guest or user at submission time
    gender: {
      type: String,
      trim: true,
      default: null,
    },
  },
  {
    // Automatically add createdAt and updatedAt timestamps
    timestamps: true,
  }
);

/**
 * Index on createdBy for faster queries when filtering by creator
 */
caseSchema.index({ createdBy: 1 });

/**
 * Index on status for faster queries when filtering by status
 */
caseSchema.index({ status: 1 });

/**
 * Index on category for faster queries when filtering by category
 */
caseSchema.index({ category: 1 });

/**
 * Index on assignedTo for faster queries when filtering by assigned officer
 */
caseSchema.index({ assignedTo: 1 });

// Create and export Case model
export default mongoose.model('Case', caseSchema);

