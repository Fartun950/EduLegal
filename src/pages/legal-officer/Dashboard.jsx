import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { caseService } from '../../services/caseService'
import { notificationService } from '../../services/notificationService'
import Card from '../../components/Card'
import Button from '../../components/Button'
import Table from '../../components/Table'
import { BarChartComponent, PieChartComponent } from '../../components/Chart'
import Badge from '../../components/Badge'
import { EmptyCases, ServiceUnavailable, NetworkError, LoadingError } from '../../components/EmptyState'
import { FileText, AlertCircle, Eye, Loader } from 'lucide-react'

const Dashboard = () => {
  const { user, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [viewMode, setViewMode] = useState('cards') // 'cards' or 'table'
  const [assignedCases, setAssignedCases] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [notifications, setNotifications] = useState([])
  const [stats, setStats] = useState({
    assigned: 0,
    open: 0,
    inProgress: 0,
    closed: 0,
    urgent: 0,
  })

  // Fetch cases from backend
  useEffect(() => {
    const fetchCases = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Fetch all cases - filter to show only assigned to current user
        const response = await caseService.getCases()
        
        if (response.success && response.data?.cases) {
          // Filter to show only cases assigned to current user (for legal officers)
          let filteredCases = response.data.cases || []
          
          if (user && user.role === 'legalOfficer' && (user.id || user._id)) {
            const userId = user.id || user._id
            filteredCases = response.data.cases.filter(
              c => c.assignedTo?._id === userId
            )
          }
          
          // Transform backend data to match frontend format
          const transformedCases = filteredCases.map(c => {
            // Calculate progress based on status
            let progress = 0
            if (c.status === 'open') progress = 30
            else if (c.status === 'inProgress') progress = 60
            else if (c.status === 'closed') progress = 100
            
            // Calculate last update time
            const now = new Date()
            const updated = new Date(c.updatedAt || c.createdAt)
            const diffHours = Math.floor((now - updated) / (1000 * 60 * 60))
            const lastUpdate = diffHours < 1 ? 'Just now' : diffHours === 1 ? '1 hour ago' : diffHours < 24 ? `${diffHours} hours ago` : `${Math.floor(diffHours / 24)} days ago`
            
            return {
              id: c._id?.substring(0, 8).toUpperCase() || `C${String(c._id).substring(0, 7)}`,
              _id: c._id,
              title: c.title,
              student: c.createdBy?.name || 'Anonymous',
              status: c.status === 'open' ? 'Open' : c.status === 'inProgress' ? 'In Progress' : c.status === 'closed' ? 'Closed' : 'Pending',
              priority: c.priority ? c.priority.charAt(0).toUpperCase() + c.priority.slice(1) : 'Medium',
              date: new Date(c.createdAt).toLocaleDateString(),
              description: c.description?.substring(0, 100) || 'No description',
              progress: progress,
              lastUpdate: lastUpdate,
            }
          })
          
          setAssignedCases(transformedCases)
          
          // Calculate stats
          setStats({
            assigned: transformedCases.length,
            open: transformedCases.filter(c => c.status === 'Open').length,
            inProgress: transformedCases.filter(c => c.status === 'In Progress').length,
            closed: transformedCases.filter(c => c.status === 'Closed').length,
            urgent: transformedCases.filter(c => c.priority === 'High').length,
          })
        } else if (response.error) {
          // Handle service error gracefully
          setError(response.error.message || 'Failed to load cases')
          setAssignedCases([])
        } else {
          // No data or unexpected response format
          setAssignedCases([])
        }
      } catch (err) {
        console.error('Error fetching cases:', err)
        setError(err.response?.data?.message || err.message || 'Failed to load cases')
        setAssignedCases([])
        
        // Don't redirect on auth errors - allow access without authentication
        // if (err.response?.status === 401 || err.response?.status === 403) {
        //   navigate('/welcome')
        // }
      } finally {
        setLoading(false)
      }
    }

    // Fetch notifications
    const fetchNotifications = async () => {
      try {
        const response = await notificationService.getNotifications()
        if (response.success && response.data.notifications) {
          setNotifications(response.data.notifications)
        }
      } catch (err) {
        console.warn('Failed to load notifications:', err)
        // Use mock notifications if backend doesn't have notifications yet
        setNotifications([
          { id: 1, type: 'info', message: 'New case assigned to you', time: '2 hours ago', read: false },
          { id: 2, type: 'warning', message: 'Case requires immediate attention', time: '5 hours ago', read: false },
        ])
      }
    }

    // No authentication check - Legal Officer dashboard is accessible without login
    fetchCases()
    fetchNotifications()
  }, [])

  // Mock cases for fallback
  const mockCases = [
    { 
      id: 'C001', 
      title: 'Harassment Complaint', 
      student: 'John Doe', 
      status: 'Open', 
      priority: 'High', 
      date: '2024-01-15', 
      description: 'Student reported harassment incident in the department.',
      progress: 45,
      lastUpdate: '2 hours ago'
    },
    { 
      id: 'C002', 
      title: 'Academic Dispute', 
      student: 'Jane Smith', 
      status: 'In Progress', 
      priority: 'Medium', 
      date: '2024-01-14', 
      description: 'Grade appeal for final examination.',
      progress: 75,
      lastUpdate: '1 day ago'
    },
    { 
      id: 'C003', 
      title: 'Bullying Report', 
      student: 'Bob Wilson', 
      status: 'Open', 
      priority: 'High', 
      date: '2024-01-13', 
      description: 'Report of bullying behavior in campus.',
      progress: 30,
      lastUpdate: '3 hours ago'
    },
    { 
      id: 'C004', 
      title: 'Discrimination Case', 
      student: 'Alice Brown', 
      status: 'In Progress', 
      priority: 'High', 
      date: '2024-01-12', 
      description: 'Alleged discrimination in academic evaluation.',
      progress: 60,
      lastUpdate: '5 hours ago'
    },
  ]

  const chartData = [
    { name: 'Jan', Cases: stats.assigned },
    { name: 'Feb', Cases: stats.open },
    { name: 'Mar', Cases: stats.inProgress },
    { name: 'Apr', Cases: stats.closed },
  ]

  const statusData = [
    { name: 'Open', value: stats.open },
    { name: 'In Progress', value: stats.inProgress },
    { name: 'Closed', value: stats.closed },
  ]

  const renderCaseRow = (caseItem) => (
    <>
      <td className="px-8 py-5 whitespace-nowrap text-sm font-medium text-gray-900">
        {caseItem.id}
      </td>
      <td className="px-8 py-5 text-sm text-gray-700">
        <div>
          <p className="font-semibold text-gray-900">{caseItem.title}</p>
          <p className="text-xs text-gray-500 mt-1">{caseItem.student}</p>
        </div>
      </td>
      <td className="px-8 py-5 whitespace-nowrap">
        <span
          className={`px-3 py-1.5 text-xs font-semibold rounded-full ${
            caseItem.status === 'Open'
              ? 'bg-green-100 text-green-800'
              : caseItem.status === 'In Progress'
              ? 'bg-amber-100 text-amber-800'
              : 'bg-gray-100 text-gray-800'
          }`}
        >
          {caseItem.status}
        </span>
      </td>
      <td className="px-8 py-5 whitespace-nowrap">
        <span
          className={`px-3 py-1.5 text-xs font-semibold rounded-full ${
            caseItem.priority === 'High'
              ? 'bg-red-100 text-red-800'
              : caseItem.priority === 'Medium'
              ? 'bg-yellow-100 text-yellow-800'
              : 'bg-green-100 text-green-800'
          }`}
        >
          {caseItem.priority}
        </span>
      </td>
      <td className="px-8 py-5 whitespace-nowrap text-sm text-gray-700">
        <div className="flex items-center gap-2">
          <div className="w-32 bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-blue-600 h-2.5 rounded-full transition-all"
              style={{ width: `${caseItem.progress}%` }}
            ></div>
          </div>
          <span className="text-xs font-medium text-gray-600">{caseItem.progress}%</span>
        </div>
      </td>
      <td className="px-8 py-5 whitespace-nowrap text-sm text-gray-700">
        {caseItem.date}
      </td>
      <td className="px-8 py-5 whitespace-nowrap text-sm font-medium">
        <Link to={`/officer/case/${caseItem._id || caseItem.id}`}>
          <Button variant="outline" size="sm">
            <Eye size={14} className="inline mr-1" />
            View
          </Button>
        </Link>
      </td>
    </>
  )

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <Loader className="animate-spin text-blue-600 mr-3" size={24} />
          <div className="text-gray-600">Loading dashboard...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Dashboard Overview */}
      <Card title="Dashboard Overview">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <div className="text-center p-6 bg-blue-50 rounded-lg border border-blue-100 shadow-sm hover:shadow-card-hover transition-all">
            <p className="text-sm font-medium text-gray-600 mb-3">Assigned Cases</p>
            <p className="text-4xl font-bold text-blue-600 mb-1">{stats.assigned}</p>
            <p className="text-xs text-gray-500">{stats.open} Open</p>
          </div>
          <div className="text-center p-6 bg-amber-50 rounded-lg border border-amber-100 shadow-sm hover:shadow-card-hover transition-all">
            <p className="text-sm font-medium text-gray-600 mb-3">In Progress</p>
            <p className="text-4xl font-bold text-amber-600 mb-1">{stats.inProgress}</p>
            <p className="text-xs text-gray-500">Active cases</p>
          </div>
          <div className="text-center p-6 bg-green-50 rounded-lg border border-green-100 shadow-sm hover:shadow-card-hover transition-all">
            <p className="text-sm font-medium text-gray-600 mb-3">Closed</p>
            <p className="text-4xl font-bold text-green-600 mb-1">{stats.closed}</p>
            <p className="text-xs text-gray-500">Resolved</p>
          </div>
          <div className="text-center p-6 bg-red-50 rounded-lg border border-red-100 shadow-sm hover:shadow-card-hover transition-all">
            <p className="text-sm font-medium text-gray-600 mb-3">Urgent</p>
            <p className="text-4xl font-bold text-red-600 mb-1">{stats.urgent}</p>
            <p className="text-xs text-gray-500">High priority</p>
          </div>
          <div className="text-center p-6 bg-secondary-50 rounded-lg border border-secondary-100 shadow-sm hover:shadow-card-hover transition-all">
            <p className="text-sm font-medium text-gray-600 mb-3">Notifications</p>
            <p className="text-4xl font-bold text-secondary-600 mb-1">
              {notifications.filter(n => !n.read).length}
            </p>
            <p className="text-xs text-gray-500">Unread</p>
          </div>
        </div>
      </Card>

      {/* Charts and Notifications Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Case Status Chart */}
        <Card title="Case Status Distribution">
          <PieChartComponent data={statusData} dataKey="value" />
        </Card>

        {/* Case Trends */}
        <Card title="Case Trends">
          <BarChartComponent data={chartData} dataKey="Cases" />
        </Card>

        {/* Notifications */}
        <Card 
          title={
            <div className="flex items-center justify-between w-full">
              <span>Notifications</span>
              <Badge variant="primary" size="sm">
                {notifications.filter(n => !n.read).length} New
              </Badge>
            </div>
          }
        >
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {notifications.map((notif) => (
              <div
                key={notif.id}
                className={`p-3 rounded-lg border transition-smooth cursor-pointer ${
                  notif.read
                    ? 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                    : 'bg-blue-50 border-blue-200 hover:bg-blue-100'
                }`}
              >
                <div className="flex items-start gap-2">
                  <AlertCircle
                    size={16}
                    className={`mt-0.5 flex-shrink-0 ${
                      notif.type === 'warning'
                        ? 'text-yellow-600'
                        : notif.type === 'success'
                        ? 'text-green-600'
                        : 'text-blue-600'
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">{notif.message}</p>
                    <p className="text-xs text-gray-500 mt-1">{notif.time}</p>
                  </div>
                  {!notif.read && (
                    <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-1"></div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Cases Section */}
      <Card 
        title="My Assigned Cases"
        action={
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={viewMode === 'cards' ? 'primary' : 'outline'}
              onClick={() => setViewMode('cards')}
            >
              Cards
            </Button>
            <Button
              size="sm"
              variant={viewMode === 'table' ? 'primary' : 'outline'}
              onClick={() => setViewMode('table')}
            >
              Table
            </Button>
          </div>
        }
      >
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader className="animate-spin text-blue-600 mr-3" size={24} />
            <div className="text-gray-600">Loading cases...</div>
          </div>
        ) : error ? (
          <div className="py-8">
            {error.includes('network') || error.includes('connect') ? (
              <NetworkError onRetry={() => window.location.reload()} />
            ) : error.includes('unavailable') || error.includes('temporarily') ? (
              <ServiceUnavailable onRetry={() => window.location.reload()} service="Cases service" />
            ) : (
              <LoadingError onRetry={() => window.location.reload()} message={error} />
            )}
          </div>
        ) : assignedCases.length === 0 ? (
          <EmptyCases onRetry={() => window.location.reload()} />
        ) : viewMode === 'cards' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {assignedCases.map((caseItem) => (
              <div
                key={caseItem.id}
                className="border-2 border-gray-200 rounded-lg p-6 hover:shadow-card-hover transition-all duration-300 bg-white card-hover"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-xl font-semibold text-gray-900">
                        {caseItem.title}
                      </h3>
                      <Badge
                        variant={
                          caseItem.status === 'Open'
                            ? 'success'
                            : caseItem.status === 'In Progress'
                            ? 'warning'
                            : 'default'
                        }
                        size="sm"
                      >
                        {caseItem.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      <strong>Case ID:</strong> {caseItem.id}
                    </p>
                    <p className="text-sm text-gray-600 mb-3">
                      <strong>Student:</strong> {caseItem.student}
                    </p>
                    <p className="text-sm text-gray-700 mb-4 line-clamp-2 leading-relaxed">
                      {caseItem.description}
                    </p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">Progress</span>
                    <span className="text-sm font-semibold text-gray-700">{caseItem.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-blue-600 h-3 rounded-full transition-all"
                      style={{ width: `${caseItem.progress}%` }}
                    ></div>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-3">
                      <Badge
                        variant={
                          caseItem.priority === 'High'
                            ? 'danger'
                            : caseItem.priority === 'Medium'
                            ? 'warning'
                            : 'success'
                        }
                        size="sm"
                      >
                        {caseItem.priority}
                      </Badge>
                      <span className="text-xs text-gray-500">{caseItem.lastUpdate}</span>
                    </div>
                    <Link to={`/officer/case/${caseItem._id || caseItem.id}`}>
                      <Button variant="primary" size="sm" className="btn-hover">
                        <Eye size={14} className="inline mr-1" />
                        View Details
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <Table
            headers={['Case ID', 'Title', 'Status', 'Priority', 'Progress', 'Date', 'Actions']}
            data={assignedCases}
            renderRow={renderCaseRow}
          />
        )}
      </Card>
    </div>
  )
}

export default Dashboard






