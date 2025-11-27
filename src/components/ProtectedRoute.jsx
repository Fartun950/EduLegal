// Protected Route Component for RBAC
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { mapRoleToBackend, getUserRole } from '../utils/roleUtils'
import { authService } from '../services/authService'
import { isPublicRoute, getDashboardPathForRole, ROUTES } from '../config/routes'
import auditService from '../services/auditService'

// Demo mode flag - MUST be false in production so that auth is enforced
const DEMO_MODE = false

const ProtectedRoute = ({ children, allowedRoles = [], requireAuth = true }) => {
  const { isAuthenticated, loading, user } = useAuth()
  const location = useLocation()

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600">Loading...</div>
      </div>
    )
  }

  // If route doesn't require auth (public/guest route), allow access immediately
  // Guest pages (welcome, complaint, resources, login) are fully public
  if (!requireAuth || isPublicRoute(location.pathname)) {
    return children
  }

  // DEMO MODE: Allow access to all routes for preview/demo purposes
  // This enables the role switcher to work without authentication
  if (DEMO_MODE) {
    // Show a demo banner if not authenticated
    if (!isAuthenticated) {
      return (
        <>
          <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-2 text-center">
            <p className="text-xs text-yellow-800">
              <span className="font-semibold">Demo Mode:</span> You are viewing this page in preview mode. 
              Login required for full functionality.
            </p>
          </div>
          {children}
        </>
      )
    }
  }

  // Check if token exists
  const token = authService.getToken()
  if (!token || !isAuthenticated) {
    // Not logged in - redirect to welcome page with login modal trigger
    // This ensures the login modal appears when accessing protected routes
    auditService.logUnauthorizedAccess(location.pathname, null, 'No token or not authenticated')
    return <Navigate to={ROUTES.WELCOME} state={{ from: location, showLogin: true }} replace />
  }

  // Check role access for protected routes with allowedRoles
  if (allowedRoles.length > 0) {
    const userRole = getUserRole() || user?.role || ''
    const mappedUserRole = mapRoleToBackend(userRole)
    const mappedAllowedRoles = allowedRoles.map(role => mapRoleToBackend(role))
    
    if (!mappedAllowedRoles.includes(mappedUserRole)) {
      // In demo mode, allow access anyway
      if (DEMO_MODE) {
        return (
          <>
            <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-2 text-center">
              <p className="text-xs text-yellow-800">
                <span className="font-semibold">Demo Mode:</span> You are viewing this page in preview mode. 
                Your current role doesn't have access to this page in production.
              </p>
            </div>
            {children}
          </>
        )
      }
      // Role mismatch - log and redirect to correct dashboard
      const requiredRoles = allowedRoles.join(', ')
      auditService.logRoleMismatch(requiredRoles, userRole, location.pathname)
      
      const userRoleForPath = userRole === 'legal' || userRole === 'legalOfficer' ? 'legalOfficer' : userRole
      const dashboardPath = getDashboardPathForRole(userRoleForPath)
      auditService.logRedirect(location.pathname, dashboardPath, 'Role mismatch')
      return <Navigate to={dashboardPath} replace />
    }
  }

  return children
}

export default ProtectedRoute

