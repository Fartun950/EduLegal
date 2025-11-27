// Forum Controller
// Handles forum-related operations (posts and comments)
// Only admin and legalOfficer can access forum

import ForumPost from '../models/ForumPost.js';
import ForumComment from '../models/ForumComment.js';

/**
 * Get all forum posts
 * GET /api/forum/posts
 * Returns all posts with optional filtering by category/topic
 */
export const getPosts = async (req, res) => {
  try {
    const { category, caseId } = req.query;
    
    // Build filter object
    const filter = {};
    if (category) {
      filter.category = category;
    }
    if (caseId) {
      filter.caseId = caseId;
    }
    
    // Find all posts matching filter
    // Populate author field with user information
    const posts = await ForumPost.find(filter)
      .populate('author', 'name email role')
      .populate('caseId', 'title status')
      .sort({ createdAt: -1 }); // Sort by newest first
    
    // Get comment count for each post
    const postsWithComments = await Promise.all(
      posts.map(async (post) => {
        const commentCount = await ForumComment.countDocuments({ post: post._id });
        const lastComment = await ForumComment.findOne({ post: post._id })
          .sort({ createdAt: -1 })
          .populate('author', 'name')
          .limit(1);
        
        return {
          ...post.toObject(),
          replies: commentCount,
          lastReply: lastComment ? {
            author: lastComment.author,
            createdAt: lastComment.createdAt,
          } : null,
        };
      })
    );
    
    res.status(200).json({
      success: true,
      count: postsWithComments.length,
      data: {
        posts: postsWithComments,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching forum posts',
      error: error.message,
    });
  }
};

/**
 * Get single forum post by ID with comments
 * GET /api/forum/posts/:id
 * Returns post with all its comments
 */
export const getPostById = async (req, res) => {
  try {
    const post = await ForumPost.findById(req.params.id)
      .populate('author', 'name email role')
      .populate('caseId', 'title status');
    
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      });
    }
    
    // Get all comments for this post
    const comments = await ForumComment.find({ post: post._id })
      .populate('author', 'name email role')
      .sort({ createdAt: 1 }); // Sort comments by oldest first
    
    res.status(200).json({
      success: true,
      data: {
        post: {
          ...post.toObject(),
          replies: comments,
        },
      },
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error fetching forum post',
      error: error.message,
    });
  }
};

/**
 * Create new forum post
 * POST /api/forum/posts
 * Only admin and legalOfficer can create posts
 */
export const createPost = async (req, res) => {
  try {
    const { title, content, category, caseId, anonymous } = req.body;
    
    // Validate required fields
    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title and content',
      });
    }
    
    // Create new post
    const post = await ForumPost.create({
      title,
      content,
      category: category || 'case-discussions',
      caseId: caseId || null,
      anonymous: anonymous || false,
      author: req.user._id, // Author is authenticated user (admin or legalOfficer)
    });
    
    // Populate author field
    await post.populate('author', 'name email role');
    
    res.status(201).json({
      success: true,
      message: 'Post created successfully',
      data: {
        post,
      },
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: messages,
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error creating post',
      error: error.message,
    });
  }
};

/**
 * Update forum post
 * PUT /api/forum/posts/:id
 * Only author or admin can update post
 */
export const updatePost = async (req, res) => {
  try {
    const post = await ForumPost.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      });
    }
    
    // Check if user is author or admin
    const isAuthor = post.author.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    
    if (!isAuthor && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only the author or admin can update this post.',
      });
    }
    
    // Extract update data
    const { title, content, category } = req.body;
    
    // Build update object
    const updateData = {};
    if (title) updateData.title = title;
    if (content) updateData.content = content;
    if (category) updateData.category = category;
    
    // Update post
    const updatedPost = await ForumPost.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
        runValidators: true,
      }
    ).populate('author', 'name email role');
    
    res.status(200).json({
      success: true,
      message: 'Post updated successfully',
      data: {
        post: updatedPost,
      },
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      });
    }
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: messages,
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error updating post',
      error: error.message,
    });
  }
};

/**
 * Delete forum post
 * DELETE /api/forum/posts/:id
 * Only author or admin can delete post
 */
export const deletePost = async (req, res) => {
  try {
    const post = await ForumPost.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      });
    }
    
    // Check if user is author or admin
    const isAuthor = post.author.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    
    if (!isAuthor && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only the author or admin can delete this post.',
      });
    }
    
    // Delete all comments associated with this post
    await ForumComment.deleteMany({ post: post._id });
    
    // Delete the post
    await ForumPost.findByIdAndDelete(req.params.id);
    
    res.status(200).json({
      success: true,
      message: 'Post deleted successfully',
      data: {},
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error deleting post',
      error: error.message,
    });
  }
};

/**
 * Add comment to forum post
 * POST /api/forum/posts/:id/comments
 * Only admin and legalOfficer can comment
 */
export const addComment = async (req, res) => {
  try {
    const { message, anonymous } = req.body;
    const postId = req.params.id;
    
    // Validate required fields
    if (!message) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a message',
      });
    }
    
    // Check if post exists
    const post = await ForumPost.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      });
    }
    
    // Create new comment
    const comment = await ForumComment.create({
      post: postId,
      author: req.user._id,
      message,
      anonymous: anonymous || false,
    });
    
    // Populate author field
    await comment.populate('author', 'name email role');
    
    res.status(201).json({
      success: true,
      message: 'Comment added successfully',
      data: {
        comment,
      },
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      });
    }
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: messages,
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error adding comment',
      error: error.message,
    });
  }
};

/**
 * Update forum comment
 * PUT /api/forum/posts/:postId/comments/:commentId
 * Only author or admin can update comment
 */
export const updateComment = async (req, res) => {
  try {
    const { postId, commentId } = req.params;
    const { message } = req.body;
    
    // Check if post exists
    const post = await ForumPost.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      });
    }
    
    // Find comment
    const comment = await ForumComment.findById(commentId);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found',
      });
    }
    
    // Check if comment belongs to the post
    if (comment.post.toString() !== postId) {
      return res.status(400).json({
        success: false,
        message: 'Comment does not belong to this post',
      });
    }
    
    // Check if user is author or admin
    const isAuthor = comment.author.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    
    if (!isAuthor && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only the author or admin can update this comment.',
      });
    }
    
    // Validate message
    if (!message) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a message',
      });
    }
    
    // Update comment
    comment.message = message;
    await comment.save();
    
    // Populate author field
    await comment.populate('author', 'name email role');
    
    res.status(200).json({
      success: true,
      message: 'Comment updated successfully',
      data: {
        comment,
      },
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Comment not found',
      });
    }
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: messages,
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error updating comment',
      error: error.message,
    });
  }
};

/**
 * Delete forum comment
 * DELETE /api/forum/posts/:postId/comments/:commentId
 * Only author or admin can delete comment
 */
export const deleteComment = async (req, res) => {
  try {
    const { postId, commentId } = req.params;
    
    // Check if post exists
    const post = await ForumPost.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      });
    }
    
    // Find comment
    const comment = await ForumComment.findById(commentId);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found',
      });
    }
    
    // Check if comment belongs to the post
    if (comment.post.toString() !== postId) {
      return res.status(400).json({
        success: false,
        message: 'Comment does not belong to this post',
      });
    }
    
    // Check if user is author or admin
    const isAuthor = comment.author.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    
    if (!isAuthor && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only the author or admin can delete this comment.',
      });
    }
    
    // Delete comment
    await ForumComment.findByIdAndDelete(commentId);
    
    res.status(200).json({
      success: true,
      message: 'Comment deleted successfully',
      data: {},
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Comment not found',
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error deleting comment',
      error: error.message,
    });
  }
};

