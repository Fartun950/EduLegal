// Script to update a user's role in the database
// Usage: node scripts/updateUserRole.js <email> <role>
// Roles: admin, legalOfficer, guest

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '../.env') });

const updateUserRole = async () => {
  try {
    // Get email and role from command line arguments
    const email = process.argv[2];
    const role = process.argv[3];

    if (!email || !role) {
      console.error('Usage: node scripts/updateUserRole.js <email> <role>');
      console.error('Roles: admin, legalOfficer, guest');
      process.exit(1);
    }

    if (!['admin', 'legalOfficer', 'guest'].includes(role)) {
      console.error('Invalid role. Must be: admin, legalOfficer, or guest');
      process.exit(1);
    }

    // Connect to MongoDB
    const mongoURI = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/edulegal';
    await mongoose.connect(mongoURI);
    console.log('Connected to MongoDB');

    // Find and update user
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      console.error(`User with email ${email} not found`);
      await mongoose.disconnect();
      process.exit(1);
    }

    // Update role
    user.role = role;
    await user.save();

    console.log(`✅ Successfully updated user ${email} to role: ${role}`);
    console.log(`   You can now login with this account to test ${role} dashboard access.`);

    // Disconnect from MongoDB
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Error updating user role:', error);
    process.exit(1);
  }
};

updateUserRole();

