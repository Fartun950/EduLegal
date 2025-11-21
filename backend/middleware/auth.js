// Authentication Middleware
// Verifies JWT tokens and attaches user information to request object
// Used to protect routes that require authentication

import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * Middleware to verify JWT token and authenticate user
 * Attaches user object to request (req.user) if token is valid
 */
export const protect = async (req, res, next) => {
  try {
    let token;

    // Check if Authorization header exists and starts with 'Bearer'
    // Format: Authorization: Bearer <token>
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      // Extract token from Authorization header
      // Split by space and get second part (the token)
      token = req.headers.authorization.split(' ')[1];
    }

    // If no token found, return 401 Unauthorized
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route. Please login.',
      });
    }

    try {
      // Verify token using JWT_SECRET from environment variables
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Find user by ID from decoded token
      // Exclude password field from returned user object
      const user = await User.findById(decoded.id).select('-password');

      // If user not found, return 401
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'User not found with this token',
        });
      }

      // Attach user object to request for use in next middleware/controller
      req.user = user;
      next();
    } catch (error) {
      // If token is invalid or expired, return 401
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route. Invalid token.',
      });
    }
  } catch (error) {
    // Catch any other errors
    return res.status(500).json({
      success: false,
      message: 'Server error during authentication',
      error: error.message,
    });
  }
};

/**
 * Generate JWT token for a user
 * Token expires in 24 hours (configurable)
 * 
 * @param {String} userId - User ID to include in token
 * @returns {String} JWT token
 */
export const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: '24h', // Token expires in 24 hours
  });
};

/**
 * Optional authentication middleware
 * Tries to authenticate user if token is present, but doesn't fail if token is missing
 * Used for routes that work for both authenticated and guest users
 */
export const optionalAuth = async (req, res, next) => {
  try {
    let token;

    // Check if Authorization header exists and starts with 'Bearer'
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      // Extract token from Authorization header
      token = req.headers.authorization.split(' ')[1];
    }

    // If token found, try to verify and attach user
    if (token) {
      try {
        // Verify token using JWT_SECRET from environment variables
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Find user by ID from decoded token
        const user = await User.findById(decoded.id).select('-password');

        // If user found, attach to request
        if (user) {
          req.user = user;
        }
      } catch (error) {
        // Token invalid or expired, but don't fail - just continue without user
        // This allows guest access
      }
    }

    // Continue to next middleware regardless of auth status
    next();
  } catch (error) {
    // Continue even if there's an error - allow guest access
    next();
  }
};



