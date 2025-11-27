// Forum Post Model
// Defines the ForumPost schema for the database
// Only admin and legalOfficer can create/view forum posts

import mongoose from 'mongoose';

/**
 * Forum Post Schema
 * Defines the structure of forum post documents in the database
 */
const forumPostSchema = mongoose.Schema(
  {
    // Post title
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    // Post content/body
    content: {
      type: String,
      required: [true, 'Content is required'],
      trim: true,
    },
    // Reference to User who created the post
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Author is required'],
    },
    // Post category/topic
    category: {
      type: String,
      enum: {
        values: ['case-discussions', 'legal-advice', 'procedures', 'general'],
        message: 'Category must be case-discussions, legal-advice, procedures, or general',
      },
      default: 'case-discussions',
    },
    // Optional reference to related Case
    caseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Case',
      default: null,
    },
    // Whether post is anonymous
    anonymous: {
      type: Boolean,
      default: false,
    },
  },
  {
    // Automatically add createdAt and updatedAt timestamps
    timestamps: true,
  }
);

/**
 * Index on author for faster queries when filtering by author
 */
forumPostSchema.index({ author: 1 });

/**
 * Index on category for faster queries when filtering by category
 */
forumPostSchema.index({ category: 1 });

/**
 * Index on caseId for faster queries when filtering by related case
 */
forumPostSchema.index({ caseId: 1 });

/**
 * Index on createdAt for sorting
 */
forumPostSchema.index({ createdAt: -1 });

// Create and export ForumPost model
export default mongoose.model('ForumPost', forumPostSchema);

