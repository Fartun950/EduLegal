// Forum Comment Model
// Defines the ForumComment schema for the database
// Comments are replies to forum posts

import mongoose from 'mongoose';

/**
 * Forum Comment Schema
 * Defines the structure of forum comment documents in the database
 */
const forumCommentSchema = mongoose.Schema(
  {
    // Reference to ForumPost this comment belongs to
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ForumPost',
      required: [true, 'Post reference is required'],
    },
    // Reference to User who created the comment
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Author is required'],
    },
    // Comment message/content
    message: {
      type: String,
      required: [true, 'Message is required'],
      trim: true,
    },
    // Whether comment is anonymous
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
 * Index on post for faster queries when filtering by post
 */
forumCommentSchema.index({ post: 1 });

/**
 * Index on author for faster queries when filtering by author
 */
forumCommentSchema.index({ author: 1 });

/**
 * Index on createdAt for sorting
 */
forumCommentSchema.index({ createdAt: 1 });

// Create and export ForumComment model
export default mongoose.model('ForumComment', forumCommentSchema);

