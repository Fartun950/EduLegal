import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  Settings, 
  MessageSquare,
  Shield,
  Home,
  Menu,
  X
} from 'lucide-react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faRightFromBracket } from '@fortawesome/free-solid-svg-icons'
import { useAuth } from '../context/AuthContext'

const Sidebar = ({ userRole = 'admin' }) => {
  const location = useLocation()
  const navigate = useNavigate()
  const { logout } = useAuth()
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  
  const handleLogout = () => {
    logout()
    setIsMobileOpen(false)
    navigate('/welcome', { replace: true })
  }
  
  const adminNavItems = [
    { path: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/admin/cases', label: 'Cases', icon: FileText },
    { path: '/admin/users', label: 'Users', icon: Users },
    { path: '/admin/documents', label: 'Documents', icon: FileText },
    { path: '/settings', label: 'Settings', icon: Settings },
  ]

  const officerNavItems = [
    { path: '/officer', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/officer/cases', label: 'My Cases', icon: FileText },
    { path: '/officer/documents', label: 'Documents', icon: FileText },
    { path: '/officer/forum', label: 'Forum', icon: MessageSquare },
    { path: '/settings', label: 'Settings', icon: Settings },
  ]

  const studentNavItems = [
    { path: '/welcome', label: 'Welcome', icon: Home },
    { path: '/complaint', label: 'Submit Complaint', icon: FileText },
    { path: '/resources', label: 'Resources', icon: FileText },
    { path: '/settings', label: 'Settings', icon: Settings },
  ]

  // Guest nav items should match student nav items for public routes
  // This ensures consistent navigation across Welcome, Settings, Resources, and Complaint pages
  const guestNavItems = [
    { path: '/welcome', label: 'Welcome', icon: Home },
    { path: '/complaint', label: 'Submit Complaint', icon: FileText },
    { path: '/resources', label: 'Resources', icon: FileText },
    { path: '/settings', label: 'Settings', icon: Settings },
  ]

  const navItems = userRole === 'admin' 
    ? adminNavItems 
    : userRole === 'officer' 
    ? officerNavItems 
    : userRole === 'guest'
    ? guestNavItems
    : userRole === 'student'
    ? studentNavItems
    : guestNavItems

  const isActive = (path) => {
    if (path === '/admin' || path === '/officer') {
      return location.pathname === path
    }
    return location.pathname.startsWith(path)
  }

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-primary-600 text-white rounded-button shadow-medium hover:bg-primary-700 transition-colors icon-hover"
      >
        {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <div
        className={`w-64 bg-gradient-to-b from-primary-700 to-primary-800 text-white min-h-screen fixed left-0 top-0 flex flex-col z-40 transform transition-transform duration-300 ease-in-out shadow-strong ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="p-6 border-b border-primary-600">
          <h1 className="text-2xl font-bold text-white drop-shadow-sm">EduLegal</h1>
          <p className="text-xs text-primary-200 mt-1">Legal Management System</p>
        </div>
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.path)
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsMobileOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  active
                    ? 'bg-primary-500 text-white shadow-md scale-[1.02]'
                    : 'text-primary-100 hover:bg-primary-600/50 hover:text-white hover:scale-[1.01]'
                }`}
              >
                <Icon size={20} className="icon-hover" />
                <span className="font-medium">{item.label}</span>
              </Link>
            )
          })}
        </nav>
        
        {/* Logout Button - Only show for admin */}
        {userRole === 'admin' && (
          <div className="p-4 border-t border-primary-600">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 text-primary-100 hover:bg-red-600/50 hover:text-white hover:scale-[1.01]"
            >
              <FontAwesomeIcon icon={faRightFromBracket} className="w-5 h-5" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        )}
      </div>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsMobileOpen(false)}
        />
      )}
    </>
  )
}

export default Sidebar

