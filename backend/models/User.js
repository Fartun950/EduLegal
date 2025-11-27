// User Model
// Defines the User schema for the database
// Users can have roles: admin, legalOfficer, or guest (default)
// Guest role includes both students and staff

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

/**
 * User Schema
 * Defines the structure of user documents in the database
 */
const userSchema = mongoose.Schema(
  {
    // User's full name
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    // User's email address (must be unique)
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please enter a valid email address',
      ],
    },
    // User's password (will be hashed before saving)
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // Don't return password by default in queries
    },
    // User's role: admin, legalOfficer, or guest (default)
    // Guest role includes both students and staff users
    role: {
      type: String,
      enum: {
        values: ['admin', 'legalOfficer', 'guest'],
        message: 'Role must be admin, legalOfficer, or guest',
      },
      default: 'guest',
    },
    // User preferences (theme, notifications, etc.)
    preferences: {
      type: mongoose.Schema.Types.Mixed,
      default: {
        theme: 'light', // 'light' or 'dark'
      },
    },
  },
  {
    // Automatically add createdAt and updatedAt timestamps
    timestamps: true,
  }
);

/**
 * Index on email for faster lookups
 */
userSchema.index({ email: 1 });

/**
 * Pre-save middleware to hash password before saving
 * Only hashes password if it has been modified
 */
userSchema.pre('save', async function (next) {
  // If password hasn't been modified, skip hashing
  if (!this.isModified('password')) {
    return next();
  }

  try {
    // Hash password with bcrypt (10 rounds)
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

/**
 * Instance method to compare password with hashed password
 * Used during login to verify user credentials
 */
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Create and export User model
export default mongoose.model('User', userSchema);

