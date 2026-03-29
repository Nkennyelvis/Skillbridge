import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'

// Auth pages
import Login from './pages/Login'
import Register from './pages/Register'

// Learner pages
import LearnerDashboard from './pages/learner/Dashboard'
import CoursesMarketplace from './pages/learner/CoursesMarketplace'
import CourseDetail from './pages/learner/CourseDetail'
import CourseLearn from './pages/learner/CourseLearn'
import CertificatesPage from './pages/learner/Certificates'
import InternshipsPage from './pages/learner/Internships'
import PaymentSuccess from './pages/learner/PaymentSuccess'

// Tutor pages
import TutorDashboard from './pages/tutor/Dashboard'
import CourseUpload from './pages/tutor/CourseUpload'

// Admin pages
import AdminDashboard from './pages/admin/Dashboard'

// Layout
import DashboardLayout from './components/layout/DashboardLayout'

function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="min-h-screen flex items-center justify-center"><Spinner /></div>
  if (!user) return <Navigate to="/login" replace />
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />
  return children
}

function Spinner() {
  return (
    <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
  )
}

function RoleHome() {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" />
  if (user.role === 'admin') return <Navigate to="/admin" />
  if (user.role === 'tutor') return <Navigate to="/tutor" />
  return <Navigate to="/dashboard" />
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<RoleHome />} />

          {/* Learner */}
          <Route path="/dashboard" element={
            <ProtectedRoute roles={['learner']}>
              <DashboardLayout><LearnerDashboard /></DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/courses" element={
            <ProtectedRoute roles={['learner']}>
              <DashboardLayout><CoursesMarketplace /></DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/courses/:id" element={
            <ProtectedRoute roles={['learner']}>
              <DashboardLayout><CourseDetail /></DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/learn/:id" element={
            <ProtectedRoute roles={['learner']}>
              <DashboardLayout><CourseLearn /></DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/certificates" element={
            <ProtectedRoute roles={['learner']}>
              <DashboardLayout><CertificatesPage /></DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/internships" element={
            <ProtectedRoute roles={['learner']}>
              <DashboardLayout><InternshipsPage /></DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/payment-success" element={
            <ProtectedRoute roles={['learner']}>
              <DashboardLayout><PaymentSuccess /></DashboardLayout>
            </ProtectedRoute>
          } />

          {/* Tutor */}
          <Route path="/tutor" element={
            <ProtectedRoute roles={['tutor']}>
              <DashboardLayout><TutorDashboard /></DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/tutor/create-course" element={
            <ProtectedRoute roles={['tutor']}>
              <DashboardLayout><CourseUpload /></DashboardLayout>
            </ProtectedRoute>
          } />

          {/* Admin */}
          <Route path="/admin" element={
            <ProtectedRoute roles={['admin']}>
              <DashboardLayout><AdminDashboard /></DashboardLayout>
            </ProtectedRoute>
          } />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
