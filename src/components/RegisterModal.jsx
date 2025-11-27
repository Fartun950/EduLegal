// Register Modal Component
// Handles user registration with role selection

import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getUserRole } from '../utils/roleUtils'
import Modal from './Modal'
import Button from './Button'
import { AlertCircle, CheckCircle } from 'lucide-react'

const RegisterModal = ({ isOpen, onClose, onSwitchToLogin }) => {
  const { register, user, updateUser } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'guest',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (error) setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long')
      return
    }

    setLoading(true)

    // Check if current user is an admin BEFORE registration
    // This is important because register() will overwrite the admin's session
    const currentUserRole = user?.role || getUserRole() || 'guest'
    const isAdminRegistering = currentUserRole === 'admin' || currentUserRole === 'legalOfficer'
    
    // Save admin session info if admin is registering another user
    let adminSession = null
    if (isAdminRegistering) {
      adminSession = {
        token: localStorage.getItem('token'),
        role: localStorage.getItem('role'),
        user: localStorage.getItem('user'),
        userId: localStorage.getItem('userId'),
      }
    }

    try {
      const response = await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
      })

      // Ensure response is valid and successful
      if (response && response.success) {
        // If admin was registering another user, restore their session
        if (isAdminRegistering && adminSession) {
          // Restore admin's session
          if (adminSession.token) localStorage.setItem('token', adminSession.token)
          if (adminSession.role) localStorage.setItem('role', adminSession.role)
          if (adminSession.user) localStorage.setItem('user', adminSession.user)
          if (adminSession.userId) localStorage.setItem('userId', adminSession.userId)
          
          // Update AuthContext user state back to admin
          const adminUser = adminSession.user ? JSON.parse(adminSession.user) : null
          if (adminUser && updateUser) {
            updateUser(adminUser)
          }
          
          // Admin is registering another user - don't redirect, just close modal
          setSuccess(true)
          // Reset form after a brief delay to show success message
          setTimeout(() => {
            onClose()
            setFormData({ name: '', email: '', password: '', confirmPassword: '', role: 'guest' })
            setSuccess(false)
          }, 1500)
        } else {
          // Self-registration - redirect to appropriate dashboard
          // Use the original form role to determine redirect - this is what user selected
          // Backend may return 'legal' for 'legalOfficer', but we use original form value
          const selectedRole = formData.role // 'legalOfficer', 'admin', or 'guest'
          
          // Determine redirect path based on the role user selected in the form
          let redirectPath = '/welcome' // Default for guest
          
          if (selectedRole === 'admin') {
            redirectPath = '/admin-dashboard'
          } else if (selectedRole === 'legalOfficer') {
            redirectPath = '/legal-dashboard'
          } else {
            redirectPath = '/welcome' // Guest dashboard
          }

          // Set success state
          setSuccess(true)
          
          // Close modal and redirect immediately
          // authService.register() already saved token, role, userId, and legalOfficerId to localStorage
          onClose()
          setFormData({ name: '', email: '', password: '', confirmPassword: '', role: 'guest' })
          
          // Redirect immediately using React Router - no delay needed
          navigate(redirectPath, { replace: true })
        }
      }
    } catch (err) {
      let errorMessage = 'Registration failed. Please try again.'

      if (err.isNetworkError || !err.response) {
        errorMessage = 'Unable to connect to the server. Please check your internet connection and ensure the backend server is running.'
      } else if (err.response?.status === 400) {
        errorMessage = err.response?.data?.message || 'Invalid registration data. Please check your inputs.'
      } else if (err.response?.status === 409) {
        errorMessage = 'An account with this email already exists. Please login instead.'
      } else if (err.response?.status >= 500) {
        errorMessage = 'Server error. Please try again later or contact support.'
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message
      }

      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Register">
      <form onSubmit={handleSubmit} className="space-y-4">
        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2">
            <CheckCircle className="text-green-600" size={20} />
            <p className="text-sm text-green-800">
              {user?.role === 'admin' || getUserRole() === 'admin' 
                ? 'User registered successfully!' 
                : 'Registration successful! Redirecting...'}
            </p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2">
            <AlertCircle className="text-red-600" size={20} />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Full Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-400 focus:border-teal-500"
            placeholder="Enter your full name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-400 focus:border-teal-500"
            placeholder="your.email@example.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Account Type <span className="text-red-500">*</span>
          </label>
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-400 focus:border-teal-500 bg-white"
          >
            <option value="guest">Guest (Student/General User)</option>
            <option value="legalOfficer">Legal Officer</option>
            <option value="admin">Administrator</option>
          </select>
          <p className="text-xs text-gray-500 mt-1">Select the type of account you want to create</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Password <span className="text-red-500">*</span>
          </label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            minLength={6}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-400 focus:border-teal-500"
            placeholder="Enter your password (min. 6 characters)"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Confirm Password <span className="text-red-500">*</span>
          </label>
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-400 focus:border-teal-500"
            placeholder="Confirm your password"
          />
        </div>

        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            className="flex-1"
            disabled={loading}
          >
            Cancel
          </Button>
          <Button type="submit" variant="primary" className="flex-1" disabled={loading}>
            {loading ? 'Registering...' : 'Register'}
          </Button>
        </div>

        <div className="text-center pt-2 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="text-teal-600 hover:text-teal-700 font-medium"
            >
              Login here
            </button>
          </p>
        </div>
      </form>
    </Modal>
  )
}

export default RegisterModal
