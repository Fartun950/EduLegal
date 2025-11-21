import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { caseService } from '../../services/caseService'
import Card from '../../components/Card'
import Button from '../../components/Button'
import Table from '../../components/Table'
import Badge from '../../components/Badge'
import { Eye, FileText, AlertCircle } from 'lucide-react'

const CasesList = () => {
  const { user, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [assignedCases, setAssignedCases] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch cases from backend
  useEffect(() => {
    const fetchCases = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Fetch all cases - backend will return cases based on user role
        // For legal officers, filter to show only assigned cases
        const response = await caseService.getCases()
        
        if (response.success) {
          // Filter to show only cases assigned to current user (for legal officers)
          let filteredCases = response.data.cases
          
          if (user && user.role === 'legalOfficer' && user.id) {
            filteredCases = response.data.cases.filter(
              c => c.assignedTo?._id === user.id || c.assignedTo?._id === user._id
            )
          }
          
          // Transform backend data to match frontend format
          const transformedCases = filteredCases.map(c => {
            // Calculate progress based on status
            let progress = 0
            if (c.status === 'open') progress = 30
            else if (c.status === 'inProgress') progress = 60
            else if (c.status === 'closed') progress = 100
            
            return {
              id: c._id?.substring(0, 8).toUpperCase() || `C${String(c._id).substring(0, 7)}`,
              _id: c._id,
              title: c.title,
              student: c.createdBy?.name || 'Anonymous',
              status: c.status === 'open' ? 'Open' : c.status === 'inProgress' ? 'In Progress' : c.status === 'closed' ? 'Closed' : 'Pending',
              priority: c.priority ? c.priority.charAt(0).toUpperCase() + c.priority.slice(1) : 'Medium',
              date: new Date(c.createdAt).toLocaleDateString(),
              description: c.description?.substring(0, 100) + '...' || '',
              progress: progress,
            }
          })
          
          setAssignedCases(transformedCases)
        }
      } catch (err) {
        console.error('Error fetching cases:', err)
        setError(err.response?.data?.message || 'Failed to load cases')
        
        // Don't redirect on auth errors - allow access without authentication
        // if (err.response?.status === 401 || err.response?.status === 403) {
        //   navigate('/welcome')
        // }
      } finally {
        setLoading(false)
      }
    }

    // No authentication check - Legal Officer pages are accessible without login
    fetchCases()
  }, [])

  // Mock cases for fallback during loading/error
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
    },
  ]

  const renderCaseRow = (caseItem) => (
    <>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
        {caseItem.id || caseItem._id?.substring(0, 8).toUpperCase()}
      </td>
      <td className="px-6 py-4 text-sm text-gray-700">
        <div>
          <p className="font-medium">{caseItem.title}</p>
          <p className="text-xs text-gray-500">{caseItem.student}</p>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <Badge
          variant={
            caseItem.status === 'Open'
              ? 'success'
              : caseItem.status === 'In Progress'
              ? 'primary'
              : 'default'
          }
          size="sm"
        >
          {caseItem.status}
        </Badge>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <Badge
          variant={caseItem.priority === 'High' ? 'danger' : 'warning'}
          size="sm"
        >
          {caseItem.priority}
        </Badge>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
        <div className="w-24 bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all"
            style={{ width: `${caseItem.progress}%` }}
          ></div>
        </div>
        <span className="text-xs text-gray-500 mt-1 block">{caseItem.progress}%</span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
        {caseItem.date}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
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
          <div className="text-gray-600">Loading cases...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="text-red-600" size={20} />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">My Cases</h1>
          <p className="text-gray-600">All cases assigned to you</p>
        </div>
      </div>

      {assignedCases.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <FileText size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Cases Assigned</h3>
            <p className="text-gray-600">You don't have any cases assigned to you yet.</p>
          </div>
        </Card>
      ) : (
        <Card title={`All Cases (${assignedCases.length})`}>
          <Table
            headers={['Case ID', 'Title', 'Status', 'Priority', 'Progress', 'Date', 'Actions']}
            data={assignedCases}
            renderRow={renderCaseRow}
          />
        </Card>
      )}
    </div>
  )
}

export default CasesList






