// Main Server File
// Entry point for the EduLegal Backend API
// Sets up Express server, connects to MongoDB Atlas, and mounts routes

import express from 'express';
import cors from 'cors';
import net from 'net';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './config/db.js';
import { ENV } from './config/env.js';
import authRoutes from './routes/auth.js';
import caseRoutes from './routes/cases.js';
import notificationRoutes from './routes/notifications.js';
import userRoutes from './routes/users.js';
import forumRoutes from './routes/forum.js';
import settingsRoutes from './routes/settings.js';
import complaintRoutes from './routes/complaints.js';
import reportRoutes from './routes/reports.js';
import adminRoutes from './routes/admin.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create Express app
const app = express();

// Middleware Configuration

// CORS middleware - allow requests from React frontend
// Simplified CORS configuration for development and production
app.use(
  cors({
    origin: ENV.FRONTEND_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Body parser middleware - parse JSON request bodies
app.use(express.json());

// Body parser middleware - parse URL-encoded request bodies
app.use(express.urlencoded({ extended: true }));

// Serve static files from uploads directory
// This allows uploaded files to be accessed via /uploads/... URLs
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes

/**
 * Health check endpoint
 * GET /api/health
 * Returns server status
 */
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'EduLegal Backend API is running',
    timestamp: new Date().toISOString(),
  });
});

/**
 * Mount authentication routes
 * All auth routes are prefixed with /api/auth
 */
app.use('/api/auth', authRoutes);

/**
 * Mount case routes
 * All case routes are prefixed with /api/cases
 */
app.use('/api/cases', caseRoutes);

/**
 * Mount notification routes
 * All notification routes are prefixed with /api/notifications
 */
app.use('/api/notifications', notificationRoutes);

/**
 * Mount user routes
 * All user routes are prefixed with /api/users
 */
app.use('/api/users', userRoutes);

/**
 * Mount forum routes
 * All forum routes are prefixed with /api/forum
 */
app.use('/api/forum', forumRoutes);

/**
 * Mount settings routes
 * All settings routes are prefixed with /api/settings
 */
app.use('/api/settings', settingsRoutes);

/**
 * Mount complaint routes
 * All complaint routes are prefixed with /api/complaints
 */
app.use('/api/complaints', complaintRoutes);

/**
 * Mount report routes
 * All report routes are prefixed with /api/reports
 */
app.use('/api/reports', reportRoutes);

/**
 * Mount admin routes
 * All admin routes are prefixed with /api/admin
 */
app.use('/api/admin', adminRoutes);

// Error Handling Middleware

/**
 * Handle 404 errors - route not found
 */
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.originalUrl}`,
  });
});

/**
 * Global error handler
 * Handles all errors thrown in routes and middleware
 */
app.use((err, req, res, next) => {
  console.error('Error:', err);

  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// Server Configuration

/**
 * Get port from environment variables or use default 5000
 * PORT is set in backend/.env file
 */
const DESIRED_PORT = ENV.PORT;

/**
 * Check if a port is available
 * @param {number} port - Port number to check
 * @returns {Promise<boolean>} - True if port is available, false otherwise
 */
const isPortAvailable = (port) => {
  return new Promise((resolve) => {
    const server = net.createServer();
    
    server.listen(port, () => {
      server.once('close', () => resolve(true));
      server.close();
    });
    
    server.on('error', () => resolve(false));
  });
};

/**
 * Find an available port starting from the desired port
 * @param {number} startPort - Starting port number
 * @param {number} maxAttempts - Maximum number of ports to try (default: 10)
 * @returns {Promise<number>} - Available port number
 */
const findAvailablePort = async (startPort, maxAttempts = 10) => {
  for (let i = 0; i < maxAttempts; i++) {
    const port = startPort + i;
    const available = await isPortAvailable(port);
    
    if (available) {
      return port;
    }
  }
  
  // If no port found in range, throw error
  throw new Error(`No available port found in range ${startPort}-${startPort + maxAttempts - 1}`);
};

/**
 * Start server function
 * Connects to database first, then starts the server
 * This ensures database connection is established before accepting requests
 * Automatically handles port conflicts by finding the next available port
 */
const startServer = async () => {
  try {
    console.log('🔄 Attempting to connect to MongoDB Atlas...');
    // Connect to MongoDB Atlas and wait for connection
    await connectDB();

    // Find an available port
    let actualPort = DESIRED_PORT;
    const portAvailable = await isPortAvailable(DESIRED_PORT);
    
    if (!portAvailable) {
      console.log(`⚠️  Port ${DESIRED_PORT} is already in use.`);
      console.log(`🔍 Searching for an available port...`);
      actualPort = await findAvailablePort(DESIRED_PORT);
      console.log(`✅ Found available port: ${actualPort}`);
    }

    // Start server only after database connection is established
    const server = app.listen(actualPort, () => {
      console.log(`\n✅ Server started successfully!`);
      if (actualPort !== DESIRED_PORT) {
        console.log(`⚠️  Note: Port ${DESIRED_PORT} was busy, using port ${actualPort} instead.`);
      }
      console.log(`🚀 Server running on port ${actualPort}`);
      console.log(`📡 Environment: ${ENV.NODE_ENV}`);
      console.log(`🔗 API Base URL: http://localhost:${actualPort}/api`);
      console.log(`\n💡 Frontend should connect to: http://localhost:${actualPort}/api\n`);
    });

    // Handle server errors
    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`\n❌ Port ${actualPort} is now in use. Please try again.\n`);
      } else {
        console.error('\n❌ Server error:', error.message);
      }
      process.exit(1);
    });
  } catch (error) {
    console.error('\n❌ Failed to start server:', error.message);
    if (error.message.includes('MongoDB')) {
      console.error('\nPlease fix the MongoDB connection issue and try again.\n');
    } else if (error.message.includes('port')) {
      console.error('\nPlease free up some ports and try again.\n');
    }
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
  // Close server and exit process
  // In production, you might want to restart the server instead
  // server.close(() => process.exit(1));
});

// Start the server
startServer();
