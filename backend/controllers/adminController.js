// Admin Controller
// Handles admin-only operations
// Only admin role can access these routes

import User from '../models/User.js';

/**
 * Create new Legal Officer
 * POST /api/admin/user
 * Admin only - creates a new Legal Officer user
 */
export const createLegalOfficer = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and password',
      });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters',
      });
    }

    // Check if user with email already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists',
      });
    }

    // Create new Legal Officer user
    // Password will be automatically hashed by User model pre-save middleware
    const legalOfficer = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password, // Will be hashed by pre-save middleware
      role: 'legalOfficer',
    });

    // Return user without password
    const userResponse = await User.findById(legalOfficer._id).select('-password');

    res.status(201).json({
      success: true,
      message: 'Legal Officer created successfully',
      data: {
        user: userResponse,
      },
    });
  } catch (error) {
    // Handle validation errors
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
      message: 'Error creating Legal Officer',
      error: error.message,
    });
  }
};



