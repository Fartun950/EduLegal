import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'
import Card from '../components/Card'
import Button from '../components/Button'
import LoginModal from '../components/LoginModal'
import RegisterModal from '../components/RegisterModal'
import { FileText, User, HelpCircle, Shield, ArrowRight } from 'lucide-react'

const Welcome = ({ forceLoginOpen = false }) => {
  const [loginModalOpen, setLoginModalOpen] = useState(false)
  const [registerModalOpen, setRegisterModalOpen] = useState(false)

  // Auto-open login modal if forceLoginOpen prop is true
  useEffect(() => {
    if (forceLoginOpen) {
      setLoginModalOpen(true)
    }
  }, [forceLoginOpen])

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
      <Sidebar userRole="student" />
      <div className="flex-1 lg:ml-64 flex flex-col">
        <Header title="Welcome" userName="Student" userRole="student" />
        <main className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Welcome Section */}
            <Card>
                  <div className="text-center py-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">
                      Welcome to EduLegal System
                    </h1>
                    <div className="border-b-2 border-primary-300 w-full mb-8"></div>
                    <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
                      Your trusted platform for legal support and complaint resolution.
                      We provide comprehensive legal services, generative AI solutions,
                      and ensure fair treatment for all students.
                    </p>
                    <Link to="/complaint">
                      <Button variant="primary" size="lg" className="group">
                        Submit a Complaint
                        <ArrowRight size={20} className="inline ml-2 icon-hover group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                  </div>
                </Card>

            {/* Legal Awareness Resources */}
            <Card title="Legal Awareness Resources">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {resources.map((resource, index) => {
                  const Icon = resource.icon
                  const resourcePath = index === 1 ? '/resources' : index === 0 ? '/complaint' : '/resources'
                  return (
                    <Link
                      key={index}
                      to={resourcePath}
                      className="p-6 border border-gray-200 rounded-lg hover:shadow-md transition-smooth cursor-pointer group"
                    >
                      <div className="w-12 h-12 bg-primary-50 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary-100 transition-smooth icon-hover">
                        <Icon size={24} className="text-primary-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {resource.title}
                      </h3>
                      <p className="text-sm text-gray-600">{resource.description}</p>
                    </Link>
                  )
                })}
              </div>
            </Card>

            {/* Quick Actions */}
            <Card title="Quick Actions">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link to="/complaint">
                  <div className="p-6 border-2 border-primary-200 rounded-card hover:border-primary-400 hover:bg-primary-50 transition-smooth cursor-pointer card-hover">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          File a Complaint
                        </h3>
                        <p className="text-sm text-gray-600">
                          Submit a new legal complaint or issue
                        </p>
                      </div>
                      <ArrowRight size={24} className="text-primary-600 icon-hover" />
                    </div>
                  </div>
                </Link>
                  <Link to="/resources">
                    <div className="p-6 border-2 border-secondary-200 rounded-card hover:border-secondary-400 hover:bg-secondary-50 transition-smooth cursor-pointer card-hover">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            Resources & Support
                          </h3>
                          <p className="text-sm text-gray-600">
                            Access helpful guides, support services, and information
                          </p>
                        </div>
                        <FileText size={24} className="text-secondary-600 icon-hover" />
                      </div>
                    </div>
                  </Link>
              </div>
            </Card>

            {/* Security Notice */}
            <Card>
              <div className="flex gap-4 p-4 bg-accent-50 rounded-lg border border-accent-200">
                <Shield size={24} className="text-accent-600 flex-shrink-0 icon-hover" />
                <div>
                  <h3 className="font-semibold text-accent-900 mb-1">
                    Your Privacy Matters
                  </h3>
                  <p className="text-sm text-accent-800">
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
        onClose={() => setLoginModalOpen(false)}
        onSwitchToRegister={() => {
          setLoginModalOpen(false)
          setRegisterModalOpen(true)
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

