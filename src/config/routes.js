/**
 * Centralized Route Configuration
 * All application routes defined in one place for easy maintenance
 */

export const ROUTES = {
  // Public routes
  WELCOME: '/welcome',
  LOGIN: '/login',
  COMPLAINT: '/complaint',
  COMPLAINT_OLD: '/complaint-old',
  RESOURCES: '/resources',
  SETTINGS: '/settings',
  
  // Protected routes - Admin
  ADMIN: '/admin',
  ADMIN_DASHBOARD: '/admin-dashboard',
  
  // Protected routes - Legal Officer
  OFFICER: '/officer',
  OFFICER_DASHBOARD: '/officer-dashboard',
  LEGAL_DASHBOARD: '/legal-dashboard',
  
  // Protected routes - Legal Officer nested
  OFFICER_CASES: '/officer/cases',
  OFFICER_CASE_DETAILS: '/officer/case/:id',
  OFFICER_FORUM: '/officer/forum',
  
  // Student routes (public)
  STUDENT_DASHBOARD: '/student-dashboard',
}

/**
 * Public routes that don't require authentication
 */
export const PUBLIC_ROUTES = [
  ROUTES.WELCOME,
  ROUTES.LOGIN,
  ROUTES.COMPLAINT,
  ROUTES.COMPLAINT_OLD,
  ROUTES.RESOURCES,
  ROUTES.SETTINGS,
  ROUTES.STUDENT_DASHBOARD,
]

/**
 * Admin-only routes
 */
export const ADMIN_ROUTES = [
  ROUTES.ADMIN,
  ROUTES.ADMIN_DASHBOARD,
]

/**
 * Legal Officer routes
 */
export const OFFICER_ROUTES = [
  ROUTES.OFFICER,
  ROUTES.OFFICER_DASHBOARD,
  ROUTES.LEGAL_DASHBOARD,
]

/**
 * Check if a pathname is a public route
 * @param {string} pathname - The pathname to check
 * @returns {boolean}
 */
export const isPublicRoute = (pathname) => {
  return PUBLIC_ROUTES.some(route => {
    // Handle exact matches and pathname starts with route
    if (pathname === route) return true
    // Handle dynamic routes like /officer/case/:id
    if (route.includes(':id')) {
      const routePattern = route.replace(':id', '[^/]+')
      return new RegExp(`^${routePattern}$`).test(pathname)
    }
    // Handle nested routes
    return pathname.startsWith(route)
  })
}

/**
 * Get default dashboard path for a role
 * @param {string} role - User role (admin, legalOfficer, legal, guest)
 * @returns {string} Dashboard path
 */
export const getDashboardPathForRole = (role) => {
  const normalizedRole = role?.toLowerCase()
  
  switch (normalizedRole) {
    case 'admin':
      return ROUTES.ADMIN_DASHBOARD
    case 'legalofficer':
    case 'legal':
      return ROUTES.OFFICER
    case 'guest':
    case 'student':
    default:
      return ROUTES.WELCOME
  }
}


