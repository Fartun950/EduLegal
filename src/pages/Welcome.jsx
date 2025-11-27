import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'
import Card from '../components/Card'
import Button from '../components/Button'
import LoginModal from '../components/LoginModal'
import RegisterModal from '../components/RegisterModal'
import { FileText, User, HelpCircle, Shield, ArrowRight } from 'lucide-react'

const Welcome = ({ forceLoginOpen = false }) => {
  const location = useLocation()
  const [loginModalOpen, setLoginModalOpen] = useState(false)
  const [registerModalOpen, setRegisterModalOpen] = useState(false)
  // Store intended destination persistently - don't clear on modal close
  const [intendedDestination, setIntendedDestination] = useState(null)

  // Auto-open login modal if forceLoginOpen prop is true or if navigating from role switcher
  useEffect(() => {
    if (forceLoginOpen || location.state?.showLogin) {
      // Store intended destination from navigation state
      if (location.state?.from?.pathname || location.state?.intendedRole) {
        setIntendedDestination({
          path: location.state?.from?.pathname,
          role: location.state?.intendedRole,
        })
      }
      setLoginModalOpen(true)
    }
  }, [forceLoginOpen, location.state?.showLogin, location.state?.from, location.state?.intendedRole])

  // Listen for role switcher clicks even when already on welcome page
  // This ensures modal reopens if user closes it and clicks again
  useEffect(() => {
    // Clear any stale sessionStorage on mount (prevents modal on page refresh)
    sessionStorage.removeItem('pendingLoginIntent')
    
    const handleOpenLoginModal = (event) => {
      const intent = event.detail
      if (intent) {
        setIntendedDestination({
          path: intent.path,
          role: intent.role,
        })
        setLoginModalOpen(true)
      }
    }

    // Listen for custom event from RoleSwitcher (only way to trigger modal after mount)
    window.addEventListener('openLoginModal', handleOpenLoginModal)
    
    return () => {
      window.removeEventListener('openLoginModal', handleOpenLoginModal)
    }
  }, [])

  const resources = [
    {
      icon: FileText,
      title: 'How to File a Case',
      description: 'Step-by-step guide on submitting a legal complaint',
    },
    {
      icon: User,
      title: 'Know Your Rights',
      description: 'Understand your legal rights as a student',
    },
    {
      icon: HelpCircle,
      title: 'Frequently Asked Questions',
      description: 'Common questions and answers about the legal process',
    },
  ]

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Use 'guest' role for consistency with other public pages (Settings, Resources) */}
      {/* Since guestNavItems now matches studentNavItems, both work, but 'guest' is more accurate for public routes */}
      <Sidebar userRole="guest" />
      <div className="flex-1 lg:ml-64 flex flex-col">
        <Header title="Welcome" userName="Guest" userRole="guest" />
        <main className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-5xl mx-auto space-y-8">
            {/* Welcome Section */}
            <Card>
              <div className="text-center py-12">
                <h1 className="text-5xl font-bold text-gray-900 mb-6">
                  Welcome to EduLegal System
                </h1>
                <div className="border-b-2 border-primary-300 w-24 mx-auto mb-10"></div>
                <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
                  Your trusted platform for legal support and complaint resolution.
                  We provide comprehensive legal services, generative AI solutions,
                  and ensure fair treatment for all students.
                </p>
                <Link to="/complaint">
                  <Button variant="cta" size="lg" className="group">
                    Submit a Complaint
                    <ArrowRight size={20} className="inline ml-2 icon-hover group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>
            </Card>

            {/* Legal Awareness Resources */}
            <Card title="Legal Awareness Resources">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {resources.map((resource, index) => {
                  const Icon = resource.icon
                  const resourcePath = index === 1 ? '/resources' : index === 0 ? '/complaint' : '/resources'
                  const bgColors = ['bg-blue-50', 'bg-teal-50', 'bg-amber-50']
                  const borderColors = ['border-blue-100', 'border-teal-100', 'border-amber-100']
                  const iconColors = ['text-blue-600', 'text-teal-600', 'text-amber-600']
                  const iconBgColors = ['bg-blue-100', 'bg-teal-100', 'bg-amber-100']
                  
                  return (
                    <Link
                      key={index}
                      to={resourcePath}
                      className={`p-8 border-2 ${borderColors[index]} rounded-lg ${bgColors[index]} hover:shadow-card-hover transition-all duration-300 cursor-pointer group card-hover`}
                    >
                      <div className={`w-14 h-14 ${iconBgColors[index]} rounded-lg flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                        <Icon size={28} className={iconColors[index]} />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">
                        {resource.title}
                      </h3>
                      <p className="text-sm text-gray-600 leading-relaxed">{resource.description}</p>
                    </Link>
                  )
                })}
              </div>
            </Card>

            {/* Quick Actions */}
            <Card title="Quick Actions">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Link to="/complaint">
                  <div className="p-8 border-2 border-secondary-300 rounded-card bg-secondary-50/30 hover:border-secondary-500 hover:bg-secondary-50 hover:shadow-card-hover transition-all duration-300 cursor-pointer card-hover">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                          File a Complaint
                        </h3>
                        <p className="text-sm text-gray-600 leading-relaxed">
                          Submit a new legal complaint or issue
                        </p>
                      </div>
                      <ArrowRight size={28} className="text-secondary-600 icon-hover ml-4 flex-shrink-0" />
                    </div>
                  </div>
                </Link>
                <Link to="/resources">
                  <div className="p-8 border-2 border-blue-200 rounded-card bg-blue-50/30 hover:border-blue-400 hover:bg-blue-50 hover:shadow-card-hover transition-all duration-300 cursor-pointer card-hover">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                          Resources & Support
                        </h3>
                        <p className="text-sm text-gray-600 leading-relaxed">
                          Access helpful guides, support services, and information
                        </p>
                      </div>
                      <FileText size={28} className="text-blue-600 icon-hover ml-4 flex-shrink-0" />
                    </div>
                  </div>
                </Link>
              </div>
            </Card>

            {/* Security Notice */}
            <Card>
              <div className="flex gap-6 p-6 bg-teal-50 rounded-lg border-2 border-teal-100 shadow-sm">
                <Shield size={32} className="text-teal-600 flex-shrink-0" />
                <div>
                  <h3 className="text-lg font-semibold text-teal-900 mb-2">
                    Your Privacy Matters
                  </h3>
                  <p className="text-sm text-teal-800 leading-relaxed">
                    All submissions are handled with strict confidentiality.
                    You can choose to submit anonymously if you prefer.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </main>
      </div>

      {/* Login Modal */}
      <LoginModal
        isOpen={loginModalOpen}
        onClose={() => {
          setLoginModalOpen(false)
          // Don't clear intendedDestination - keep it for next attempt
        }}
        onSwitchToRegister={() => {
          setLoginModalOpen(false)
          setRegisterModalOpen(true)
        }}
        intendedDestination={intendedDestination}
        onLoginSuccess={() => {
          // Clear intended destination only after successful login
          setIntendedDestination(null)
        }}
      />

      {/* Register Modal */}
      <RegisterModal
        isOpen={registerModalOpen}
        onClose={() => setRegisterModalOpen(false)}
        onSwitchToLogin={() => {
          setRegisterModalOpen(false)
          setLoginModalOpen(true)
        }}
      />
    </div>
  )
}

export default Welcome

