# Redirection Module - Industry Standard Improvements

## Priority 1: Critical Security & UX Fixes

### 1. Replace Hard Redirects with React Router Navigation

**Current Issue:**
```javascript
// src/services/api.js - Line 56
window.location.href = '/welcome'  // ❌ Full page reload
```

**Solution:**
Create a navigation service that uses React Router's navigate function:

```javascript
// src/services/navigationService.js
import { createBrowserHistory } from 'history'

const history = createBrowserHistory()

export const navigationService = {
  redirectToLogin: (from) => {
    history.push('/login', { from })
  },
  redirectToWelcome: () => {
    history.push('/welcome')
  },
  redirectToDashboard: (role) => {
    const dashboardPath = getDashboardPathForRole(role)
    history.push(dashboardPath)
  }
}
```

**Update api.js:**
```javascript
// Instead of window.location.href
import { navigationService } from './navigationService'
navigationService.redirectToWelcome()
```

### 2. Centralize Route Configuration

**Create:** `src/config/routes.js`
```javascript
export const ROUTES = {
  // Public routes
  WELCOME: '/welcome',
  LOGIN: '/login',
  COMPLAINT: '/complaint',
  RESOURCES: '/resources',
  SETTINGS: '/settings',
  
  // Protected routes
  ADMIN_DASHBOARD: '/admin-dashboard',
  OFFICER_DASHBOARD: '/officer',
  LEGAL_DASHBOARD: '/legal-dashboard',
}

export const PUBLIC_ROUTES = [
  ROUTES.WELCOME,
  ROUTES.LOGIN,
  ROUTES.COMPLAINT,
  ROUTES.RESOURCES,
]

export const ADMIN_ROUTES = [
  ROUTES.ADMIN_DASHBOARD,
]

export const OFFICER_ROUTES = [
  ROUTES.OFFICER_DASHBOARD,
  ROUTES.LEGAL_DASHBOARD,
]
```

### 3. Implement Refresh Token Mechanism

**Backend:** Add refresh token endpoint
**Frontend:** Implement automatic token refresh

```javascript
// src/services/authService.js
export const refreshToken = async () => {
  const refreshToken = localStorage.getItem('refreshToken')
  if (!refreshToken) throw new Error('No refresh token')
  
  const response = await api.post('/auth/refresh', { refreshToken })
  if (response.data.token) {
    localStorage.setItem('token', response.data.token)
    return response.data.token
  }
  throw new Error('Token refresh failed')
}
```

### 4. Add Security Event Logging

**Create:** `src/services/auditService.js`
```javascript
export const auditService = {
  logUnauthorizedAccess: (path, userRole) => {
    console.warn('[AUDIT] Unauthorized access attempt:', {
      path,
      userRole,
      timestamp: new Date().toISOString(),
      // In production, send to logging service
    })
  },
  
  logRoleMismatch: (requiredRole, userRole, path) => {
    console.warn('[AUDIT] Role mismatch:', {
      requiredRole,
      userRole,
      path,
      timestamp: new Date().toISOString(),
    })
  }
}
```

## Priority 2: Code Quality Improvements

### 5. Add TypeScript for Type Safety

Convert key files to TypeScript:
- `src/components/ProtectedRoute.tsx`
- `src/utils/roleUtils.ts`
- `src/config/routes.ts`

### 6. Improve Error Handling

**Create:** `src/utils/errorHandler.js`
```javascript
export const handleAuthError = (error, navigate) => {
  if (error.response?.status === 401) {
    // Token expired
    if (error.response.data?.message?.includes('expired')) {
      // Try refresh token first
      return refreshToken().catch(() => {
        navigate('/login', { state: { from: location } })
      })
    }
    // Invalid token
    navigate('/login', { state: { from: location } })
  } else if (error.response?.status === 403) {
    // Role mismatch - redirect to appropriate dashboard
    const userRole = getUserRole()
    const dashboardPath = getDashboardPathForRole(userRole)
    navigate(dashboardPath)
  }
}
```

### 7. Add Loading States for Redirects

```javascript
// Show loading indicator during redirect
const [isRedirecting, setIsRedirecting] = useState(false)

// Before redirect
setIsRedirecting(true)
await navigate(path)
setIsRedirecting(false)
```

## Priority 3: Advanced Features

### 8. Implement Route Guards with Permissions

```javascript
// src/utils/permissions.js
export const hasPermission = (userRole, requiredPermission) => {
  const rolePermissions = {
    admin: ['read', 'write', 'delete', 'manage'],
    legalOfficer: ['read', 'write'],
    guest: ['read']
  }
  return rolePermissions[userRole]?.includes(requiredPermission) || false
}
```

### 9. Add Redirect History Tracking

```javascript
// Track redirect history for analytics
export const trackRedirect = (from, to, reason) => {
  // Log to analytics service
  analytics.track('redirect', { from, to, reason })
}
```

### 10. Implement Session Management

```javascript
// Check session validity before redirects
export const isSessionValid = () => {
  const token = localStorage.getItem('token')
  if (!token) return false
  
  try {
    const decoded = jwt.decode(token)
    return decoded.exp * 1000 > Date.now()
  } catch {
    return false
  }
}
```

## Implementation Checklist

- [ ] Replace all `window.location.href` with React Router navigation
- [ ] Create centralized route configuration
- [ ] Implement refresh token mechanism
- [ ] Add audit logging for security events
- [ ] Add rate limiting on backend
- [ ] Improve error handling with retry logic
- [ ] Add TypeScript types for better safety
- [ ] Implement session validation
- [ ] Add loading states for redirects
- [ ] Create comprehensive test suite

## Testing Requirements

1. **Unit Tests:**
   - Route protection logic
   - Role-based redirects
   - Token validation

2. **Integration Tests:**
   - Login flow with redirects
   - Protected route access
   - Token expiration handling

3. **E2E Tests:**
   - Complete authentication flow
   - Role-based navigation
   - Error scenarios


