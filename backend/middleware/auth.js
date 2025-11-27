// Authentication Middleware
// Verifies JWT tokens and attaches user information to request object
// Used to protect routes that require authentication

import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { ENV } from '../config/env.js';

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
      // Get JWT_SECRET from ENV config (which loads from environment variables)
      const jwtSecret = ENV.JWT_SECRET || process.env.JWT_SECRET;
      
      if (!jwtSecret || jwtSecret.trim() === '') {
        console.error('JWT_SECRET is not configured in environment variables');
        return res.status(500).json({
          success: false,
          message: 'Server configuration error. JWT_SECRET is missing.',
        });
      }

      // Verify token using JWT_SECRET
      const decoded = jwt.verify(token, jwtSecret);

      // Verify token contains user ID (support both userId and id for backward compatibility)
      const userId = decoded.userId || decoded.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Invalid token format. User ID missing.',
        });
      }

      // Find user by ID from decoded token
      // Exclude password field from returned user object
      const user = await User.findById(userId).select('-password');

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
      // Log error for debugging
      if (error.name === 'JsonWebTokenError') {
        console.error('JWT Error: Invalid token', error.message);
        return res.status(401).json({
          success: false,
          message: 'Not authorized to access this route. Invalid token.',
        });
      }
      
      if (error.name === 'TokenExpiredError') {
        console.error('JWT Error: Token expired', error.message);
        return res.status(401).json({
          success: false,
          message: 'Token has expired. Please login again.',
        });
      }
      
      // If token is invalid or expired, return 401
      console.error('Authentication error:', error);
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
 * @param {String} role - User role (optional) to include in token payload
 * @returns {String} JWT token
 */
export const generateToken = (userId, role = null) => {
  // Get JWT_SECRET from ENV config (which loads from environment variables)
  const jwtSecret = ENV.JWT_SECRET || process.env.JWT_SECRET;
  
  if (!jwtSecret || jwtSecret.trim() === '') {
    console.error('JWT_SECRET is not configured in environment variables');
    throw new Error('JWT_SECRET is not configured in environment variables');
  }

  // Ensure userId is a string (handles both ObjectId and string)
  let userIdString;
  if (!userId) {
    throw new Error('User ID is required to generate token');
  }
  
  // Convert ObjectId to string if it has toString method, otherwise use as is
  if (typeof userId === 'object' && userId.toString) {
    userIdString = userId.toString();
  } else if (typeof userId === 'string') {
    userIdString = userId;
  } else {
    // Fallback: convert to string using String()
    userIdString = String(userId);
  }
  
  if (!userIdString || userIdString.trim() === '') {
    throw new Error('User ID is required to generate token');
  }

  // Build payload with user ID (required) and role (optional)
  const payload = { userId: userIdString };
  if (role) {
    payload.role = role;
  }

  // Generate and return JWT token
  try {
    const token = jwt.sign(payload, jwtSecret, {
      expiresIn: '24h', // Token expires in 24 hours
    });
    
    // Verify token was generated (basic check)
    if (!token || token.trim() === '') {
      throw new Error('Token generation returned empty value');
    }
    
    return token;
  } catch (error) {
    console.error('Error generating JWT token:', error);
    if (error.message) {
      throw new Error(`Failed to generate authentication token: ${error.message}`);
    }
    throw new Error('Failed to generate authentication token');
  }
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
        // Get JWT_SECRET from ENV config (which loads from environment variables)
        const jwtSecret = ENV.JWT_SECRET || process.env.JWT_SECRET;
        
        if (!jwtSecret || jwtSecret.trim() === '') {
          // If JWT_SECRET is missing, skip authentication but continue
          console.warn('JWT_SECRET not configured, skipping optional authentication');
          return next();
        }

        // Verify token using JWT_SECRET
        const decoded = jwt.verify(token, jwtSecret);

        // Verify token contains user ID (support both userId and id for backward compatibility)
        const userId = decoded.userId || decoded.id;
        if (userId) {
          // Find user by ID from decoded token
          const user = await User.findById(userId).select('-password');

          // If user found, attach to request
          if (user) {
            req.user = user;
          }
        }
      } catch (error) {
        // Token invalid or expired, but don't fail - just continue without user
        // This allows guest access
        // Silently ignore auth errors in optional auth
      }
    }

    // Continue to next middleware regardless of auth status
    next();
  } catch (error) {
    // Continue even if there's an error - allow guest access
    next();
  }
};



