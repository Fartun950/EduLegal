// Forum Routes
// Defines routes for forum-related operations (posts and comments)
// All routes require authentication and admin/legalOfficer role

import express from 'express';
import {
  getPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
  addComment,
  updateComment,
  deleteComment,
} from '../controllers/forumController.js';
import { protect } from '../middleware/auth.js';
import { requireAdminOrOfficer } from '../middleware/roles.js';

const router = express.Router();

/**
 * GET /api/forum/posts
 * Get all forum posts with optional filtering
 * Protected route - requires admin or legalOfficer role
 */
router.get('/posts', protect, requireAdminOrOfficer, getPosts);

/**
 * GET /api/forum/posts/:id
 * Get single post with comments
 * Protected route - requires admin or legalOfficer role
 */
router.get('/posts/:id', protect, requireAdminOrOfficer, getPostById);

/**
 * POST /api/forum/posts
 * Create new forum post
 * Protected route - requires admin or legalOfficer role
 */
router.post('/posts', protect, requireAdminOrOfficer, createPost);

/**
 * PUT /api/forum/posts/:id
 * Update forum post
 * Protected route - requires admin or legalOfficer role
 * Author or admin can update
 */
router.put('/posts/:id', protect, requireAdminOrOfficer, updatePost);

/**
 * DELETE /api/forum/posts/:id
 * Delete forum post
 * Protected route - requires admin or legalOfficer role
 * Author or admin can delete
 */
router.delete('/posts/:id', protect, requireAdminOrOfficer, deletePost);

/**
 * POST /api/forum/posts/:id/comments
 * Add comment to forum post
 * Protected route - requires admin or legalOfficer role
 */
router.post('/posts/:id/comments', protect, requireAdminOrOfficer, addComment);

/**
 * PUT /api/forum/posts/:postId/comments/:commentId
 * Update forum comment
 * Protected route - requires admin or legalOfficer role
 * Author or admin can update
 */
router.put('/posts/:postId/comments/:commentId', protect, requireAdminOrOfficer, updateComment);

/**
 * DELETE /api/forum/posts/:postId/comments/:commentId
 * Delete forum comment
 * Protected route - requires admin or legalOfficer role
 * Author or admin can delete
 */
router.delete('/posts/:postId/comments/:commentId', protect, requireAdminOrOfficer, deleteComment);

export default router;

