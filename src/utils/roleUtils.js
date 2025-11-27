// Role Utilities - Centralized role mapping and checking logic
// Reduces code duplication across components

// Import centralized route functions
import { isPublicRoute as checkPublicRoute, getDashboardPathForRole as getDashboardPath } from '../config/routes'

/**
 * Maps frontend role names to backend role names
 * Frontend: 'admin', 'officer', 'legalOfficer', 'student', 'guest', 'staff'
 * Backend: 'admin', 'legalOfficer', 'guest'
 */
export const mapRoleToBackend = (frontendRole) => {
  const roleMapping = {
    'admin': 'admin',
    'officer': 'legalOfficer',
    'legalOfficer': 'legalOfficer',
    'student': 'guest',
    'guest': 'guest',
    'staff': 'guest',
  }
  return roleMapping[frontendRole] || 'guest'
}

/**
 * Maps backend role names to frontend role names
 */
export const mapRoleToFrontend = (backendRole) => {
  const roleMapping = {
    'admin': 'admin',
    'legalOfficer': 'legalOfficer',
    'guest': 'guest',
  }
  return roleMapping[backendRole] || 'guest'
}

/**
 * Check if a role is a guest role (student, guest, staff all map to guest)
 */
export const isGuestRole = (role) => {
  const guestRoles = ['student', 'guest', 'staff']
  return guestRoles.includes(role?.toLowerCase()) || !role
}

/**
 * Check if a role requires authentication (not a guest)
 * NOTE: Admin and Legal Officer no longer require authentication
 */
export const requiresAuth = (role) => {
  // No roles require authentication anymore
  return false
}

/**
 * Get default user info for guest/unauthenticated users
 */
export const getDefaultGuestUser = () => ({
  name: 'Guest',
  role: 'guest',
})

/**
 * Determine role from pathname
 */
export const getRoleFromPath = (pathname) => {
  if (pathname.startsWith('/admin') || pathname.startsWith('/admin-dashboard')) {
    return 'admin'
  } else if (pathname.startsWith('/officer') || pathname.startsWith('/legal-dashboard')) {
    return 'officer'
  } else if (pathname.startsWith('/welcome') || pathname.startsWith('/complaint') || pathname.startsWith('/student-dashboard') || pathname.startsWith('/resources')) {
    return 'guest'
  }
  return 'guest'
}

/**
 * Check if pathname is a public/guest route
 * NOTE: This function now uses centralized config from routes.js
 * Kept here for backward compatibility
 */
export const isPublicRoute = (pathname) => {
  return checkPublicRoute(pathname)
}

/**
 * Get the default dashboard path for a backend role
 * NOTE: This function now uses centralized config from routes.js
 * Kept here for backward compatibility
 */
export const getDashboardPathForRole = (backendRole) => {
  return getDashboardPath(backendRole)
}

/**
 * Get user role from localStorage
 * Returns the role stored in localStorage, or null if not found
 */
export function getUserRole() {
  return localStorage.getItem('role')
}





