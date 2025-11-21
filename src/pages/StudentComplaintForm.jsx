import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { caseService } from '../services/caseService'
import { getRoleFromPath } from '../utils/roleUtils'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'
import RoleSwitcher from '../components/RoleSwitcher'
import Card from '../components/Card'
import Button from '../components/Button'
import { Upload, FileText, Shield, CheckCircle, AlertCircle } from 'lucide-react'

const StudentComplaintForm = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, isAuthenticated } = useAuth()
  const [formData, setFormData] = useState({
    name: '',
    gender: '',
    title: '',
    category: '',
    description: '',
    priority: 'medium',
    anonymous: false,
    files: [],
  })
  const [submitted, setSubmitted] = useState(false)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState([])

  // Determine current role based on pathname and sessionStorage
  const [currentRole, setCurrentRole] = useState(() => {
    if (typeof window === 'undefined') return 'guest'
    
    // Check sessionStorage first for complaint page
    if (location.pathname.startsWith('/complaint')) {
      const storedRole = sessionStorage.getItem('userRole')
      if (storedRole === 'admin' || storedRole === 'officer') {
        return storedRole
      }
    }
    
    // Get role from pathname
    return getRoleFromPath(location.pathname)
  })

  // Update role when location changes
  useEffect(() => {
    if (typeof window === 'undefined') return
    
    const roleFromPath = getRoleFromPath(location.pathname)
    
    if (roleFromPath === 'admin') {
      sessionStorage.setItem('userRole', 'admin')
      setCurrentRole('admin')
    } else if (roleFromPath === 'officer') {
      sessionStorage.setItem('userRole', 'officer')
      setCurrentRole('officer')
    } else if (location.pathname.startsWith('/complaint')) {
      const storedRole = sessionStorage.getItem('userRole')
      if (storedRole === 'admin' || storedRole === 'officer') {
        setCurrentRole(storedRole)
      } else {
        setCurrentRole('guest')
      }
    } else {
      setCurrentRole(roleFromPath)
    }
  }, [location.pathname])

  // Fetch categories from backend
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await caseService.getCategories()
        if (response.success && response.data.categories) {
          // Map backend categories to display names
          const categoryMap = {
            'harassment': 'Harassment',
            'academicIssue': 'Academic Issue',
            'bullying': 'Bullying',
            'discrimination': 'Discrimination',
            'gradeAppeal': 'Grade Appeal',
            'other': 'Other',
            'staffScenario': 'Staff Scenario',
            'workplaceHarassment': 'Workplace Harassment (Staff)',
            'sexualHarassment': 'Sexual Harassment (Staff)',
            'staffMisconduct': 'Staff Misconduct',
            'staffConflict': 'Staff Conflict',
            'discriminationStaff': 'Discrimination (Staff)',
            'breachConfidentiality': 'Breach of Confidentiality',
            'fraudCorruption': 'Fraud/Corruption',
            'abuseOfPower': 'Abuse of Power',
            'unfairWorkload': 'Unfair Workload',
            'workplaceSafety': 'Workplace Safety Issues',
            'legal': 'Legal',
          }
          setCategories(response.data.categories.map(cat => ({
            value: cat,
            label: categoryMap[cat] || cat,
          })))
        }
      } catch (error) {
        console.error('Error fetching categories:', error)
        // Fallback categories if API fails
        setCategories([
          { value: 'harassment', label: 'Harassment' },
          { value: 'academicIssue', label: 'Academic Issue' },
          { value: 'bullying', label: 'Bullying' },
          { value: 'discrimination', label: 'Discrimination' },
          { value: 'gradeAppeal', label: 'Grade Appeal' },
          { value: 'other', label: 'Other' },
        ])
      }
    }
    fetchCategories()
  }, [])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files)
    setFormData((prev) => ({
      ...prev,
      files: [...prev.files, ...files],
    }))
  }

  const removeFile = (index) => {
    setFormData((prev) => ({
      ...prev,
      files: prev.files.filter((_, i) => i !== index),
    }))
  }

  const validate = () => {
    const newErrors = {}
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required'
    }
    if (!formData.category) {
      newErrors.category = 'Category is required'
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required'
    }
    if (formData.description.trim().length < 20) {
      newErrors.description = 'Description must be at least 20 characters'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    setLoading(true)
    setErrors({})

    try {
      // Prepare case data - map display category back to backend format
      const caseData = {
        name: formData.name?.trim() || null,
        gender: formData.gender || null,
        title: formData.title,
        description: formData.description,
        category: formData.category, // Already in backend format
        priority: formData.priority || 'medium',
        role: isAuthenticated ? user?.role : 'guest',
      }

      // Submit case - backend accepts both authenticated and guest submissions
      const response = await caseService.createCase(caseData)

      if (response.success) {
        setSubmitted(true)
        setTimeout(() => {
          navigate('/welcome')
        }, 3000)
      }
    } catch (error) {
      console.error('Error submitting complaint:', error)
      const errorMessage = error.response?.data?.message || error.message || 'Failed to submit complaint. Please try again.'
      setErrors({
        submit: errorMessage,
      })
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar userRole="student" />
      <div className="flex-1 lg:ml-64 flex flex-col">
        <Header title="Complaint Submitted" userName="Student" userRole="student" />
          <main className="flex-1 p-6 overflow-y-auto">
            <Card className="max-w-2xl mx-auto">
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle size={32} className="text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Complaint Submitted Successfully
                </h2>
                <p className="text-gray-600 mb-6">
                  Your complaint has been received and will be reviewed by our legal team.
                  {formData.anonymous && (
                    <span className="block mt-2 text-sm">
                      Your submission is anonymous as requested.
                    </span>
                  )}
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <p className="text-sm text-blue-800">
                    <strong>What happens next?</strong>
                  </p>
                  <ul className="text-sm text-blue-700 mt-2 text-left list-disc list-inside space-y-1">
                    <li>Your complaint will be reviewed within 24-48 hours</li>
                    <li>You will receive updates via email (if not anonymous)</li>
                    <li>A case number will be assigned and shared with you</li>
                  </ul>
                </div>
                <Button variant="primary" onClick={() => navigate('/welcome')}>
                  Return to Home
                </Button>
              </div>
            </Card>
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar userRole="student" />
      <div className="flex-1 lg:ml-64 flex flex-col">
        <Header title="Submit Complaint" userName="Student" userRole="student" />
        <main className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-3xl mx-auto">
            <Card>
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <Shield size={20} className="text-blue-600" />
                  <h1 className="text-2xl font-bold text-gray-900">File a Complaint</h1>
                </div>
                <p className="text-gray-600">
                  Submit your complaint securely. All information is confidential.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Optional Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Name <span className="text-gray-400 text-xs">(optional)</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-400 focus:border-teal-500 border-gray-300"
                    placeholder="Enter your name (optional)"
                  />
                </div>

                {/* Optional Gender */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gender <span className="text-gray-400 text-xs">(optional)</span>
                  </label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-400 focus:border-teal-500 border-gray-300"
                  >
                    <option value="">Select gender (optional)</option>
                    <option value="female">Female</option>
                    <option value="male">Male</option>
                    <option value="non-binary">Non-binary</option>
                    <option value="prefer-not-to-say">Prefer not to say</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Complaint Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-400 focus:border-teal-500 ${
                      errors.title ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Brief title for your complaint"
                  />
                  {errors.title && (
                    <p className="mt-1 text-sm text-red-600">{errors.title}</p>
                  )}
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-400 focus:border-teal-500 ${
                      errors.category ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select a category</option>
                    {categories.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                  {errors.category && (
                    <p className="mt-1 text-sm text-red-600">{errors.category}</p>
                  )}
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="6"
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-400 focus:border-teal-500 ${
                      errors.description ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Provide detailed information about your complaint..."
                  />
                  {errors.description && (
                    <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">
                    Minimum 20 characters. Current: {formData.description.length}
                  </p>
                </div>

                {/* File Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Supporting Documents (Optional)
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-cyan-400 transition-smooth">
                    <Upload size={32} className="mx-auto text-gray-400 mb-2" />
                    <label className="cursor-pointer">
                      <span className="text-cyan-600 hover:text-cyan-700 font-medium">
                        Click to upload
                      </span>
                      <span className="text-gray-600"> or drag and drop</span>
                      <input
                        type="file"
                        multiple
                        onChange={handleFileChange}
                        className="hidden"
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                      />
                    </label>
                    <p className="text-xs text-gray-500 mt-2">
                      PDF, DOC, DOCX, JPG, PNG (Max 10MB per file)
                    </p>
                  </div>
                  {formData.files.length > 0 && (
                    <div className="mt-4 space-y-2">
                      {formData.files.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="flex items-center gap-2">
                            <FileText size={18} className="text-blue-600" />
                            <span className="text-sm text-gray-700">{file.name}</span>
                            <span className="text-xs text-gray-500">
                              ({(file.size / 1024).toFixed(2)} KB)
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeFile(index)}
                            className="text-red-600 hover:text-red-700 text-sm"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Anonymous Toggle */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Shield size={20} className="text-gray-600" />
                    <div>
                      <label className="text-sm font-medium text-gray-700 cursor-pointer">
                        Submit Anonymously
                      </label>
                      <p className="text-xs text-gray-500">
                        Your identity will be kept confidential
                      </p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      name="anonymous"
                      checked={formData.anonymous}
                      onChange={handleChange}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-500"></div>
                  </label>
                </div>

                {/* Info Alert */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
                  <AlertCircle size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">Important Information</p>
                    <ul className="list-disc list-inside space-y-1 text-blue-700">
                      <li>All complaints are treated with strict confidentiality</li>
                      <li>False complaints may result in disciplinary action</li>
                      <li>You will receive a case number for tracking</li>
                    </ul>
                  </div>
                </div>

                {/* Error Message */}
                {errors.submit && (
                  <div className="border rounded-lg p-4 bg-red-50 border-red-200">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="text-red-600" size={20} />
                      <div className="flex-1">
                        <p className="text-sm text-red-800">
                          {errors.submit}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => navigate('/welcome')}
                    className="flex-1"
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary" className="flex-1" disabled={loading}>
                    {loading ? 'Submitting...' : 'Submit Complaint'}
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}

export default StudentComplaintForm

