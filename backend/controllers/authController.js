// Authentication Controller
// Handles user registration and login
// All new users default to 'guest' role (includes both students and staff)

import User from '../models/User.js';
import { generateToken } from '../middleware/auth.js';

/**
 * Register a new user
 * POST /api/auth/register
 * All users default to 'guest' role
 * Admin and legalOfficer roles must be set by system/admin
 */
export const register = async (req, res) => {
  try {
    // Extract registration data from request body
    const { name, email, password, role } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and password',
      });
    }

    // Validate and sanitize role
    const validRoles = ['admin', 'legalOfficer', 'guest'];
    // If role is provided and valid, use it; otherwise default to 'guest'
    // For security: you can restrict admin role here if needed
    // Option: const allowedRoles = ['guest', 'legalOfficer']; // Exclude admin
    const userRole = role && validRoles.includes(role) ? role : 'guest';

    // Check if user with email already exists
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists',
      });
    }

    // Create new user with selected role
    const user = await User.create({
      name,
      email,
      password, // Password will be hashed by pre-save middleware in User model
      role: userRole, // Use validated role or default to 'guest'
    });

    // Map backend role to frontend role format
    // Backend: 'admin', 'legalOfficer', 'guest'
    // Frontend: 'admin', 'legal', 'guest'
    let frontendRole = user.role;
    if (user.role === 'legalOfficer') {
      frontendRole = 'legal';
    }

    // Generate JWT token for the new user (include role in token)
    const token = generateToken(user._id, frontendRole);

    // Return success response with same structure as login
    res.status(201).json({
      success: true,
      token,
      role: frontendRole,
    });
  } catch (error) {
    // Handle validation errors or other errors
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
        message: 'User with this email already exists',
      });
    }

    // Handle other errors
    res.status(500).json({
      success: false,
      message: 'Server error during registration',
      error: error.message,
    });
  }
};

/**
 * Login user
 * POST /api/auth/login
 * Authenticates user with email and password
 * Returns JWT token for authenticated requests
 */
export const login = async (req, res) => {
  try {
    // Extract login credentials from request body
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      });
    }

    // Find user by email
    // Include password field (normally excluded) to verify it
    const user = await User.findOne({ email }).select('+password');

    // Check if user exists
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Verify password using matchPassword method from User model
    const isPasswordMatched = await user.matchPassword(password);

    if (!isPasswordMatched) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Map backend role to frontend role format
    // Backend: 'admin', 'legalOfficer', 'guest'
    // Frontend: 'admin', 'legal', 'guest'
    let frontendRole = user.role;
    if (user.role === 'legalOfficer') {
      frontendRole = 'legal';
    }

    // Generate JWT token for authenticated user (include role in token)
    const token = generateToken(user._id, frontendRole);

    // Return success response with exact structure required
    res.status(200).json({
      success: true,
      token,
      role: frontendRole,
    });
  } catch (error) {
    // Handle errors
    res.status(500).json({
      success: false,
      message: 'Server error during login',
      error: error.message,
    });
  }
};

/**
 * Get current user profile
 * GET /api/auth/me
 * Returns information about the currently authenticated user
 * Requires authentication (protected route)
 */
export const getMe = async (req, res) => {
  try {
    // User is already attached to request by protect middleware
    // req.user contains the authenticated user object (without password)
    const user = req.user;

    // Return user information
    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};
