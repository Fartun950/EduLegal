import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { caseService } from '../services/caseService'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'
import Card from '../components/Card'
import Button from '../components/Button'
import Table from '../components/Table'
import Modal from '../components/Modal'
import { MultiBarChart } from '../components/Chart'
import { EmptyCases, ServiceUnavailable, NetworkError, LoadingError } from '../components/EmptyState'
import { FileText, Users, Bell, Download, Printer, UserPlus, Edit, AlertCircle, Loader } from 'lucide-react'

const AdminDashboard = () => {
  const { user, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [assignModalOpen, setAssignModalOpen] = useState(false)
  const [statusModalOpen, setStatusModalOpen] = useState(false)
  const [reportModalOpen, setReportModalOpen] = useState(false)
  const [selectedCase, setSelectedCase] = useState(null)
  const [selectedOfficer, setSelectedOfficer] = useState('')
  const [reportType, setReportType] = useState('all')
  const [reportFormat, setReportFormat] = useState('pdf')
  const [cases, setCases] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [officers, setOfficers] = useState([])
  const [refreshing, setRefreshing] = useState(false)

  // Fetch officers (legal officers only) for assignment dropdown
  useEffect(() => {
    const fetchOfficers = async () => {
      // Note: Backend doesn't have user list endpoint yet
      // For now, we'll need to extract officers from cases or create a users endpoint
      // This is a placeholder - in production, you'd have a /api/users endpoint
      try {
        // Try to get users - if endpoint doesn't exist, use empty array
        // const response = await api.get('/users?role=legalOfficer')
        // For now, set empty array - officers will be populated from cases
        setOfficers([])
      } catch (err) {
        console.warn('User endpoint not available:', err)
        setOfficers([])
      }
    }

    // No authentication check - Admin dashboard is accessible without login
    fetchOfficers()
  }, [])

  // Refresh cases function - used both for initial load and after updates
  const refreshCases = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await caseService.getCases()
      
      if (response.success && response.data?.cases) {
        // Transform backend data to match frontend format
        const transformedCases = response.data.cases.map(c => ({
          id: c._id?.substring(0, 8).toUpperCase() || c._id,
          title: c.title,
          student: c.createdBy?.name || 'Anonymous',
          officer: c.assignedTo?.name || null,
          status: c.status === 'open' ? 'Open' : c.status === 'inProgress' ? 'In Progress' : c.status === 'closed' ? 'Closed' : 'Pending',
          priority: c.priority ? c.priority.charAt(0).toUpperCase() + c.priority.slice(1) : 'Medium',
          date: new Date(c.createdAt).toLocaleDateString(),
          _id: c._id,
          assignedToId: c.assignedTo?._id || null,
        }))
        setCases(transformedCases)
        
        // Extract unique officers from cases for assignment dropdown
        const uniqueOfficers = response.data.cases
          .filter(c => c.assignedTo)
          .map(c => ({
            id: c.assignedTo._id,
            name: c.assignedTo.name,
            email: c.assignedTo.email,
          }))
          .filter((officer, index, self) => 
            index === self.findIndex((o) => o.id === officer.id)
          )
        setOfficers(uniqueOfficers)
      } else if (response.error) {
        // Handle service error gracefully
        setError(response.error.message || 'Failed to load cases')
        setCases([]) // Set empty array on error
      } else {
        // No data or unexpected response format
        setCases([])
      }
    } catch (err) {
      console.error('Error fetching cases:', err)
      setError(err.response?.data?.message || err.message || 'Failed to load cases')
      setCases([]) // Set empty array on error
    } finally {
      setLoading(false)
    }
  }

  // Fetch cases from backend on mount
  // No authentication check - Admin dashboard is accessible without login
  useEffect(() => {
    refreshCases()
  }, [])

  // Calculate stats from fetched cases
  const stats = {
    totalCases: cases.length,
    openCases: cases.filter(c => c.status === 'Open').length,
    closedCases: cases.filter(c => c.status === 'Closed').length,
    inProgressCases: cases.filter(c => c.status === 'In Progress').length,
    totalUsers: officers.length + cases.filter(c => c.student && c.student !== 'Anonymous').length, // Approximate user count
    notifications: 0, // TODO: Fetch from notifications API when available
  }

  const caseData = [
    { name: 'Open', value: stats.openCases },
    { name: 'Closed', value: stats.closedCases },
  ]

  const chartData = [
    { name: 'Jan', Open: 8, Closed: 5 },
    { name: 'Feb', Open: 10, Closed: 7 },
    { name: 'Mar', Open: 12, Closed: 15 },
  ]

  const handleAssign = async () => {
    if (!selectedCase || !selectedOfficer) return

    try {
      setRefreshing(true)
      await caseService.updateCase(selectedCase._id, {
        assignedTo: selectedOfficer,
      })
      // Refresh cases after assignment
      await refreshCases()
      setAssignModalOpen(false)
      setSelectedCase(null)
      setSelectedOfficer('')
      alert('Case assigned successfully!')
    } catch (err) {
      console.error('Error assigning case:', err)
      alert('Failed to assign case: ' + (err.response?.data?.message || err.message || 'Unknown error'))
    } finally {
      setRefreshing(false)
    }
  }

  const handleStatusUpdate = async (caseItem) => {
    if (!caseItem) return

    try {
      setRefreshing(true)
      const statusMap = {
        'Open': 'open',
        'In Progress': 'inProgress',
        'Closed': 'closed',
        'Pending': 'open',
      }
      const newStatus = caseItem.status || 'Open'
      await caseService.updateCase(caseItem._id, {
        status: statusMap[newStatus] || 'open',
      })
      // Refresh cases after status update
      await refreshCases()
      setStatusModalOpen(false)
      setSelectedCase(null)
      alert('Case status updated successfully!')
    } catch (err) {
      console.error('Error updating case:', err)
      alert('Failed to update case: ' + (err.response?.data?.message || err.message || 'Unknown error'))
    } finally {
      setRefreshing(false)
    }
  }

  const handleAssignClick = (caseItem) => {
    setSelectedCase(caseItem)
    setAssignModalOpen(true)
  }

  const handleStatusUpdateClick = (caseItem) => {
    setSelectedCase(caseItem)
    setStatusModalOpen(true)
  }

  const renderCaseRow = (caseItem) => (
    <>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
        {caseItem.id}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
        {caseItem.title}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
        {caseItem.student}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
        {caseItem.officer || (
          <span className="text-gray-400 italic">Unassigned</span>
        )}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span
          className={`px-2 py-1 text-xs font-semibold rounded-full ${
            caseItem.status === 'Open'
              ? 'bg-green-100 text-green-800'
              : caseItem.status === 'Closed'
              ? 'bg-gray-100 text-gray-800'
              : caseItem.status === 'In Progress'
              ? 'bg-blue-100 text-blue-800'
              : 'bg-yellow-100 text-yellow-800'
          }`}
        >
          {caseItem.status}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
        <span
          className={`px-2 py-1 text-xs font-semibold rounded-full ${
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
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
        {caseItem.date}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
        {!caseItem.officer && (
          <Button
            size="sm"
            variant="primary"
            onClick={() => handleAssign(caseItem)}
          >
            <UserPlus size={14} className="inline mr-1" />
            Assign
          </Button>
        )}
        <Button
          size="sm"
          variant="outline"
          onClick={() => handleStatusUpdateClick(caseItem)}
        >
          <Edit size={14} className="inline mr-1" />
          Update
        </Button>
      </td>
    </>
  )

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar userRole="admin" />
      <div className="flex-1 lg:ml-64 flex flex-col">
        <Header title="Admin Dashboard" userName="Admin" userRole="admin" />
        <main className="flex-1 p-6 space-y-6 overflow-y-auto">
          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Cases Overview</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.totalCases}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {stats.openCases} Open, {stats.closedCases} Closed
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FileText className="text-blue-600" size={24} />
                </div>
              </div>
            </Card>
            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Users Overview</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.totalUsers}</p>
                  <p className="text-xs text-gray-500 mt-1">Active users</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Users className="text-green-600" size={24} />
                </div>
              </div>
            </Card>
            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Open Cases</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.openCases}</p>
                  <p className="text-xs text-gray-500 mt-1">Requires attention</p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <FileText className="text-yellow-600" size={24} />
                </div>
              </div>
            </Card>
            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Notifications</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.notifications}</p>
                  <p className="text-xs text-gray-500 mt-1">New updates</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Bell className="text-purple-600" size={24} />
                </div>
              </div>
            </Card>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card title="Cases Trend">
              <MultiBarChart
                data={chartData}
                bars={[
                  { key: 'Open', color: '#3b82f6' },
                  { key: 'Closed', color: '#10b981' },
                ]}
              />
            </Card>
            <Card title="Pending Tasks">
              <div className="space-y-3">
                {cases.filter(c => c.status === 'Open').slice(0, 3).map((caseItem) => (
                  <div key={caseItem._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-700">Review case {caseItem.id}</span>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => navigate(`/officer/case/${caseItem._id}`)}
                    >
                      View
                    </Button>
                  </div>
                ))}
                {cases.filter(c => c.status === 'Open').length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">No pending tasks</p>
                )}
              </div>
            </Card>
          </div>

          {/* Cases Table */}
          <Card
            title="All Cases"
            action={
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => setReportModalOpen(true)}>
                  <Download size={14} className="inline mr-1" />
                  Export
                </Button>
                <Button size="sm" variant="outline" onClick={() => window.print()}>
                  <Printer size={14} className="inline mr-1" />
                  Print
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
                  <NetworkError onRetry={refreshCases} />
                ) : error.includes('unavailable') || error.includes('temporarily') ? (
                  <ServiceUnavailable onRetry={refreshCases} service="Cases service" />
                ) : (
                  <LoadingError onRetry={refreshCases} message={error} />
                )}
              </div>
            ) : cases.length === 0 ? (
              <EmptyCases onRetry={refreshCases} />
            ) : (
              <Table
                headers={['Case ID', 'Title', 'Student', 'Officer', 'Status', 'Priority', 'Date', 'Actions']}
                data={cases}
                renderRow={renderCaseRow}
              />
            )}
          </Card>
        </main>
      </div>

      {/* Assign Officer Modal */}
      <Modal
        isOpen={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        title="Assign Legal Officer"
      >
        {selectedCase && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Assign a legal officer to case <strong>{selectedCase.id}</strong>
            </p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Officer
              </label>
              <select 
                value={selectedOfficer}
                onChange={(e) => setSelectedOfficer(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-400 focus:border-teal-500"
              >
                <option value="">Choose an officer...</option>
                {officers.length > 0 ? (
                  officers.map((officer) => (
                    <option key={officer.id} value={officer.id}>
                      {officer.name} {officer.email ? `(${officer.email})` : ''}
                    </option>
                  ))
                ) : (
                  <option value="" disabled>No officers available. Officers will appear here once assigned to cases.</option>
                )}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Note: Officers are extracted from existing case assignments. To assign to a new officer, you may need to create them first.
              </p>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="secondary" onClick={() => {
                setAssignModalOpen(false)
                setSelectedOfficer('')
              }}>
                Cancel
              </Button>
              <Button 
                variant="primary" 
                onClick={handleAssign}
                disabled={!selectedOfficer}
              >
                Assign
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Update Status Modal */}
      <Modal
        isOpen={statusModalOpen}
        onClose={() => setStatusModalOpen(false)}
        title="Update Case Status"
      >
        {selectedCase && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Update status for case <strong>{selectedCase.id}</strong>
            </p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Status
              </label>
              <select 
                value={selectedCase?.status || 'Open'}
                onChange={(e) => {
                  const newStatus = e.target.value
                  setSelectedCase({ ...selectedCase, status: newStatus })
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-400 focus:border-teal-500"
              >
                <option value="Open">Open</option>
                <option value="In Progress">In Progress</option>
                <option value="Closed">Closed</option>
              </select>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="secondary" onClick={() => {
                setStatusModalOpen(false)
                setSelectedCase(null)
              }}>
                Cancel
              </Button>
              <Button variant="primary" onClick={() => {
                if (selectedCase) {
                  handleStatusUpdate(selectedCase)
                }
              }}>
                Update Status
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Report Export Modal */}
      <Modal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        title="Export Report"
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Report Type
            </label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-400 focus:border-teal-500"
            >
              <option value="all">All Cases</option>
              <option value="open">Open Cases Only</option>
              <option value="closed">Closed Cases Only</option>
              <option value="pending">Pending Cases Only</option>
              <option value="summary">Summary Report</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Export Format
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setReportFormat('pdf')}
                className={`p-3 border-2 rounded-lg text-center transition-smooth ${
                  reportFormat === 'pdf'
                    ? 'border-blue-600 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="font-medium">PDF</div>
                <div className="text-xs text-gray-500 mt-1">Portable Document</div>
              </button>
              <button
                onClick={() => setReportFormat('csv')}
                className={`p-3 border-2 rounded-lg text-center transition-smooth ${
                  reportFormat === 'csv'
                    ? 'border-blue-600 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="font-medium">CSV</div>
                <div className="text-xs text-gray-500 mt-1">Spreadsheet</div>
              </button>
            </div>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> The report will include case details, status, assigned officers, and timestamps.
            </p>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setReportModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={async () => {
                try {
                  setRefreshing(true)
                  const response = await caseService.exportReport(reportType, reportFormat)
                  
                  if (response.success) {
                    if (reportFormat === 'csv') {
                      // For CSV, the response is the CSV string
                      const blob = new Blob([response.data || ''], { type: 'text/csv' })
                      const url = window.URL.createObjectURL(blob)
                      const a = document.createElement('a')
                      a.href = url
                      a.download = `cases-report-${reportType || 'all'}-${Date.now()}.csv`
                      document.body.appendChild(a)
                      a.click()
                      window.URL.revokeObjectURL(url)
                      document.body.removeChild(a)
                    } else {
                      // For JSON, download as JSON file
                      const blob = new Blob([JSON.stringify(response.data, null, 2)], { type: 'application/json' })
                      const url = window.URL.createObjectURL(blob)
                      const a = document.createElement('a')
                      a.href = url
                      a.download = `cases-report-${reportType || 'all'}-${Date.now()}.json`
                      document.body.appendChild(a)
                      a.click()
                      window.URL.revokeObjectURL(url)
                      document.body.removeChild(a)
                    }
                    alert(`Report exported successfully as ${reportFormat.toUpperCase()}!`)
                    setReportModalOpen(false)
                  }
                } catch (err) {
                  console.error('Error exporting report:', err)
                  alert('Failed to export report: ' + (err.response?.data?.message || err.message || 'Unknown error'))
                } finally {
                  setRefreshing(false)
                }
              }}
              disabled={refreshing}
            >
              <Download size={14} className="inline mr-1" />
              {refreshing ? 'Exporting...' : 'Export Report'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default AdminDashboard

