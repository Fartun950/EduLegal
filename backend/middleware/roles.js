// Role-Based Access Control Middleware
// Restricts access to routes based on user roles
// Only admin and legalOfficer can view, edit, update, or delete cases
// Guest users can only create cases (handled in routes)

/**
 * Middleware to restrict access to admin and legalOfficer only
 * Blocks guest users from accessing protected routes
 * Used for routes that require viewing/editing case management features
 */
export const requireAdminOrOfficer = (req, res, next) => {
  // Check if user is authenticated (req.user should be set by auth middleware)
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized. Please login first.',
    });
  }

  // Check if user role is admin or legalOfficer
  if (req.user.role !== 'admin' && req.user.role !== 'legalOfficer') {
    // Guest users are not allowed to access this route
    return res.status(403).json({
      success: false,
      message: 'Access denied. Only Admin and Legal Officer can access this resource.',
    });
  }

  // User is admin or legalOfficer, proceed to next middleware/controller
  next();
};

/**
 * Middleware to restrict access to admin only
 * Blocks legalOfficer and guest users
 * Used for admin-only operations like assigning officers or system configuration
 */
export const requireAdmin = (req, res, next) => {
  // Check if user is authenticated
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized. Please login first.',
    });
  }

  // Check if user role is admin
  if (req.user.role !== 'admin') {
    // Only admin can access this route
    return res.status(403).json({
      success: false,
      message: 'Access denied. Only Admin can access this resource.',
    });
  }

  // User is admin, proceed to next middleware/controller
  next();
};

/**
 * Middleware to restrict access to legalOfficer only
 * Blocks admin and guest users
 * Used for legal officer specific operations
 */
export const requireLegalOfficer = (req, res, next) => {
  // Check if user is authenticated
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized. Please login first.',
    });
  }

  // Check if user role is legalOfficer
  if (req.user.role !== 'legalOfficer') {
    // Only legalOfficer can access this route
    return res.status(403).json({
      success: false,
      message: 'Access denied. Only Legal Officer can access this resource.',
    });
  }

  // User is legalOfficer, proceed to next middleware/controller
  next();
};














