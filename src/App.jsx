import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './hooks/useAuth'

// Pages
import Login from './pages/Login'
import ChangePassword from './pages/ChangePassword'
import TrialExpired from './pages/TrialExpired'
import Suspended from './pages/Suspended'
import OwnerDashboard from './pages/OwnerDashboard'
import TasksListView from './pages/TasksListView'
import TaskDetailPage from './pages/TaskDetailPage'
import AnalyticsDashboard from './pages/AnalyticsDashboard'
import AdminPanel from './pages/AdminPanel'
import StaffMyTasks from './pages/StaffMyTasks'
import NotificationCentrePage from './pages/NotificationCentrePage'
import SADashboard from './pages/SA/SADashboard'
import SABusinessDetail from './pages/SA/SABusinessDetail'
import SACreateBusiness from './pages/SA/SACreateBusiness'

// Components
import SidebarNav from './components/layout/SidebarNav'

// ── Auth Guard ──────────────────────────────────────────
function RequireAuth({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <LoadingScreen />
  if (!user) return <Navigate to="/login" replace />
  return children
}

// ── Role redirect + account status guard ────────────────
function AuthedApp() {
  const { profile, loading, logout, mustChangePassword, accountStatus, role } = useAuth()
  if (loading) return <LoadingScreen />
  
  if (!profile) return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--navy)', padding: 24, textAlign: 'center' }}>
      <div style={{ color: '#fff', marginBottom: 20 }}>
        <h2 style={{ fontFamily: '"Inter", sans-serif' }}>Profile Not Found</h2>
        <p style={{ opacity: 0.7 }}>We couldn't find your user record. Please contact support.</p>
      </div>
      <button onClick={logout} style={{ padding: '10px 20px', background: 'var(--orange)', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer' }}>Sign Out</button>
    </div>
  )

  // 1. Forced password change
  if (mustChangePassword) return <ChangePassword />

  // 2. Deactivated staff/owners
  if (role !== 'superadmin' && profile?.is_active === false) return <Suspended />

  // 3. Account status checks (not SA)
  if (role !== 'superadmin') {
    if (accountStatus === 'suspended') return <Suspended />
    if (accountStatus === 'trial_expired') return <TrialExpired />
  }

  return (
    <div style={{ display: 'flex', minHeight: '100dvh' }}>
      {role !== 'superadmin' && <SidebarNav />}
      <div style={{ flex: 1, minWidth: 0 }}>
        <Routes>
          {/* Superadmin routes */}
          {role === 'superadmin' && <>
            <Route path="/sa" element={<SADashboard />} />
            <Route path="/sa/businesses/:id" element={<SABusinessDetail />} />
            <Route path="/sa/businesses/new" element={<SACreateBusiness />} />
            <Route path="*" element={<Navigate to="/sa" replace />} />
          </>}

          {/* Owner routes */}
          {role === 'owner' && <>
            <Route path="/" element={<OwnerDashboard />} />
            <Route path="/tasks" element={<TasksListView />} />
            <Route path="/analytics" element={<AnalyticsDashboard />} />
            <Route path="/admin" element={<AdminPanel />} />
            <Route path="/notifications" element={<NotificationCentrePage />} />
            <Route path="/:taskId" element={<TaskDetailPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </>}

          {/* Staff routes */}
          {role === 'staff' && <>
            <Route path="/my-tasks" element={<StaffMyTasks />} />
            <Route path="/tasks" element={<TasksListView />} />
            <Route path="/notifications" element={<NotificationCentrePage />} />
            <Route path="/:taskId" element={<TaskDetailPage />} />
            <Route path="*" element={<Navigate to="/my-tasks" replace />} />
          </>}
        </Routes>
      </div>
    </div>
  )
}

function LoadingScreen() {
  return (
    <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--navy)', flexDirection: 'column', gap: 16 }}>
      <div style={{ width: 48, height: 48, background: 'rgba(255,255,255,0.15)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>
      </div>
      <p style={{ color: 'rgba(255,255,255,0.6)', fontFamily: '"Inter", sans-serif', fontSize: 14, margin: 0 }}>Loading TaskPod…</p>
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="*" element={<RequireAuth><AuthedApp /></RequireAuth>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return null
  if (user) return <Navigate to="/" replace />
  return children
}
