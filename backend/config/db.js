// MongoDB Atlas Database Configuration
// This file handles the connection to MongoDB Atlas database

import mongoose from 'mongoose';
import { ENV, loadedEnvPath } from './env.js';

/**
 * Connect to MongoDB Atlas database
 * Uses connection string from environment variables
 * Handles connection errors and auto-reconnection
 */
const connectDB = async () => {
  try {
    // Get MongoDB connection string and database name from environment variables
    // Check both MONGO_URI and MONGODB_URI for backward compatibility
    const mongoURI = ENV.MONGO_URI;
    const dbName = ENV.DB_NAME;

    // Connect to MongoDB Atlas with proper configuration
    const conn = await mongoose.connect(mongoURI, {
      // Mongoose connection options
      useNewUrlParser: true,
      useUnifiedTopology: true,
      dbName,
      // Connection options for MongoDB Atlas
      serverSelectionTimeoutMS: 10000, // Timeout after 10 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      connectTimeoutMS: 10000, // Connection timeout
    });

    // Log successful connection
    const connectedHost = conn.connection.host;
    const connectedDB = conn.connection.name;
    console.log(`✅ MongoDB Atlas Connected Successfully!`);
    console.log(`   Host: ${connectedHost}`);
    console.log(`   Database: ${connectedDB}`);
    if (loadedEnvPath) {
      console.log(`   Env file: ${loadedEnvPath}`);
    }

    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err.message);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('⚠️  MongoDB disconnected. Attempting to reconnect...');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('✅ MongoDB reconnected successfully');
    });

  } catch (error) {
    // Log connection error with helpful troubleshooting info
    console.error('\n❌ Error connecting to MongoDB Atlas:', error.message);
    console.error('\n📋 Troubleshooting Steps:');
    console.error('1. Check your internet connection');
    console.error('2. Verify MongoDB Atlas cluster is running (not paused)');
    console.error('3. Check IP whitelist in MongoDB Atlas Network Access');
    console.error('   - Go to MongoDB Atlas → Network Access → Add IP Address');
    console.error('   - Add 0.0.0.0/0 for all IPs (development only) or your current IP');
    console.error('4. Verify MONGO_URI in .env file has correct format:');
    console.error('   mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority');
    console.error('5. Check if firewall/antivirus is blocking the connection');
    console.error('\n⚠️  Server will not start without database connection.\n');
    process.exit(1);
  }
};

export default connectDB;




