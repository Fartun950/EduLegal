// User Controller
// Handles user-related operations
// Admin can list all users and manage roles
// Users can view/update their own profile

import User from '../models/User.js';

/**
 * Get all users
 * GET /api/users
 * Admin only - returns all users with optional role filtering
 */
export const getUsers = async (req, res) => {
  try {
    const { role } = req.query;
    
    // Build filter object
    const filter = {};
    if (role) {
      filter.role = role;
    }
    
    // Find all users matching filter
    // Exclude password field from results
    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: users.length,
      data: {
        users,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching users',
      error: error.message,
    });
  }
};

/**
 * Get single user by ID
 * GET /api/users/:id
 * User can view their own profile, admin can view any profile
 */
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }
    
    // Check if user is viewing their own profile or is admin
    const isOwnProfile = req.user && req.user._id.toString() === req.params.id;
    const isAdmin = req.user && req.user.role === 'admin';
    
    if (!isOwnProfile && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only view your own profile.',
      });
    }
    
    res.status(200).json({
      success: true,
      data: {
        user,
      },
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error fetching user',
      error: error.message,
    });
  }
};

/**
 * Update user profile
 * PUT /api/users/:id
 * User can update their own profile, admin can update any profile
 */
export const updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }
    
    // Check if user is updating their own profile or is admin
    const isOwnProfile = req.user && req.user._id.toString() === req.params.id;
    const isAdmin = req.user && req.user.role === 'admin';
    
    if (!isOwnProfile && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only update your own profile.',
      });
    }
    
    // Extract update data (excluding password and role)
    const { name, email } = req.body;
    
    // Build update object
    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    
    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
        runValidators: true,
      }
    ).select('-password');
    
    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: {
        user: updatedUser,
      },
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'User not found',
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
    
    // Handle duplicate email error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Email already exists',
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error updating user',
      error: error.message,
    });
  }
};

/**
 * Update user role
 * PUT /api/users/:id/role
 * Admin only - can update any user's role
 */
export const updateUserRole = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }
    
    const { role } = req.body;
    
    if (!role) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a role',
      });
    }
    
    // Validate role
    const validRoles = ['admin', 'legalOfficer', 'guest'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Role must be admin, legalOfficer, or guest',
      });
    }
    
    // Update user role
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      {
        new: true,
        runValidators: true,
      }
    ).select('-password');
    
    res.status(200).json({
      success: true,
      message: 'User role updated successfully',
      data: {
        user: updatedUser,
      },
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'User not found',
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
      message: 'Error updating user role',
      error: error.message,
    });
  }
};

