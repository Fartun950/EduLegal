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
  X,
  AlertTriangle,
  LogOut
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { getUserRole } from '../utils/roleUtils'
import Modal from './Modal'
import Button from './Button'

const Sidebar = ({ userRole: propUserRole }) => {
  const location = useLocation()
  const navigate = useNavigate()
  const { logout, isAuthenticated, user } = useAuth()
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  
  // Auto-detect role from auth context or localStorage for consistency
  // Priority: prop > localStorage > user object > 'guest'
  let detectedRole = propUserRole || getUserRole() || user?.role || 'guest'
  
  // Normalize user role - handle both 'officer' and 'legalOfficer'
  // Also handle 'legal' which is the normalized form from AuthContext
  if (detectedRole === 'legal' || detectedRole === 'legalOfficer') {
    detectedRole = 'officer'
  }
  
  const normalizedRole = detectedRole
  
  const handleLogoutClick = () => {
    setShowLogoutModal(true)
    setIsMobileOpen(false)
  }
  
  const handleConfirmLogout = () => {
    logout()
    setShowLogoutModal(false)
    navigate('/welcome', { replace: true })
  }
  
  const handleCancelLogout = () => {
    setShowLogoutModal(false)
  }
  
  const adminNavItems = [
    { path: '/admin-dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/admin-dashboard', label: 'Cases', icon: FileText },
    { path: '/admin-dashboard', label: 'Users', icon: Users },
    { path: '/admin-dashboard', label: 'Documents', icon: FileText },
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

  const navItems = normalizedRole === 'admin' 
    ? adminNavItems 
    : normalizedRole === 'officer' 
    ? officerNavItems 
    : normalizedRole === 'guest'
    ? guestNavItems
    : normalizedRole === 'student'
    ? studentNavItems
    : guestNavItems

  const isActive = (path) => {
    // Exact match for specific routes
    if (path === '/admin' || path === '/officer' || path === '/admin-dashboard') {
      return location.pathname === path || location.pathname === '/admin'
    }
    // Handle officer dashboard routes
    if (path === '/officer' && location.pathname === '/legal-dashboard') {
      return true
    }
    // For other routes, check if pathname starts with the path
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
                    ? 'bg-primary-500 text-white shadow-md'
                    : 'text-primary-100 hover:bg-primary-600/50 hover:text-white'
                }`}
              >
                <Icon size={20} />
                <span className="font-medium">{item.label}</span>
              </Link>
            )
          })}
        </nav>
        
        {/* Logout Button - Show for authenticated users (admin and officer) */}
        {isAuthenticated && (normalizedRole === 'admin' || normalizedRole === 'officer') && (
          <div className="p-4 border-t border-primary-600">
            <button
              onClick={handleLogoutClick}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 text-primary-100 hover:bg-red-600/50 hover:text-white"
            >
              <LogOut size={20} />
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

      {/* Logout Confirmation Modal */}
      <Modal
        isOpen={showLogoutModal}
        onClose={handleCancelLogout}
        title="Confirm Logout"
        size="sm"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="text-red-600" size={20} />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-700 mb-1">
                Are you sure you want to logout?
              </p>
              <p className="text-xs text-gray-500">
                You will need to login again to access your account.
              </p>
            </div>
          </div>
          
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={handleCancelLogout}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              onClick={handleConfirmLogout}
              className="flex-1 bg-red-600 hover:bg-red-700"
            >
              <LogOut size={16} className="mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </Modal>
    </>
  )
}

export default Sidebar

