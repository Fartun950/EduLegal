import { useNavigate, useLocation } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import { Shield, User, UserCircle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { getDashboardPathForRole } from '../utils/roleUtils'

const RoleSwitcher = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated, user } = useAuth()
  const [activeRole, setActiveRole] = useState('guest')
  const [isExpanded, setIsExpanded] = useState(false)
  const containerRef = useRef(null)

  const roles = [
    {
      id: 'guest',
      label: 'Guest',
      description: 'Public access',
      icon: UserCircle,
      path: '/welcome',
      color: 'emerald',
      gradient: 'from-emerald-500 to-teal-500',
      bgColor: 'bg-emerald-500',
      textColor: 'text-emerald-600',
      hoverBg: 'hover:bg-emerald-50',
      borderColor: 'border-emerald-200',
      lightBg: 'bg-emerald-50',
    },
    {
      id: 'officer',
      label: 'Legal Officer',
      description: 'Case management',
      icon: User,
      path: '/legal-dashboard',
      color: 'blue',
      gradient: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-500',
      textColor: 'text-blue-600',
      hoverBg: 'hover:bg-blue-50',
      borderColor: 'border-blue-200',
      lightBg: 'bg-blue-50',
    },
    {
      id: 'admin',
      label: 'Admin',
      description: 'Full system access',
      icon: Shield,
      path: '/admin-dashboard',
      color: 'purple',
      gradient: 'from-purple-500 to-indigo-500',
      bgColor: 'bg-purple-500',
      textColor: 'text-purple-600',
      hoverBg: 'hover:bg-purple-50',
      borderColor: 'border-purple-200',
      lightBg: 'bg-purple-50',
    },
  ]

  useEffect(() => {
    // Determine active role based on current path
    if (location.pathname.startsWith('/admin') || location.pathname.startsWith('/admin-dashboard')) {
      setActiveRole('admin')
    } else if (location.pathname.startsWith('/officer') || location.pathname.startsWith('/legal-dashboard')) {
      setActiveRole('officer')
    } else if (location.pathname.startsWith('/welcome') || location.pathname.startsWith('/complaint') || location.pathname.startsWith('/student-dashboard') || location.pathname.startsWith('/resources')) {
      setActiveRole('guest')
    }
  }, [location.pathname])

  useEffect(() => {
    // Close popup when clicking outside
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsExpanded(false)
      }
    }

    if (isExpanded) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isExpanded])

  const handleRoleSwitch = (role) => {
    setActiveRole(role.id)
    setIsExpanded(false)

    // Guest is always allowed without login
    if (role.id === 'guest') {
      navigate('/welcome', { replace: true })
      return
    }

    // Admin and Legal Officer routes require authentication
    // Check if user is authenticated
    if (!isAuthenticated) {
      // Check if we're already on welcome page - if so, trigger modal reopen
      const isOnWelcome = location.pathname === '/welcome' || location.pathname === '/'
      
      // Store intent in sessionStorage for persistence across modal close/reopen
      const loginIntent = {
        path: role.path,
        role: role.id,
      }
      sessionStorage.setItem('pendingLoginIntent', JSON.stringify(loginIntent))
      
      if (isOnWelcome) {
        // Already on welcome - use a timestamp to force state update
        // This ensures the useEffect in Welcome page triggers even on same route
        navigate('/welcome', { 
          state: { 
            from: { pathname: role.path },
            intendedRole: role.id,
            showLogin: true,
            timestamp: Date.now() // Force state change
          },
          replace: true
        })
        // Also trigger a custom event to ensure modal opens
        window.dispatchEvent(new CustomEvent('openLoginModal', { detail: loginIntent }))
      } else {
        // Not on welcome - navigate to welcome with login intent
        navigate('/welcome', { 
          state: { 
            from: { pathname: role.path },
            intendedRole: role.id,
            showLogin: true 
          } 
        })
      }
      return
    }

    // Check if user has the required role for the selected dashboard
    const userRole = user?.role || ''
    const requiredRoles = role.id === 'admin' ? ['admin'] : ['admin', 'legal', 'legalOfficer']
    const mappedUserRole = userRole === 'legalOfficer' ? 'legal' : userRole
    
    if (!requiredRoles.includes(mappedUserRole)) {
      // User doesn't have required role - redirect to login with message
      navigate('/welcome', { 
        state: { 
          from: { pathname: role.path },
          intendedRole: role.id,
          showLogin: true,
          message: `You need ${role.label} privileges to access this page. Please login with an authorized account.`
        } 
      })
      return
    }

    // User is authenticated and has the required role - navigate to dashboard
    navigate(role.path)
  }

  const currentRole = roles.find(r => r.id === activeRole) || roles[0]

  return (
    <div className="flex items-center justify-end px-4 lg:px-6 py-2">
      <div className="flex items-center gap-3">
        {/* Current Role Label */}
        <span className="text-sm font-medium text-gray-700 hidden sm:block">
          {currentRole.label}
        </span>

        {/* Modern Role Switcher */}
        <div className="relative" ref={containerRef}>
          {/* Trigger Button */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={`
              group relative
              w-11 h-11 rounded-xl
              flex items-center justify-center
              transition-all duration-300 ease-out
              ${isExpanded 
                ? `bg-gradient-to-br ${currentRole.gradient} shadow-lg scale-105` 
                : 'bg-white hover:bg-gray-50 shadow-md hover:shadow-lg border border-gray-200'
              }
              focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-${currentRole.color}-500
            `}
            aria-label="Switch Role"
            aria-expanded={isExpanded}
          >
            <currentRole.icon 
              size={20} 
              className={`transition-all duration-300 ${
                isExpanded 
                  ? 'text-white scale-110' 
                  : `${currentRole.textColor} group-hover:scale-110`
              }`}
            />
            {isExpanded && (
              <div className="absolute inset-0 rounded-xl bg-white/20 backdrop-blur-sm"></div>
            )}
          </button>

          {/* Modern Card-Style Menu */}
          <div
            className={`
              absolute top-0 right-0 mt-14
              bg-white
              rounded-2xl
              shadow-2xl
              border border-gray-100
              overflow-hidden
              transition-all duration-300 ease-out
              ${isExpanded 
                ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto' 
                : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'
              }
              z-50
            `}
            style={{
              minWidth: '280px',
              boxShadow: isExpanded 
                ? '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' 
                : 'none',
            }}
          >
            {/* Menu Header */}
            <div className="px-5 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
              <h3 className="text-sm font-semibold text-gray-900">Switch Role</h3>
              <p className="text-xs text-gray-500 mt-0.5">Select your access level</p>
            </div>

            {/* Role Cards */}
            <div className="p-3 space-y-2">
              {roles.map((role) => {
                const Icon = role.icon
                const isActive = activeRole === role.id
                return (
                  <button
                    key={role.id}
                    onClick={() => handleRoleSwitch(role)}
                    className={`
                      group relative
                      w-full
                      flex items-start gap-4
                      px-4 py-3.5
                      rounded-xl
                      transition-all duration-200 ease-out
                      ${isActive 
                        ? `bg-gradient-to-br ${role.gradient} text-white shadow-lg scale-[1.02]` 
                        : `bg-white text-gray-700 ${role.hoverBg} hover:shadow-md hover:scale-[1.01] border border-gray-200 ${
                          role.id === 'guest' ? 'hover:border-emerald-300' :
                          role.id === 'officer' ? 'hover:border-blue-300' :
                          'hover:border-purple-300'
                        }`
                      }
                      overflow-hidden
                    `}
                  >
                    {/* Active Indicator Bar */}
                    {isActive && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-white/30"></div>
                    )}
                    
                    {/* Icon Container */}
                    <div className={`
                      flex-shrink-0
                      w-10 h-10
                      rounded-lg
                      flex items-center justify-center
                      transition-all duration-200
                      ${isActive 
                        ? 'bg-white/20 backdrop-blur-sm' 
                        : `${role.lightBg} ${role.textColor} group-hover:scale-110`
                      }
                    `}>
                      <Icon 
                        size={20} 
                        className={isActive ? 'text-white' : role.textColor}
                      />
                    </div>

                    {/* Role Info */}
                    <div className="flex-1 text-left min-w-0">
                      <div className={`
                        font-semibold text-sm
                        ${isActive ? 'text-white' : 'text-gray-900'}
                      `}>
                        {role.label}
                      </div>
                      <div className={`
                        text-xs mt-0.5
                        ${isActive ? 'text-white/80' : 'text-gray-500'}
                      `}>
                        {role.description}
                      </div>
                    </div>

                    {/* Active Checkmark */}
                    {isActive && (
                      <div className="flex-shrink-0">
                        <div className="w-5 h-5 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        </div>
                      </div>
                    )}

                    {/* Hover Glow Effect */}
                    {!isActive && (
                      <div className={`
                        absolute inset-0 rounded-xl
                        bg-gradient-to-br ${role.gradient}
                        opacity-0 group-hover:opacity-5
                        transition-opacity duration-200
                        pointer-events-none
                      `}></div>
                    )}
                  </button>
                )
              })}
            </div>

            {/* Menu Footer */}
            <div className="px-5 py-3 bg-gray-50 border-t border-gray-200">
              <p className="text-xs text-gray-500 text-center">
                Current: <span className="font-medium text-gray-700">{currentRole.label}</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RoleSwitcher
