// Resource Model
// Defines the Resource schema for the database
// Stores legal resources, documentation, and support materials

import mongoose from 'mongoose';

/**
 * Resource Schema
 * Defines the structure of resource documents in the database
 */
const resourceSchema = mongoose.Schema(
  {
    // Resource title
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    // Resource description
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    // Resource category
    category: {
      type: String,
      enum: {
        values: [
          'legalRights',
          'complaintProcess',
          'supportServices',
          'documentation',
          'faq',
          'other',
        ],
        message: 'Invalid category',
      },
      default: 'other',
    },
    // Resource URL (if external link)
    url: {
      type: String,
      trim: true,
      default: null,
    },
    // Resource type
    type: {
      type: String,
      enum: {
        values: ['document', 'link', 'guide', 'video', 'other'],
        message: 'Invalid resource type',
      },
      default: 'document',
    },
  },
  {
    // Automatically add createdAt and updatedAt timestamps
    timestamps: true,
  }
);

/**
 * Index on category for faster queries when filtering by category
 */
resourceSchema.index({ category: 1 });

/**
 * Index on type for faster queries when filtering by type
 */
resourceSchema.index({ type: 1 });

/**
 * Index on createdAt for sorting
 */
resourceSchema.index({ createdAt: -1 });

// Create and export Resource model
export default mongoose.model('Resource', resourceSchema);



