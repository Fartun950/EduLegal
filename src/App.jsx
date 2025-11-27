import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import ProtectedRoute from './components/ProtectedRoute'
import ErrorBoundary from './components/ErrorBoundary'
import AdminDashboard from './pages/AdminDashboard'
import LegalOfficerLayout from './layouts/LegalOfficerLayout'
import Dashboard from './pages/legal-officer/Dashboard'
import CasesList from './pages/legal-officer/CasesList'
import CaseDetails from './pages/legal-officer/CaseDetails'
import Forum from './pages/legal-officer/Forum'
import StudentComplaintForm from './pages/StudentComplaintForm'
import ComplaintForm from './pages/ComplaintForm'
import Login from './pages/Login'
import OfficerDashboard from './pages/OfficerDashboard'
import Welcome from './pages/Welcome'
import Resources from './pages/Resources'
import Settings from './pages/Settings'
import { ROUTES } from './config/routes'
import { initNavigationService } from './services/navigationService'
import navigationService from './services/navigationService'

// Component to initialize navigation service
const NavigationInitializer = () => {
  const navigate = useNavigate()
  
  useEffect(() => {
    // Initialize navigation service with React Router's navigate function
    initNavigationService(navigate)
    
    // Make navigation service available globally for api.js interceptor
    if (typeof window !== 'undefined') {
      window.__navigationService = navigationService
    }
  }, [navigate])
  
  return null
}

function AppRoutes() {
  return (
    <>
      <NavigationInitializer />
      <Routes>
        {/* Public/Guest Routes - Fully accessible without authentication */}
        {/* These routes do NOT require login - guests can access freely */}
        <Route path="/" element={<Navigate to={ROUTES.WELCOME} replace />} />
        <Route 
          path={ROUTES.WELCOME} 
          element={
            <ProtectedRoute requireAuth={false}>
              <Welcome />
            </ProtectedRoute>
          } 
        />
        <Route 
          path={ROUTES.RESOURCES} 
          element={
            <ProtectedRoute requireAuth={false}>
              <Resources />
            </ProtectedRoute>
          } 
        />
        {/* Login Route - public, used for auth redirects */}
        <Route 
          path={ROUTES.LOGIN} 
          element={
            <ProtectedRoute requireAuth={false}>
              <Login />
            </ProtectedRoute>
          } 
        />
        {/* Complaint form - guests can access but may need to login to submit */}
        <Route 
          path={ROUTES.COMPLAINT} 
          element={
            <ProtectedRoute requireAuth={false}>
              <ComplaintForm />
            </ProtectedRoute>
          } 
        />
        {/* Alternative complaint route using StudentComplaintForm for backward compatibility */}
        <Route 
          path={ROUTES.COMPLAINT_OLD} 
          element={
            <ProtectedRoute requireAuth={false}>
              <StudentComplaintForm />
            </ProtectedRoute>
          } 
        />
        
        {/* Admin Routes - Requires admin role */}
        <Route 
          path={ROUTES.ADMIN} 
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path={ROUTES.ADMIN_DASHBOARD} 
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />
        
        {/* Legal Officer Routes - Requires legalOfficer role */}
        <Route 
          path={ROUTES.OFFICER} 
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
          path={ROUTES.LEGAL_DASHBOARD} 
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
        
        {/* Officer Dashboard Route - New dashboard with metrics/trends/assigned cases */}
        <Route 
          path={ROUTES.OFFICER_DASHBOARD} 
          element={
            <ProtectedRoute allowedRoles={['admin', 'legalOfficer']}>
              <OfficerDashboard />
            </ProtectedRoute>
          } 
        />
        
        {/* Student Dashboard Route - Public/Guest access */}
        <Route 
          path={ROUTES.STUDENT_DASHBOARD} 
          element={
            <ProtectedRoute requireAuth={false}>
              <Welcome />
            </ProtectedRoute>
          } 
        />
        
        {/* Settings Route - Public access (no authentication required) */}
        <Route 
          path={ROUTES.SETTINGS} 
          element={
            <ProtectedRoute requireAuth={false}>
              <Settings />
            </ProtectedRoute>
          } 
        />
        
        {/* Catch all - redirect to welcome */}
        <Route path="*" element={<Navigate to={ROUTES.WELCOME} replace />} />
      </Routes>
    </>
  )
}

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <AppRoutes />
      </Router>
    </ErrorBoundary>
  )
}

export default App

