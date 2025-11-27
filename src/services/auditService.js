/**
 * Audit Service
 * Logs security events and user actions for monitoring and compliance
 */

/**
 * Log levels
 */
const LOG_LEVELS = {
  INFO: 'info',
  WARN: 'warn',
  ERROR: 'error',
  SECURITY: 'security',
}

/**
 * Log an audit event
 * @param {string} event - Event name
 * @param {Object} details - Event details
 * @param {string} level - Log level
 */
const logEvent = (event, details = {}, level = LOG_LEVELS.INFO) => {
  const auditEntry = {
    event,
    level,
    timestamp: new Date().toISOString(),
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
    url: typeof window !== 'undefined' ? window.location.href : 'unknown',
    ...details,
  }

  // In development, log to console
  if (import.meta.env.DEV) {
    const logMethod = level === LOG_LEVELS.ERROR ? console.error :
                     level === LOG_LEVELS.WARN ? console.warn :
                     level === LOG_LEVELS.SECURITY ? console.warn :
                     console.log
    
    logMethod(`[AUDIT ${level.toUpperCase()}]`, event, auditEntry)
  }

  // In production, send to logging service
  // TODO: Integrate with your logging service (e.g., Sentry, LogRocket, etc.)
  if (import.meta.env.PROD) {
    // Example: Send to logging endpoint
    // fetch('/api/audit', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(auditEntry)
    // }).catch(err => console.error('Failed to send audit log:', err))
  }
}

/**
 * Audit Service API
 */
export const auditService = {
  /**
   * Log unauthorized access attempt
   * @param {string} path - Path that was accessed
   * @param {string} userRole - User's role (if any)
   * @param {string} reason - Reason for denial
   */
  logUnauthorizedAccess: (path, userRole = null, reason = 'Not authenticated') => {
    logEvent('UNAUTHORIZED_ACCESS', {
      path,
      userRole,
      reason,
    }, LOG_LEVELS.SECURITY)
  },

  /**
   * Log role mismatch (403 Forbidden)
   * @param {string} requiredRole - Role required for access
   * @param {string} userRole - User's actual role
   * @param {string} path - Path that was accessed
   */
  logRoleMismatch: (requiredRole, userRole, path) => {
    logEvent('ROLE_MISMATCH', {
      requiredRole,
      userRole,
      path,
    }, LOG_LEVELS.SECURITY)
  },

  /**
   * Log successful login
   * @param {string} userId - User ID
   * @param {string} role - User role
   */
  logLogin: (userId, role) => {
    logEvent('LOGIN_SUCCESS', {
      userId,
      role,
    }, LOG_LEVELS.INFO)
  },

  /**
   * Log failed login attempt
   * @param {string} email - Email used in attempt
   * @param {string} reason - Reason for failure
   */
  logLoginFailure: (email, reason = 'Invalid credentials') => {
    logEvent('LOGIN_FAILURE', {
      email,
      reason,
    }, LOG_LEVELS.SECURITY)
  },

  /**
   * Log token expiration
   * @param {string} path - Path where token expired
   */
  logTokenExpiration: (path) => {
    logEvent('TOKEN_EXPIRED', {
      path,
    }, LOG_LEVELS.WARN)
  },

  /**
   * Log invalid token
   * @param {string} path - Path where invalid token was used
   */
  logInvalidToken: (path) => {
    logEvent('INVALID_TOKEN', {
      path,
    }, LOG_LEVELS.SECURITY)
  },

  /**
   * Log redirect event
   * @param {string} from - Source path
   * @param {string} to - Destination path
   * @param {string} reason - Reason for redirect
   */
  logRedirect: (from, to, reason) => {
    logEvent('REDIRECT', {
      from,
      to,
      reason,
    }, LOG_LEVELS.INFO)
  },

  /**
   * Log logout
   * @param {string} userId - User ID
   */
  logLogout: (userId) => {
    logEvent('LOGOUT', {
      userId,
    }, LOG_LEVELS.INFO)
  },

  /**
   * Log custom security event
   * @param {string} event - Event name
   * @param {Object} details - Event details
   */
  logSecurityEvent: (event, details = {}) => {
    logEvent(event, details, LOG_LEVELS.SECURITY)
  },
}

export default auditService


