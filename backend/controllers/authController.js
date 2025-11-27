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
      console.log('Registration attempt with missing fields:', { hasName: !!name, hasEmail: !!email, hasPassword: !!password });
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

    // Normalize email to lowercase for consistency
    const normalizedEmail = email.toLowerCase().trim();
    console.log('[Atlas] Registration attempt for email:', normalizedEmail, 'with role:', userRole);

    // Check if user with email already exists (case-insensitive)
    const userExists = await User.findOne({ email: normalizedEmail });

    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists',
      });
    }

    // Create new user with selected role
    // Email is stored in lowercase for consistency
    let user;
    try {
      user = await User.create({
        name: name.trim(),
        email: normalizedEmail,
        password, // Password will be hashed by pre-save middleware in User model
        role: userRole, // Use validated role or default to 'guest'
      });
      
      // Verify user was saved to Atlas by checking if _id exists
      if (!user || !user._id) {
        console.error('[Atlas] User creation failed - user object or _id missing');
        return res.status(500).json({
          success: false,
          message: 'Failed to save user to database',
        });
      }
      
      // Verify role was stored correctly
      if (user.role !== userRole) {
        console.error('[Atlas] Role mismatch - expected:', userRole, 'got:', user.role);
        return res.status(500).json({
          success: false,
          message: 'Failed to save user role correctly',
        });
      }
      
      console.log('[Atlas] User saved successfully with ID:', user._id.toString(), 'role:', user.role);
    } catch (createError) {
      console.error('[Atlas] User creation error:', createError.message);
      
      // Handle MongoDB write errors
      if (createError.name === 'MongoServerError' || createError.name === 'MongoError') {
        if (createError.code === 11000) {
          return res.status(400).json({
            success: false,
            message: 'User with this email already exists',
          });
        }
        
        // Handle other MongoDB write errors
        return res.status(500).json({
          success: false,
          message: 'Database error during registration',
          error: process.env.NODE_ENV === 'development' ? createError.message : 'Failed to save user to database',
        });
      }
      
      // Re-throw to be caught by outer catch block
      throw createError;
    }

    // Map backend role to frontend role format
    // Backend: 'admin', 'legalOfficer', 'guest'
    // Frontend: 'admin', 'legal', 'guest'
    // Ensure role in response matches role stored in Atlas (with frontend mapping)
    const responseRole = user.role === 'legalOfficer' ? 'legal' : user.role;

    // Generate JWT token for the new user (include userId and role in token)
    let token;
    try {
      // Ensure user._id exists
      if (!user._id) {
        console.error('[Atlas] User ID is missing during registration');
        return res.status(500).json({
          success: false,
          message: 'User ID not found',
          error: 'Registration failed',
        });
      }
      
      token = generateToken(user._id, responseRole);
      
      // Verify token was generated successfully
      if (!token || token.trim() === '') {
        throw new Error('Token generation returned empty value');
      }
      
      console.log('[Atlas] Token generated successfully for user ID:', user._id.toString());
    } catch (tokenError) {
      console.error('[Atlas] Token generation error during registration:', tokenError.message);
      return res.status(500).json({
        success: false,
        message: 'Error generating authentication token',
        error: 'Registration failed',
      });
    }

    // Return success response with same structure as login
    // Role consistency: role in response is mapped from role stored in Atlas
    console.log('[Atlas] Registration successful - User ID:', user._id.toString(), 'Atlas role:', user.role, 'Response role:', responseRole);
    
    res.status(201).json({
      success: true,
      token,
      role: responseRole,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: responseRole,
      },
    });
  } catch (error) {
    // Log error for debugging
    console.error('Registration error:', error);
    console.error('Error stack:', error.stack);
    
    // Handle validation errors or other errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: messages,
      });
    }

    // Handle duplicate email error (MongoDB unique index violation)
    if (error.code === 11000 || (error.name === 'MongoServerError' && error.code === 11000)) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists',
      });
    }

    // Handle MongoDB write errors
    if (error.name === 'MongoServerError' || error.name === 'MongoError') {
      console.error('[Atlas] MongoDB write error:', error.message);
      return res.status(500).json({
        success: false,
        message: 'Database error during registration',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Failed to save user to database',
      });
    }

    // Handle other errors
    console.error('[Atlas] Registration error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error during registration',
      error: process.env.NODE_ENV === 'development' ? error.message : 'An error occurred during registration',
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
      console.log('Login attempt with missing fields:', { hasEmail: !!email, hasPassword: !!password });
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      });
    }

    // Normalize email to lowercase for case-insensitive lookup
    const normalizedEmail = email.toLowerCase().trim();
    console.log('[Atlas] Login attempt for email:', normalizedEmail);

    // Find user by email (case-insensitive) from MongoDB Atlas
    // Include password field (normally excluded) to verify it
    let user;
    try {
      user = await User.findOne({ email: normalizedEmail }).select('+password');
      
      if (user) {
        console.log('[Atlas] User found - ID:', user._id.toString(), 'Role:', user.role);
      } else {
        console.log('[Atlas] User not found for email:', normalizedEmail);
      }
    } catch (findError) {
      console.error('[Atlas] Error fetching user from database:', findError.message);
      return res.status(500).json({
        success: false,
        message: 'Database error during login',
        error: 'Failed to retrieve user from database',
      });
    }

    // Check if user exists
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Verify password using matchPassword method from User model
    // This uses bcrypt.compare to check the password
    let isPasswordMatched = false;
    try {
      // Ensure user has password field
      if (!user.password) {
        console.error('User password field is missing');
        return res.status(500).json({
          success: false,
          message: 'User password not found',
          error: 'Authentication failed',
        });
      }
      
      isPasswordMatched = await user.matchPassword(password);
    } catch (bcryptError) {
      console.error('Password comparison error:', bcryptError);
      return res.status(500).json({
        success: false,
        message: 'Error verifying password',
        error: 'Authentication failed',
      });
    }

    if (!isPasswordMatched) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Map backend role to frontend role format
    // Backend: 'admin', 'legalOfficer', 'guest'
    // Frontend: 'admin', 'legal', 'guest'
    // Ensure role in response matches role stored in Atlas
    const responseRole = user.role === 'legalOfficer' ? 'legal' : user.role;

    // Generate JWT token for authenticated user
    // Token includes userId and role
    let token;
    try {
      // Ensure user._id exists
      if (!user._id) {
        console.error('[Atlas] User ID is missing during login');
        return res.status(500).json({
          success: false,
          message: 'User ID not found',
          error: 'Authentication failed',
        });
      }
      
      token = generateToken(user._id, responseRole);
      
      // Verify token was generated successfully
      if (!token || token.trim() === '') {
        throw new Error('Token generation returned empty value');
      }
      
      console.log('[Atlas] Token generated successfully for user ID:', user._id.toString());
    } catch (tokenError) {
      console.error('[Atlas] Token generation error during login:', tokenError.message);
      return res.status(500).json({
        success: false,
        message: 'Error generating authentication token',
        error: 'Authentication failed',
      });
    }

    // Return success response with token and user info
    // Ensure role consistency: role in response matches role from Atlas
    console.log('[Atlas] Login successful - User ID:', user._id.toString(), 'Role:', user.role, 'Response role:', responseRole);
    res.status(200).json({
      success: true,
      token,
      role: responseRole,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: responseRole,
      },
    });
  } catch (error) {
    // Log error for debugging
    console.error('[Atlas] Login error:', error.message);
    
    // Handle MongoDB connection errors
    if (error.name === 'MongoServerError' || error.name === 'MongoError' || error.name === 'MongooseError') {
      console.error('[Atlas] MongoDB error during login:', error.message);
      return res.status(500).json({
        success: false,
        message: 'Database error during login',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Failed to connect to database',
      });
    }
    
    // Handle other errors
    res.status(500).json({
      success: false,
      message: 'Server error during login',
      error: process.env.NODE_ENV === 'development' ? error.message : 'An error occurred during login',
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
