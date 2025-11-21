import { Link } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'
import Card from '../components/Card'
import Button from '../components/Button'
import { 
  FileText, 
  Shield, 
  BookOpen, 
  Users, 
  Phone, 
  Mail, 
  AlertCircle,
  CheckCircle,
  ArrowRight,
  HelpCircle,
  Download,
  ExternalLink
} from 'lucide-react'

const Resources = () => {
  // Resources page is fully public - no authentication required
  // Guests can access all resources and information freely
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar userRole="guest" />
      <div className="flex-1 lg:ml-64 flex flex-col">
        <Header title="Resources" userName="Guest" userRole="guest" />
        <main className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-6xl mx-auto space-y-8">
            
            {/* Page Header */}
            <div className="text-center py-6">
              <h1 className="text-4xl font-bold text-gray-900 mb-3">
                Resources & Support
              </h1>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Find helpful information, support services, and guidance for filing complaints and understanding your rights.
              </p>
            </div>

            {/* Know Your Rights Section */}
            <Card title={
              <div className="flex items-center gap-3">
                <Shield className="text-blue-600" size={24} />
                <span>Know Your Rights</span>
              </div>
            }>
              <div className="space-y-4">
                <p className="text-gray-700 mb-6">
                  Understanding your educational rights and basic protections helps ensure fair treatment for all students and staff members.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-6 bg-blue-50 rounded-lg border border-blue-100 hover:shadow-md transition-all">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <CheckCircle className="text-blue-600" size={20} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">Right to Education</h3>
                        <p className="text-sm text-gray-700">
                          All students have the right to equal access to educational opportunities regardless of background, gender, or personal characteristics.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 bg-green-50 rounded-lg border border-green-100 hover:shadow-md transition-all">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Shield className="text-green-600" size={20} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">Right to Safety</h3>
                        <p className="text-sm text-gray-700">
                          Everyone has the right to a safe and secure learning environment free from harassment, discrimination, or violence.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 bg-purple-50 rounded-lg border border-purple-100 hover:shadow-md transition-all">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Users className="text-purple-600" size={20} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">Right to Privacy</h3>
                        <p className="text-sm text-gray-700">
                          Your personal information and complaints are handled with strict confidentiality. You can choose to submit anonymously.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 bg-orange-50 rounded-lg border border-orange-100 hover:shadow-md transition-all">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <FileText className="text-orange-600" size={20} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">Right to Appeal</h3>
                        <p className="text-sm text-gray-700">
                          You have the right to appeal decisions and seek review of academic or disciplinary matters through proper channels.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Complaint Support Guide Section */}
            <Card title={
              <div className="flex items-center gap-3">
                <BookOpen className="text-teal-600" size={24} />
                <span>Complaint Support Guide</span>
              </div>
            }>
              <div className="space-y-6">
                <p className="text-gray-700">
                  Follow these steps to file a complaint effectively and ensure your concern is addressed properly.
                </p>

                <div className="space-y-4">
                  <div className="flex gap-4 p-4 bg-gray-50 rounded-lg border-l-4 border-teal-500">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-teal-500 text-white rounded-full flex items-center justify-center font-bold">
                        1
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-2">Prepare Your Information</h3>
                      <ul className="text-sm text-gray-700 space-y-1 ml-4 list-disc">
                        <li>Gather all relevant details about the incident</li>
                        <li>Note dates, times, and locations</li>
                        <li>Collect any supporting documents or evidence</li>
                        <li>Identify witnesses if applicable</li>
                      </ul>
                    </div>
                  </div>

                  <div className="flex gap-4 p-4 bg-gray-50 rounded-lg border-l-4 border-blue-500">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">
                        2
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-2">File Your Complaint</h3>
                      <ul className="text-sm text-gray-700 space-y-1 ml-4 list-disc">
                        <li>Use our secure complaint form</li>
                        <li>Provide a clear and detailed description</li>
                        <li>Select the appropriate category</li>
                        <li>Choose anonymous submission if preferred</li>
                        <li>Upload supporting documents (optional)</li>
                      </ul>
                      <Link to="/complaint" className="inline-block mt-3">
                        <Button variant="primary" size="sm">
                          Go to Complaint Form
                          <ArrowRight size={16} className="inline ml-1" />
                        </Button>
                      </Link>
                    </div>
                  </div>

                  <div className="flex gap-4 p-4 bg-gray-50 rounded-lg border-l-4 border-green-500">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-bold">
                        3
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-2">What Happens After Filing</h3>
                      <ul className="text-sm text-gray-700 space-y-1 ml-4 list-disc">
                        <li>You will receive a confirmation with a case number</li>
                        <li>Your complaint is reviewed within 24-48 hours</li>
                        <li>A legal officer is assigned to investigate</li>
                        <li>You will receive updates via email (if not anonymous)</li>
                        <li>The investigation process begins</li>
                      </ul>
                    </div>
                  </div>

                  <div className="flex gap-4 p-4 bg-gray-50 rounded-lg border-l-4 border-purple-500">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center font-bold">
                        4
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-2">Resolution Process</h3>
                      <ul className="text-sm text-gray-700 space-y-1 ml-4 list-disc">
                        <li>Thorough investigation of your complaint</li>
                        <li>Interview with relevant parties</li>
                        <li>Review of documentation and evidence</li>
                        <li>Decision and appropriate action taken</li>
                        <li>Final resolution notification</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Campus Support Services Section */}
            <Card title={
              <div className="flex items-center gap-3">
                <Users className="text-indigo-600" size={24} />
                <span>Campus Support Services</span>
              </div>
            }>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="p-6 border border-gray-200 rounded-lg hover:shadow-lg transition-all bg-white">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                    <Users className="text-blue-600" size={24} />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Counseling Services</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Professional mental health support and counseling for students and staff.
                  </p>
                  <div className="space-y-2 text-sm text-gray-700">
                    <div className="flex items-center gap-2">
                      <Phone size={16} className="text-gray-400" />
                      <span>(555) 123-4567</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail size={16} className="text-gray-400" />
                      <span>counseling@university.edu</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">Hours: Mon-Fri, 9 AM - 5 PM</p>
                  </div>
                </div>

                <div className="p-6 border border-gray-200 rounded-lg hover:shadow-lg transition-all bg-white">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                    <FileText className="text-green-600" size={24} />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Legal Aid Desk</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Free legal consultation and assistance for students facing legal issues.
                  </p>
                  <div className="space-y-2 text-sm text-gray-700">
                    <div className="flex items-center gap-2">
                      <Phone size={16} className="text-gray-400" />
                      <span>(555) 123-4568</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail size={16} className="text-gray-400" />
                      <span>legalaid@university.edu</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">Hours: Mon-Fri, 10 AM - 4 PM</p>
                  </div>
                </div>

                <div className="p-6 border border-gray-200 rounded-lg hover:shadow-lg transition-all bg-white">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                    <Users className="text-purple-600" size={24} />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Student Affairs Office</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Support for student issues, accommodation, and general student services.
                  </p>
                  <div className="space-y-2 text-sm text-gray-700">
                    <div className="flex items-center gap-2">
                      <Phone size={16} className="text-gray-400" />
                      <span>(555) 123-4569</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail size={16} className="text-gray-400" />
                      <span>studentaffairs@university.edu</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">Hours: Mon-Fri, 8 AM - 6 PM</p>
                  </div>
                </div>

                <div className="p-6 border border-gray-200 rounded-lg hover:shadow-lg transition-all bg-white md:col-span-2 lg:col-span-1">
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                    <AlertCircle className="text-red-600" size={24} />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Emergency Contacts</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Immediate assistance for emergencies and urgent situations.
                  </p>
                  <div className="space-y-2 text-sm text-gray-700">
                    <div className="flex items-center gap-2">
                      <Phone size={16} className="text-red-500" />
                      <span className="font-semibold">Emergency: 911</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone size={16} className="text-red-500" />
                      <span className="font-semibold">Campus Security: (555) 911</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone size={16} className="text-gray-400" />
                      <span>Crisis Hotline: (555) 123-HELP</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Helpful Documents Section */}
            <Card title={
              <div className="flex items-center gap-3">
                <FileText className="text-amber-600" size={24} />
                <span>Helpful Documents</span>
              </div>
            }>
              <div className="space-y-4">
                <p className="text-gray-700">
                  Access important policies, guidelines, and documents to understand institutional procedures and your rights.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-5 border border-gray-200 rounded-lg hover:border-blue-400 hover:shadow-md transition-all bg-white flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                          <FileText className="text-blue-600" size={20} />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">University Policies</h3>
                          <p className="text-sm text-gray-600">Comprehensive policy documents</p>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        Academic policies, code of conduct, and institutional regulations
                      </p>
                    </div>
                    <button className="ml-4 p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                      <ExternalLink size={20} />
                    </button>
                  </div>

                  <div className="p-5 border border-gray-200 rounded-lg hover:border-green-400 hover:shadow-md transition-all bg-white flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                          <Shield className="text-green-600" size={20} />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">Code of Conduct</h3>
                          <p className="text-sm text-gray-600">Student and staff conduct guidelines</p>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        Expected behaviors, disciplinary procedures, and ethical standards
                      </p>
                    </div>
                    <button className="ml-4 p-2 text-green-600 hover:bg-green-50 rounded-lg transition-all">
                      <ExternalLink size={20} />
                    </button>
                  </div>

                  <div className="p-5 border border-gray-200 rounded-lg hover:border-purple-400 hover:shadow-md transition-all bg-white flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
                          <AlertCircle className="text-purple-600" size={20} />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">Anti-Harassment Guidelines</h3>
                          <p className="text-sm text-gray-600">Prevention and response procedures</p>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        Information on identifying, reporting, and preventing harassment
                      </p>
                    </div>
                    <button className="ml-4 p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-all">
                      <ExternalLink size={20} />
                    </button>
                  </div>

                  <div className="p-5 border border-gray-200 rounded-lg hover:border-orange-400 hover:shadow-md transition-all bg-white flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center">
                          <HelpCircle className="text-orange-600" size={20} />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">FAQ & Guides</h3>
                          <p className="text-sm text-gray-600">Frequently asked questions</p>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        Common questions about complaints, rights, and procedures
                      </p>
                    </div>
                    <button className="ml-4 p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-all">
                      <ExternalLink size={20} />
                    </button>
                  </div>
                </div>
              </div>
            </Card>

            {/* Quick Action Section */}
            <div className="bg-gradient-to-r from-teal-500 to-blue-600 rounded-lg p-8 text-white">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold mb-2">Need Help Filing a Complaint?</h2>
                  <p className="text-teal-50 mb-4">
                    Our team is here to assist you. Get started by filing your complaint through our secure system.
                  </p>
                  <Link to="/complaint">
                    <Button variant="secondary" size="lg" className="bg-white text-teal-600 hover:bg-gray-100">
                      File a Complaint
                      <ArrowRight size={20} className="inline ml-2" />
                    </Button>
                  </Link>
                </div>
                <div className="flex-shrink-0">
                  <HelpCircle size={64} className="text-white opacity-20" />
                </div>
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  )
}

export default Resources

