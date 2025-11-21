import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Modal from './Modal'
import Button from './Button'
import { AlertCircle, CheckCircle, X } from 'lucide-react'

const LoginModal = ({ isOpen, onClose, onSwitchToRegister }) => {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
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
    setLoading(true)

    try {
      const response = await login(formData)
      if (response.success === true) {
        setSuccess(true)
        let role = response.role || localStorage.getItem('role') || 'guest'
        if (role === 'legalOfficer') {
          role = 'legal'
        }

        let redirectPath = '/welcome'
        const fromPath = location.state?.from?.pathname // Path from ProtectedRoute

        if (fromPath) {
          redirectPath = fromPath
          console.log('Redirecting back to protected route:', redirectPath)
        } else {
          // Fallback to role-based redirect if no 'fromPath'
          if (role === 'admin') {
            redirectPath = '/admin-dashboard'
          } else if (role === 'legal' || role === 'legalOfficer') {
            redirectPath = '/legal-dashboard'
          } else if (role === 'guest') {
            redirectPath = '/welcome'
          } else {
            console.warn('Unrecognized role after login:', role)
            redirectPath = '/welcome'
          }
          console.log('Redirecting based on authenticated role:', redirectPath)
        }

        localStorage.removeItem('intendedDashboard') // Clear old intended paths
        localStorage.removeItem('intendedRole')

        setFormData({ email: '', password: '' })
        onClose() // Close modal first
        setTimeout(() => {
          console.log('Navigating to:', redirectPath)
          navigate(redirectPath, { replace: true })
        }, 100)
      }
    } catch (err) {
      // Handle different error types with user-friendly messages
      let errorMessage = 'Login failed. Please check your credentials.'
      
      if (err.isNetworkError || !err.response) {
        errorMessage = 'Unable to connect to the server. Please check your internet connection and ensure the backend server is running.'
      } else if (err.isEndpointUnavailable || err.response?.status === 404) {
        errorMessage = 'Login service is temporarily unavailable. Please try again later.'
      } else if (err.response?.status === 401) {
        errorMessage = err.response?.data?.message || 'Invalid email or password. Please try again.'
      } else if (err.response?.status >= 500) {
        errorMessage = 'Server error. Please try again later or contact support.'
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message
      }
      
      console.error('Login error:', {
        message: errorMessage,
        status: err.response?.status,
        data: err.response?.data,
        isNetworkError: err.isNetworkError,
        isEndpointUnavailable: err.isEndpointUnavailable,
      })
      
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Login">
      <form onSubmit={handleSubmit} className="space-y-4">
        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2">
            <CheckCircle className="text-green-600" size={20} />
            <p className="text-sm text-green-800">Login successful! Redirecting...</p>
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
            Password <span className="text-red-500">*</span>
          </label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-400 focus:border-teal-500"
            placeholder="Enter your password"
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
            {loading ? 'Logging in...' : 'Login'}
          </Button>
        </div>

        <div className="text-center pt-2 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            Don't have an account?{' '}
            <button
              type="button"
              onClick={onSwitchToRegister}
              className="text-teal-600 hover:text-teal-700 font-medium"
            >
              Register here
            </button>
          </p>
        </div>
      </form>
    </Modal>
  )
}

export default LoginModal


