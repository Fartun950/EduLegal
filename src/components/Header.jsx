// Header Component
// Top navigation header with title, user info, and role switcher

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import RoleSwitcher from './RoleSwitcher'
import LoginModal from './LoginModal'
import RegisterModal from './RegisterModal'
import { Menu } from 'lucide-react'

const Header = ({ title, userName, userRole }) => {
  const { isAuthenticated, logout, user } = useAuth()
  const navigate = useNavigate()
  const [loginModalOpen, setLoginModalOpen] = useState(false)
  const [registerModalOpen, setRegisterModalOpen] = useState(false)

  return (
    <header className="bg-gradient-to-r from-primary-500 to-primary-600 text-white border-b border-primary-700 shadow-medium sticky top-0 z-30">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Title */}
          <div className="flex items-center">
            <h1 className="text-xl font-semibold text-white drop-shadow-sm">{title || 'Dashboard'}</h1>
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-4">
            {/* Role Switcher - Show for all users since Admin/Legal Officer don't require auth */}
            <RoleSwitcher />
          </div>
        </div>
      </div>

      {/* Modals */}
      <LoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        onSwitchToRegister={() => {
          setLoginModalOpen(false)
          setRegisterModalOpen(true)
        }}
      />
      <RegisterModal
        isOpen={registerModalOpen}
        onClose={() => setRegisterModalOpen(false)}
        onSwitchToLogin={() => {
          setRegisterModalOpen(false)
          setLoginModalOpen(true)
        }}
      />
    </header>
  )
}

export default Header
