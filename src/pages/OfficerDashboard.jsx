import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { reportService } from '../services/reportService'
import api from '../services/api'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'
import Card from '../components/Card'
import { AlertCircle, FileText, TrendingUp, Clock, CheckCircle, AlertTriangle } from 'lucide-react'

const OfficerDashboard = () => {
  const { user } = useAuth()
  const [metrics, setMetrics] = useState(null)
  const [trends, setTrends] = useState(null)
  const [assignedCases, setAssignedCases] = useState([])
  const [loading, setLoading] = useState({
    metrics: true,
    trends: true,
    cases: true,
  })
  const [errors, setErrors] = useState({
    metrics: null,
    trends: null,
    cases: null,
  })

  // Fetch dashboard metrics
  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await reportService.getMetrics()
        if (response.success) {
          setMetrics(response.data)
        }
      } catch (error) {
        console.error('Error fetching metrics:', error)
        setErrors((prev) => ({ ...prev, metrics: 'Failed to load metrics' }))
      } finally {
        setLoading((prev) => ({ ...prev, metrics: false }))
      }
    }
    fetchMetrics()
  }, [])

  // Fetch trends data
  useEffect(() => {
    const fetchTrends = async () => {
      try {
        const response = await reportService.getTrends()
        if (response.success) {
          setTrends(response.data.trends)
        }
      } catch (error) {
        console.error('Error fetching trends:', error)
        setErrors((prev) => ({ ...prev, trends: 'Failed to load trends' }))
      } finally {
        setLoading((prev) => ({ ...prev, trends: false }))
      }
    }
    fetchTrends()
  }, [])

  // Fetch assigned cases
  useEffect(() => {
    const fetchAssignedCases = async () => {
      try {
        const response = await api.get('/cases/assigned')
        if (response.data.success) {
          setAssignedCases(response.data.data.cases || [])
        }
      } catch (error) {
        console.error('Error fetching assigned cases:', error)
        setErrors((prev) => ({ ...prev, cases: 'Failed to load assigned cases' }))
      } finally {
        setLoading((prev) => ({ ...prev, cases: false }))
      }
    }
    fetchAssignedCases()
  }, [])

  const userName = user?.name || 'Legal Officer'
  const userRole = user?.role || 'legalOfficer'

  // Helper function to format month name
  const getMonthName = (month) => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ]
    return months[month - 1] || `Month ${month}`
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar userRole={userRole === 'legalOfficer' ? 'officer' : userRole} />
      <div className="flex-1 lg:ml-64 flex flex-col">
        <Header title="Dashboard" userName={userName} userRole={userRole} />
        <main className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Open Cases Card */}
              <Card>
                <div className="p-6">
                  {loading.metrics ? (
                    <div className="text-center py-4">
                      <div className="animate-pulse text-gray-400">Loading...</div>
                    </div>
                  ) : errors.metrics ? (
                    <div className="text-center py-4 text-red-600">
                      <AlertCircle size={24} className="mx-auto mb-2" />
                      <p className="text-sm">{errors.metrics}</p>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-medium text-gray-600">Open Cases</h3>
                        <FileText className="text-blue-500" size={24} />
                      </div>
                      <p className="text-3xl font-bold text-gray-900">{metrics?.open || 0}</p>
                    </>
                  )}
                </div>
              </Card>

              {/* In Progress Cases Card */}
              <Card>
                <div className="p-6">
                  {loading.metrics ? (
                    <div className="text-center py-4">
                      <div className="animate-pulse text-gray-400">Loading...</div>
                    </div>
                  ) : errors.metrics ? (
                    <div className="text-center py-4 text-red-600">
                      <AlertCircle size={24} className="mx-auto mb-2" />
                      <p className="text-sm">{errors.metrics}</p>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-medium text-gray-600">In Progress</h3>
                        <Clock className="text-yellow-500" size={24} />
                      </div>
                      <p className="text-3xl font-bold text-gray-900">{metrics?.inProgress || 0}</p>
                    </>
                  )}
                </div>
              </Card>

              {/* Closed Cases Card */}
              <Card>
                <div className="p-6">
                  {loading.metrics ? (
                    <div className="text-center py-4">
                      <div className="animate-pulse text-gray-400">Loading...</div>
                    </div>
                  ) : errors.metrics ? (
                    <div className="text-center py-4 text-red-600">
                      <AlertCircle size={24} className="mx-auto mb-2" />
                      <p className="text-sm">{errors.metrics}</p>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-medium text-gray-600">Closed Cases</h3>
                        <CheckCircle className="text-green-500" size={24} />
                      </div>
                      <p className="text-3xl font-bold text-gray-900">{metrics?.closed || 0}</p>
                    </>
                  )}
                </div>
              </Card>

              {/* Urgent Cases Card */}
              <Card>
                <div className="p-6">
                  {loading.metrics ? (
                    <div className="text-center py-4">
                      <div className="animate-pulse text-gray-400">Loading...</div>
                    </div>
                  ) : errors.metrics ? (
                    <div className="text-center py-4 text-red-600">
                      <AlertCircle size={24} className="mx-auto mb-2" />
                      <p className="text-sm">{errors.metrics}</p>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-medium text-gray-600">Urgent Cases</h3>
                        <AlertTriangle className="text-red-500" size={24} />
                      </div>
                      <p className="text-3xl font-bold text-gray-900">{metrics?.urgent || 0}</p>
                    </>
                  )}
                </div>
              </Card>
            </div>

            {/* Trends Chart and Assigned Cases */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Trends Chart */}
              <Card title="Case Filing Trends">
                {loading.trends ? (
                  <div className="text-center py-12">
                    <div className="animate-pulse text-gray-400">Loading trends data...</div>
                  </div>
                ) : errors.trends ? (
                  <div className="text-center py-12 text-red-600">
                    <AlertCircle size={48} className="mx-auto mb-4" />
                    <p>{errors.trends}</p>
                  </div>
                ) : (
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <TrendingUp className="text-primary-600" size={20} />
                      <h3 className="text-lg font-semibold text-gray-900">Monthly Complaints</h3>
                    </div>
                    <div className="space-y-3">
                      {trends && trends.length > 0 ? (
                        trends.map((trend, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div>
                              <p className="font-medium text-gray-900">
                                {getMonthName(trend.month)} {trend.year}
                              </p>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="w-32 bg-gray-200 rounded-full h-4 relative">
                                <div
                                  className="bg-primary-600 h-4 rounded-full"
                                  style={{
                                    width: `${(trend.count / 50) * 100}%`,
                                    maxWidth: '100%',
                                  }}
                                />
                              </div>
                              <span className="text-lg font-bold text-gray-900 w-12 text-right">
                                {trend.count}
                              </span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-center text-gray-500 py-8">No trends data available</p>
                      )}
                    </div>
                  </div>
                )}
              </Card>

              {/* Assigned Cases List */}
              <Card title="My Assigned Cases">
                {loading.cases ? (
                  <div className="text-center py-12">
                    <div className="animate-pulse text-gray-400">Loading assigned cases...</div>
                  </div>
                ) : errors.cases ? (
                  <div className="text-center py-12 text-red-600">
                    <AlertCircle size={48} className="mx-auto mb-4" />
                    <p>{errors.cases}</p>
                  </div>
                ) : (
                  <div className="p-6">
                    {assignedCases.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <FileText size={48} className="mx-auto mb-4 text-gray-400" />
                        <p>No assigned cases</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {assignedCases.map((caseItem) => (
                          <div
                            key={caseItem._id}
                            className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                          >
                            <div className="flex items-start justify-between mb-2">
                              <h3 className="font-semibold text-gray-900 flex-1">
                                {caseItem.title}
                              </h3>
                              <span
                                className={`px-2 py-1 text-xs font-medium rounded ${
                                  caseItem.status === 'open'
                                    ? 'bg-blue-100 text-blue-800'
                                    : caseItem.status === 'inProgress'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-green-100 text-green-800'
                                }`}
                              >
                                {caseItem.status}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                              {caseItem.description}
                            </p>
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <span>Category: {caseItem.category}</span>
                              <span>Priority: {caseItem.priority}</span>
                              <span>
                                {new Date(caseItem.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default OfficerDashboard



