import { Outlet } from 'react-router-dom'
import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import Header from '../components/Header'
import { 
  LayoutDashboard, 
  FileText, 
  MessageSquare,
  Settings,
  Menu,
  X
} from 'lucide-react'

const LegalOfficerLayout = () => {
  const location = useLocation()
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  const navItems = [
    { path: '/officer', label: 'Dashboard', icon: LayoutDashboard, exact: true },
    { path: '/officer/cases', label: 'My Cases', icon: FileText },
    { path: '/officer/forum', label: 'Forum', icon: MessageSquare },
    { path: '/settings', label: 'Settings', icon: Settings },
  ]

  const isActive = (path, exact = false) => {
    if (exact) {
      return location.pathname === path
    }
    return location.pathname.startsWith(path)
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-slate-800 text-white rounded-lg shadow-lg"
      >
        {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <div
        className={`w-64 bg-slate-800 text-white min-h-screen fixed left-0 top-0 flex flex-col z-40 transform transition-transform duration-300 ease-in-out ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="p-6 border-b border-slate-700">
          <h1 className="text-2xl font-bold">EduLegal</h1>
          <p className="text-sm text-slate-400 mt-1">Legal Officer</p>
        </div>
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.path, item.exact)
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsMobileOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-smooth ${
                  active
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                }`}
              >
                <Icon size={20} />
                <span className="font-medium">{item.label}</span>
              </Link>
            )
          })}
        </nav>
        <div className="p-4 border-t border-slate-700">
          <div className="flex items-center gap-3 px-4 py-2">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold">JD</span>
            </div>
            <div>
              <p className="text-sm font-medium text-white">John Doe</p>
              <p className="text-xs text-slate-400">Legal Officer</p>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 lg:ml-64 flex flex-col">
        <Header title="Legal Officer" userName="John Doe" userRole="officer" />
        <main className="flex-1 p-4 lg:p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default LegalOfficerLayout

