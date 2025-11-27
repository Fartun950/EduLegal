import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Card from '../components/Card'
import Button from '../components/Button'
import { AlertCircle, CheckCircle } from 'lucide-react'
import { getDashboardPathForRole, ROUTES } from '../config/routes'
import auditService from '../services/auditService'

const Login = () => {
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
        
        // Normalize role naming
        if (role === 'legalOfficer') {
          role = 'legal'
        }

        // Log successful login
        const userId = response.user?.id || response.userId || 'unknown'
        auditService.logLogin(userId, role)

        // Determine redirect path
        let redirectPath = ROUTES.WELCOME
        const fromPath = location.state?.from?.pathname

        if (fromPath) {
          redirectPath = fromPath
        } else {
          // Use centralized route configuration
          redirectPath = getDashboardPathForRole(role)
        }

        // Clear old intended paths
        localStorage.removeItem('intendedDashboard')
        localStorage.removeItem('intendedRole')

        // Log redirect
        auditService.logRedirect(ROUTES.LOGIN, redirectPath, 'Post-login redirect')

        setFormData({ email: '', password: '' })
        
        // Redirect after short delay
        setTimeout(() => {
          navigate(redirectPath, { replace: true })
        }, 1000)
      }
    } catch (err) {
      // Handle different error types
      let errorMessage = 'Login failed. Please check your credentials.'
      let reason = 'Unknown error'
      
      if (err.isNetworkError || !err.response) {
        errorMessage = 'Unable to connect to the server. Please check your internet connection.'
        reason = 'Network error'
      } else if (err.response?.status === 401) {
        errorMessage = err.response?.data?.message || 'Invalid email or password.'
        reason = 'Invalid credentials'
      } else if (err.response?.status >= 500) {
        errorMessage = 'Server error. Please try again later.'
        reason = 'Server error'
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message
        reason = err.response.data.message
      }
      
      // Log failed login attempt
      auditService.logLoginFailure(formData.email, reason)
      
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-50 items-center justify-center p-6">
      <div className="w-full max-w-md">
        <Card title="Login to EduLegal System">
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Enter your password"
              />
            </div>

            <div className="pt-4">
              <Button
                type="submit"
                variant="primary"
                className="w-full"
                disabled={loading}
              >
                {loading ? 'Logging in...' : 'Login'}
              </Button>
            </div>

            <div className="text-center pt-2">
              <p className="text-sm text-gray-600">
                For Legal Officers and Administrators only
              </p>
            </div>
          </form>
        </Card>
      </div>
    </div>
  )
}

export default Login



