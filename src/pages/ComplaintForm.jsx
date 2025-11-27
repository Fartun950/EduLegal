import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { complaintService } from '../services/complaintService'
import { caseService } from '../services/caseService'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'
import Card from '../components/Card'
import Button from '../components/Button'
import { AlertCircle, CheckCircle, X, Paperclip } from 'lucide-react'

const ComplaintForm = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    reporterType: 'student', // Default to student
    reporterName: '',
    reporterEmail: '',
    title: '',
    category: '',
    description: '',
    priority: 'medium',
  })
  const [submitted, setSubmitted] = useState(false)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState([])
  const [attachments, setAttachments] = useState([]) // Array of File objects

  // Fetch categories from backend
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await caseService.getCategories()
        if (response.success && response.data.categories) {
          setCategories(response.data.categories)
        }
      } catch (error) {
        console.error('Error fetching categories:', error)
      }
    }
    fetchCategories()
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    
    // Clear errors when user types
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }

    // If reporterType changes to anonymous, clear name and email
    if (name === 'reporterType' && value === 'anonymous') {
      setFormData((prev) => ({
        ...prev,
        reporterType: 'anonymous',
        reporterName: '',
        reporterEmail: '',
      }))
    }
  }

  const validate = () => {
    const newErrors = {}

    // Validate reporterType
    if (!formData.reporterType) {
      newErrors.reporterType = 'Reporter type is required'
    }

    // Conditional validation based on reporterType
    if (formData.reporterType === 'student' || formData.reporterType === 'staff') {
      if (!formData.reporterName || formData.reporterName.trim() === '') {
        newErrors.reporterName = 'Reporter name is required for student and staff submissions'
      }
      // Email is optional, but if provided, should be valid
      if (formData.reporterEmail && formData.reporterEmail.trim() !== '') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(formData.reporterEmail)) {
          newErrors.reporterEmail = 'Please enter a valid email address'
        }
      }
    }
    // For anonymous, name and email are not required

    // Validate common fields
    if (!formData.title || formData.title.trim() === '') {
      newErrors.title = 'Title is required'
    }

    if (!formData.description || formData.description.trim() === '') {
      newErrors.description = 'Description is required'
    }

    if (!formData.category) {
      newErrors.category = 'Category is required'
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
      // Prepare complaint data
      const complaintData = {
        reporterType: formData.reporterType,
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category,
        priority: formData.priority || 'medium',
      }

      // Only include name and email if not anonymous
      if (formData.reporterType !== 'anonymous') {
        complaintData.reporterName = formData.reporterName.trim()
        if (formData.reporterEmail && formData.reporterEmail.trim() !== '') {
          complaintData.reporterEmail = formData.reporterEmail.trim()
        }
      }

      // Submit complaint with file attachments
      const filesToUpload = attachments.length > 0 ? attachments : null
      const response = await complaintService.submitComplaint(complaintData, filesToUpload)

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

  // Determine if name/email fields should be shown
  const showReporterFields = formData.reporterType !== 'anonymous'

  // Handle file selection
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files)
    
    // Validate file count (max 5 files)
    if (attachments.length + files.length > 5) {
      setErrors((prev) => ({
        ...prev,
        attachments: 'Maximum 5 files allowed',
      }))
      return
    }

    // Validate file sizes (max 10MB per file)
    const invalidFiles = files.filter(file => file.size > 10 * 1024 * 1024)
    if (invalidFiles.length > 0) {
      setErrors((prev) => ({
        ...prev,
        attachments: 'File size must be less than 10MB',
      }))
      return
    }

    // Add new files to attachments
    setAttachments((prev) => [...prev, ...files])
    setErrors((prev) => {
      const newErrors = { ...prev }
      delete newErrors.attachments
      return newErrors
    })
  }

  // Handle file removal
  const handleRemoveFile = (index) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index))
  }

  // Format file size for display
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  if (submitted) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar userRole="guest" />
        <div className="flex-1 lg:ml-64 flex flex-col">
          <Header title="Submit Complaint" userName="Guest" userRole="guest" />
          <main className="flex-1 p-6 overflow-y-auto">
            <div className="max-w-2xl mx-auto">
              <Card>
                <div className="text-center py-12">
                  <CheckCircle size={64} className="mx-auto mb-4 text-green-500" />
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Complaint Submitted Successfully!</h2>
                  <p className="text-gray-600 mb-4">
                    Thank you for your submission. Your complaint has been received and will be reviewed.
                  </p>
                  <p className="text-sm text-gray-500">Redirecting to home page...</p>
                </div>
              </Card>
            </div>
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar userRole="guest" />
      <div className="flex-1 lg:ml-64 flex flex-col">
        <Header title="Submit Complaint" userName="Guest" userRole="guest" />
        <main className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-2xl mx-auto">
            <Card title="File a Complaint">
              <form onSubmit={handleSubmit} className="space-y-6">
                {errors.submit && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2">
                    <AlertCircle className="text-red-600" size={20} />
                    <p className="text-sm text-red-800">{errors.submit}</p>
                  </div>
                )}

                {/* Reporter Type Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reporter Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="reporterType"
                    value={formData.reporterType}
                    onChange={handleChange}
                    required
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                      errors.reporterType ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="student">Student</option>
                    <option value="staff">Staff</option>
                    <option value="anonymous">Anonymous</option>
                  </select>
                  {errors.reporterType && (
                    <p className="mt-1 text-sm text-red-600">{errors.reporterType}</p>
                  )}
                </div>

                {/* Conditional Reporter Name Field */}
                {showReporterFields && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Reporter Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="reporterName"
                      value={formData.reporterName}
                      onChange={handleChange}
                      required={showReporterFields}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                        errors.reporterName ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter your full name"
                    />
                    {errors.reporterName && (
                      <p className="mt-1 text-sm text-red-600">{errors.reporterName}</p>
                    )}
                  </div>
                )}

                {/* Conditional Reporter Email Field */}
                {showReporterFields && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Reporter Email <span className="text-gray-500">(Optional)</span>
                    </label>
                    <input
                      type="email"
                      name="reporterEmail"
                      value={formData.reporterEmail}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                        errors.reporterEmail ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="your.email@example.com"
                    />
                    {errors.reporterEmail && (
                      <p className="mt-1 text-sm text-red-600">{errors.reporterEmail}</p>
                    )}
                  </div>
                )}

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
                    required
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                      errors.title ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Brief title describing your complaint"
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
                    required
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                      errors.category ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select a category</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
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
                    required
                    rows={6}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                      errors.description ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Provide detailed information about your complaint..."
                  />
                  {errors.description && (
                    <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                  )}
                </div>

                {/* Priority */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priority
                  </label>
                  <select
                    name="priority"
                    value={formData.priority}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                {/* File Attachments */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Evidence/Attachments <span className="text-gray-500">(Optional)</span>
                  </label>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <label className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                        <Paperclip size={18} className="text-gray-600" />
                        <span className="text-sm text-gray-700">Choose Files</span>
                        <input
                          type="file"
                          multiple
                          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.txt,.mp4,.mpeg,.mp3,.wav"
                          onChange={handleFileChange}
                          className="hidden"
                          disabled={loading || attachments.length >= 5}
                        />
                      </label>
                      <span className="text-xs text-gray-500">
                        Max 5 files, 10MB each (PDF, DOC, DOCX, Images, Audio, Video)
                      </span>
                    </div>

                    {errors.attachments && (
                      <p className="text-sm text-red-600">{errors.attachments}</p>
                    )}

                    {/* Display selected files */}
                    {attachments.length > 0 && (
                      <div className="space-y-2">
                        {attachments.map((file, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg"
                          >
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <Paperclip size={18} className="text-gray-600 flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                  {file.name}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {formatFileSize(file.size)}
                                </p>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveFile(index)}
                              className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                              disabled={loading}
                            >
                              <X size={18} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex gap-4 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/welcome')}
                    className="flex-1"
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    className="flex-1"
                    disabled={loading}
                  >
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

export default ComplaintForm

