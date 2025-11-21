// Protected Route Component for RBAC
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { mapRoleToBackend, isPublicRoute } from '../utils/roleUtils'

// Demo mode flag - MUST be false in production so that auth is enforced
const DEMO_MODE = false

const ProtectedRoute = ({ children, allowedRoles = [], requireAuth = true }) => {
  const { isAuthenticated, loading, user } = useAuth()
  const location = useLocation()

  // Admin and Legal Officer routes do NOT require authentication
  // Check this FIRST before any other checks to ensure they always work
  const isAdminRoute = location.pathname.startsWith('/admin') || location.pathname.startsWith('/admin-dashboard')
  const isLegalOfficerRoute = location.pathname.startsWith('/legal') || location.pathname.startsWith('/legal-dashboard') || location.pathname.startsWith('/officer')
  
  if (isAdminRoute || isLegalOfficerRoute) {
    // Allow access without authentication for Admin and Legal Officer
    // Return children immediately, bypassing all auth checks
    return children
  }

  // Show loading state while checking auth (only for other routes)
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

  // Other protected routes require authentication
  if (!isAuthenticated) {
    // Redirect to dedicated login route, preserving where the user came from
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Check role access for protected routes
  // Skip role check for Admin and Legal Officer routes (they don't require auth)
  if (allowedRoles.length > 0 && !isAdminRoute && !isLegalOfficerRoute) {
    const userRole = user?.role || ''
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
      // User role doesn't have access - redirect to safe guest home
      return <Navigate to="/welcome" replace />
    }
  }

  return children
}

export default ProtectedRoute

