import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { caseService } from '../services/caseService'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'
import Card from '../components/Card'
import Button from '../components/Button'
import { User, Lock, Bell, Globe, Trash2, FileText, AlertCircle, CheckCircle } from 'lucide-react'

const Settings = () => {
  const { user, isAuthenticated } = useAuth()
  
  // Determine user role and default values based on authentication
  const userRole = user?.role || 'guest'
  const userName = user?.name || (isAuthenticated ? 'User' : 'Guest')
  const userEmail = user?.email || (isAuthenticated ? 'user@edulegal.edu' : 'guest@edulegal.edu')
  
  const [settings, setSettings] = useState({
    name: userName,
    email: userEmail,
    notifications: true,
    passwordChange: false,
    language: 'en',
  })

  // State for Manage Complaints section (guest only)
  const [myCases, setMyCases] = useState([])
  const [loadingCases, setLoadingCases] = useState(false)
  const [deletingCaseId, setDeletingCaseId] = useState(null)
  const [toastMessage, setToastMessage] = useState(null)

  // Fetch user's cases if authenticated and guest role
  useEffect(() => {
    if (isAuthenticated && userRole === 'guest') {
      fetchMyCases()
    }
  }, [isAuthenticated, userRole])

  const fetchMyCases = async () => {
    if (!isAuthenticated) return
    setLoadingCases(true)
    try {
      const response = await caseService.getMyCases()
      if (response.success) {
        setMyCases(response.data?.cases || [])
      }
    } catch (error) {
      console.error('Error fetching my cases:', error)
      setToastMessage({
        type: 'error',
        message: 'Failed to load your complaints. Please try again.',
      })
      setTimeout(() => setToastMessage(null), 5000)
    } finally {
      setLoadingCases(false)
    }
  }

  const handleDeleteCase = async (caseId) => {
    if (!window.confirm('Are you sure you want to delete this complaint? This action cannot be undone.')) {
      return
    }

    setDeletingCaseId(caseId)
    try {
      const response = await caseService.deleteCase(caseId)
      if (response.success) {
        setToastMessage({
          type: 'success',
          message: 'Complaint deleted successfully!',
        })
        // Refresh the list
        await fetchMyCases()
      }
    } catch (error) {
      console.error('Error deleting case:', error)
      const errorMessage = error.response?.data?.message || error.message || 'Failed to delete complaint'
      setToastMessage({
        type: 'error',
        message: errorMessage,
      })
    } finally {
      setDeletingCaseId(null)
      setTimeout(() => setToastMessage(null), 5000)
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setSettings((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleSave = async () => {
    try {
      // In a real app, this would save to backend
      // For now, save to localStorage as a placeholder
      localStorage.setItem('userSettings', JSON.stringify(settings))
      console.log('Saving settings:', settings)
      alert('Settings saved successfully!')
    } catch (err) {
      console.error('Error saving settings:', err)
      alert('Failed to save settings: ' + (err.message || 'Unknown error'))
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar userRole={userRole === 'admin' ? 'admin' : userRole === 'officer' ? 'officer' : 'guest'} />
      <div className="flex-1 lg:ml-64">
        <Header title="Settings" userName={userName} userRole={userRole} />
        <main className="p-6">
          <div className="max-w-3xl mx-auto space-y-6">
            {/* Profile Settings */}
            <Card title="Profile Settings">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={settings.name}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={settings.email}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div className="flex justify-end">
                  <Button variant="primary" onClick={handleSave}>
                    Save Changes
                  </Button>
                </div>
              </div>
            </Card>

            {/* Account Preferences */}
            <Card title="Account Preferences">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Bell size={20} className="text-gray-600" />
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Email Notifications
                      </label>
                      <p className="text-xs text-gray-500">
                        Receive email updates about your cases
                      </p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      name="notifications"
                      checked={settings.notifications}
                      onChange={handleChange}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Lock size={20} className="text-gray-600" />
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Change Password
                      </label>
                      <p className="text-xs text-gray-500">
                        Update your account password
                      </p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      name="passwordChange"
                      checked={settings.passwordChange}
                      onChange={handleChange}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Globe size={16} className="inline mr-2" />
                    Language
                  </label>
                  <select
                    name="language"
                    value={settings.language}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                  </select>
                </div>
              </div>
            </Card>

            {/* Security Settings */}
            <Card title="Security">
              <div className="space-y-4">
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => {
                    alert('Password change feature coming soon. This will allow you to update your account password securely.')
                  }}
                >
                  <Lock size={16} className="inline mr-2" />
                  Change Password
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => {
                    alert('Two-factor authentication feature coming soon. This will add an extra layer of security to your account.')
                  }}
                >
                  <User size={16} className="inline mr-2" />
                  Two-Factor Authentication
                </Button>
              </div>
            </Card>

            {/* Manage Complaints - Guest Only */}
            {isAuthenticated && userRole === 'guest' && (
              <Card title="Manage Complaints">
                <div className="space-y-4">
                  {loadingCases ? (
                    <div className="text-center py-8 text-gray-600">
                      Loading your complaints...
                    </div>
                  ) : myCases.length === 0 ? (
                    <div className="text-center py-8 text-gray-600">
                      <FileText size={48} className="mx-auto mb-4 text-gray-400" />
                      <p>You haven't submitted any complaints yet.</p>
                      <p className="text-sm text-gray-500 mt-2">
                        Go to the home page to submit a new complaint.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {myCases.map((complaint) => (
                        <div
                          key={complaint._id}
                          className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                        >
                              <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-gray-900 mb-1">
                                {complaint.title}
                              </h3>
                              <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                                {complaint.description}
                              </p>
                              <div className="flex items-center gap-4 text-xs text-gray-500 flex-wrap">
                                <span>Category: {complaint.category}</span>
                                <span>Status: {complaint.status}</span>
                                <span>
                                  {new Date(complaint.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                            <div className="flex-shrink-0">
                              {complaint.status === 'open' ? (
                                <Button
                                  variant="danger"
                                  size="sm"
                                  onClick={() => handleDeleteCase(complaint._id)}
                                  disabled={deletingCaseId === complaint._id}
                                >
                                  {deletingCaseId === complaint._id ? (
                                    'Deleting...'
                                  ) : (
                                    <>
                                      <Trash2 size={16} className="inline mr-1" />
                                      Delete
                                    </>
                                  )}
                                </Button>
                              ) : (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  disabled
                                  title="Cannot delete complaint. Only new complaints (status: open) can be deleted."
                                >
                                  <AlertCircle size={16} className="inline mr-1" />
                                  Cannot Delete
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </Card>
            )}

            {/* Toast Notification */}
            {toastMessage && (
              <div
                className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 ${
                  toastMessage.type === 'success'
                    ? 'bg-green-500 text-white'
                    : 'bg-red-500 text-white'
                }`}
              >
                <div className="flex items-center gap-2">
                  {toastMessage.type === 'success' ? (
                    <CheckCircle size={20} />
                  ) : (
                    <AlertCircle size={20} />
                  )}
                  <span>{toastMessage.message}</span>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}

export default Settings

