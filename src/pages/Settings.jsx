import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'
import Card from '../components/Card'
import Button from '../components/Button'
import { User, Lock, Bell, Globe } from 'lucide-react'

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
          </div>
        </main>
      </div>
    </div>
  )
}

export default Settings

