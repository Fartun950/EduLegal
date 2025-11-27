/**
 * Navigation Service
 * Centralized navigation handling using React Router
 * Replaces window.location.href for better SPA navigation
 */

import { ROUTES, getDashboardPathForRole } from '../config/routes'

// Store navigation function from React Router
let navigateFunction = null
let history = null

/**
 * Initialize navigation service with React Router's navigate function
 * Call this in your App component or router setup
 * @param {Function} navigate - React Router's navigate function
 * @param {Object} routerHistory - React Router's history object (optional)
 */
export const initNavigationService = (navigate, routerHistory = null) => {
  navigateFunction = navigate
  history = routerHistory
}

/**
 * Navigate to a route using React Router
 * Falls back to window.location if navigate not initialized
 * @param {string} path - Path to navigate to
 * @param {Object} options - Navigation options (state, replace, etc.)
 */
const navigateTo = (path, options = {}) => {
  if (navigateFunction) {
    navigateFunction(path, options)
  } else {
    // Fallback for cases where navigate isn't initialized yet
    // This should rarely happen, but provides safety
    console.warn('Navigation service not initialized, using window.location')
    if (options.replace) {
      window.location.replace(path)
    } else {
      window.location.href = path
    }
  }
}

/**
 * Navigation service methods
 */
export const navigationService = {
  /**
   * Navigate to login page with intended destination
   * @param {Object} from - Location object with pathname (from useLocation)
   */
  redirectToLogin: (from = null) => {
    const state = from ? { from } : undefined
    navigateTo(ROUTES.LOGIN, { state, replace: true })
  },

  /**
   * Navigate to welcome page
   */
  redirectToWelcome: () => {
    navigateTo(ROUTES.WELCOME, { replace: true })
  },

  /**
   * Navigate to dashboard based on user role
   * @param {string} role - User role
   */
  redirectToDashboard: (role) => {
    const dashboardPath = getDashboardPathForRole(role)
    navigateTo(dashboardPath, { replace: true })
  },

  /**
   * Navigate to admin dashboard
   */
  redirectToAdminDashboard: () => {
    navigateTo(ROUTES.ADMIN_DASHBOARD, { replace: true })
  },

  /**
   * Navigate to officer dashboard
   */
  redirectToOfficerDashboard: () => {
    navigateTo(ROUTES.OFFICER, { replace: true })
  },

  /**
   * Navigate to a specific route
   * @param {string} path - Path to navigate to
   * @param {Object} options - Navigation options
   */
  navigate: (path, options = {}) => {
    navigateTo(path, options)
  },

  /**
   * Go back in history
   */
  goBack: () => {
    if (history && history.goBack) {
      history.goBack()
    } else if (window.history.length > 1) {
      window.history.back()
    } else {
      // If no history, redirect to welcome
      navigateTo(ROUTES.WELCOME, { replace: true })
    }
  },

  /**
   * Replace current location (useful for redirects)
   * @param {string} path - Path to navigate to
   * @param {Object} state - Optional state to pass
   */
  replace: (path, state = undefined) => {
    navigateTo(path, { replace: true, state })
  },
}

export default navigationService


