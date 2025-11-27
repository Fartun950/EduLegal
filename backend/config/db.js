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
    console.log(`   Connecting to: ${mongoURI.replace(/:[^:@]+@/, ':****@')}`); // Hide password in logs
    console.log(`   Database name: ${dbName}`);
    console.log(`   Timeout: 30 seconds...`);
    
    // Connect to MongoDB Atlas with proper configuration
    const conn = await mongoose.connect(mongoURI, {
      // Mongoose connection options
      useNewUrlParser: true,
      useUnifiedTopology: true,
      dbName,
      // Connection options for MongoDB Atlas
      serverSelectionTimeoutMS: 30000, // Timeout after 30 seconds (increased)
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      connectTimeoutMS: 30000, // Connection timeout (increased)
      maxPoolSize: 10, // Maintain up to 10 socket connections
      retryWrites: true,
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
    console.error('Error name:', error.name);
    console.error('Error code:', error.code);
    console.error('\n🔍 Error Details:');
    
    // Provide specific error guidance based on error type
    if (error.message.includes('timeout') || error.message.includes('TIMEOUT')) {
      console.error('   ⚠️  Connection timeout detected!');
      console.error('   → Check if MongoDB Atlas cluster is running (not paused)');
      console.error('   → Verify your IP is whitelisted in Network Access');
      console.error('   → Check your internet connection');
    } else if (error.message.includes('authentication') || error.message.includes('Authentication failed')) {
      console.error('   ⚠️  Authentication failed!');
      console.error('   → Check username and password in MONGO_URI');
      console.error('   → Verify database user exists in MongoDB Atlas');
    } else if (error.message.includes('DNS') || error.message.includes('ENOTFOUND')) {
      console.error('   ⚠️  DNS resolution failed!');
      console.error('   → Check internet connection');
      console.error('   → Verify cluster URL is correct');
    } else if (error.message.includes('network') || error.message.includes('Network')) {
      console.error('   ⚠️  Network error!');
      console.error('   → Check IP whitelist in MongoDB Atlas');
      console.error('   → Verify firewall/antivirus settings');
    }
    
    console.error('\n📋 Troubleshooting Steps:');
    console.error('1. ✅ Check if MongoDB Atlas cluster is running (not paused)');
    console.error('   → Log into MongoDB Atlas → Clusters → Resume cluster if paused');
    console.error('\n2. ✅ Verify IP whitelist in Network Access');
    console.error('   → MongoDB Atlas → Network Access → Add IP Address');
    console.error('   → For development: Add 0.0.0.0/0 (allows all IPs)');
    console.error('   → Or add your current IP: Check your IP at https://whatismyipaddress.com');
    console.error('\n3. ✅ Verify MONGO_URI format in backend/.env:');
    console.error('   mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority');
    console.error('   → Username and password should match your database user');
    console.error('   → Cluster name should match your actual cluster');
    console.error('\n4. ✅ Test your connection string:');
    console.error('   → Try connecting via MongoDB Compass with the same connection string');
    console.error('   → Or use: mongosh "<your-connection-string>"');
    console.error('\n5. ✅ Check firewall/antivirus settings');
    console.error('   → Temporarily disable to test if it\'s blocking the connection');
    console.error('\n⚠️  Server will not start without database connection.\n');
    process.exit(1);
  }
};

export default connectDB;




