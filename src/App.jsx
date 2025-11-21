import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'
import ErrorBoundary from './components/ErrorBoundary'
import AdminDashboard from './pages/AdminDashboard'
import LegalOfficerLayout from './layouts/LegalOfficerLayout'
import Dashboard from './pages/legal-officer/Dashboard'
import CasesList from './pages/legal-officer/CasesList'
import CaseDetails from './pages/legal-officer/CaseDetails'
import Forum from './pages/legal-officer/Forum'
import StudentComplaintForm from './pages/StudentComplaintForm'
import Welcome from './pages/Welcome'
import Resources from './pages/Resources'
import Settings from './pages/Settings'

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <Routes>
        {/* Public/Guest Routes - Fully accessible without authentication */}
        {/* These routes do NOT require login - guests can access freely */}
        <Route path="/" element={<Navigate to="/welcome" replace />} />
        <Route 
          path="/welcome" 
          element={
            <ProtectedRoute requireAuth={false}>
              <Welcome />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/resources" 
          element={
            <ProtectedRoute requireAuth={false}>
              <Resources />
            </ProtectedRoute>
          } 
        />
        {/* Login Route - public, used for auth redirects */}
        <Route 
          path="/login" 
          element={
            <Welcome forceLoginOpen />
          } 
        />
        {/* Complaint form - guests can access but may need to login to submit */}
        <Route 
          path="/complaint" 
          element={
            <ProtectedRoute requireAuth={false}>
              <StudentComplaintForm />
            </ProtectedRoute>
          } 
        />
        
        {/* Admin Routes - Requires admin role */}
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin-dashboard" 
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />
        
        {/* Legal Officer Routes - Requires legalOfficer role */}
        <Route 
          path="/officer" 
          element={
            <ProtectedRoute allowedRoles={['admin', 'legalOfficer']}>
              <LegalOfficerLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="cases" element={<CasesList />} />
          <Route path="case/:id" element={<CaseDetails />} />
          <Route path="forum" element={<Forum />} />
        </Route>
        
        {/* Legal Dashboard Routes - Alias for /officer */}
        <Route 
          path="/legal-dashboard" 
          element={
            <ProtectedRoute allowedRoles={['admin', 'legalOfficer']}>
              <LegalOfficerLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="cases" element={<CasesList />} />
          <Route path="case/:id" element={<CaseDetails />} />
          <Route path="forum" element={<Forum />} />
        </Route>
        
        {/* Student Dashboard Route - Public/Guest access */}
        <Route 
          path="/student-dashboard" 
          element={
            <ProtectedRoute requireAuth={false}>
              <Welcome />
            </ProtectedRoute>
          } 
        />
        
        {/* Settings Route - Public access (no authentication required) */}
        <Route 
          path="/settings" 
          element={
            <ProtectedRoute requireAuth={false}>
              <Settings />
            </ProtectedRoute>
          } 
        />
        
        {/* Catch all - redirect to welcome */}
        <Route path="*" element={<Navigate to="/welcome" replace />} />
        </Routes>
      </Router>
    </ErrorBoundary>
  )
}

export default App

