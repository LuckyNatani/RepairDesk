import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './hooks/useAuth'

// Pages
import Landing from './pages/Landing'
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
import ResetPassword from './pages/ResetPassword'
import SADashboard from './pages/SA/SADashboard'
import SABusinessDetail from './pages/SA/SABusinessDetail'
import SACreateBusiness from './pages/SA/SACreateBusiness'
import SASettings from './pages/SA/SASettings'
import AccountStatus from './pages/AccountStatus'
import PublicStatus from './pages/PublicStatus'

// Components
import BottomTabBar from './components/layout/BottomTabBar'
import NotificationBell from './components/Notifications/NotificationBell'
import Logo from './components/shared/Logo'

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
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--white)', padding: 24, textAlign: 'center' }}>
      <div style={{ color: 'var(--black)', marginBottom: 20 }}>
        <h2 style={{ fontFamily: '"Inter", sans-serif' }}>Profile Not Found</h2>
        <p style={{ opacity: 0.7 }}>We couldn't find your user record. Please contact support.</p>
      </div>
      <button onClick={logout} className="btn btn-primary">Sign Out</button>
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
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100dvh' }}>
      {/* App Bar for Owner/Staff */}
      {role !== 'superadmin' && (
        <header className="app-bar">
          <Logo className="w-7 h-7" textClassName="hidden" textColor="default" />
          <span className="app-bar-title">TaskPod</span>
          <NotificationBell />
          <button className="mobile-logout" onClick={logout} aria-label="Sign Out">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          </button>
        </header>
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <Routes>
          {/* Superadmin routes */}
          {role === 'superadmin' && <>
            <Route path="/sa" element={<SADashboard />} />
            <Route path="/sa/businesses/:id" element={<SABusinessDetail />} />
            <Route path="/sa/businesses/new" element={<SACreateBusiness />} />
            <Route path="/sa/settings" element={<SASettings />} />
            <Route path="*" element={<Navigate to="/sa" replace />} />
          </>}

          {/* Owner routes */}
          {role === 'owner' && <>
            <Route path="/" element={<OwnerDashboard />} />
            <Route path="/tasks" element={<TasksListView />} />
            <Route path="/analytics" element={<AnalyticsDashboard />} />
            <Route path="/admin" element={<AdminPanel />} />
            <Route path="/notifications" element={<NotificationCentrePage />} />
            <Route path="/account" element={<AccountStatus />} />
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
      {/* Bottom Tab Bar for Owner/Staff (mobile-first) */}
      {role !== 'superadmin' && <BottomTabBar />}
    </div>
  )
}

function LoadingScreen() {
  return (
    <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--white)', flexDirection: 'column', gap: 20 }}>
      <div className="animate-pulse">
        <Logo className="w-16 h-16" textClassName="hidden" textColor="default" />
      </div>
      <div className="flex flex-col items-center gap-1">
        <p style={{ color: 'var(--black)', fontFamily: '"Inter", sans-serif', fontSize: 16, fontWeight: 700, margin: 0, letterSpacing: '0.05em' }}>TaskPod</p>
        <div style={{ width: 100, height: 2, background: 'var(--gray-100)', borderRadius: 1, overflow: 'hidden', position: 'relative' }}>
          <div className="loading-bar-inner" />
        </div>
      </div>
      <style>{`
        @keyframes loadingBar {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .loading-bar-inner {
          position: absolute; top: 0; left: 0; height: 100%; width: 50%;
          background: #00D1B2;
          animation: loadingBar 1s infinite linear;
        }
      `}</style>
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomeRoute />} />
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/track/:taskId" element={<PublicStatus />} />
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

function HomeRoute() {
  const { user, role, loading } = useAuth()
  if (loading) return <LoadingScreen />
  if (!user) return <Landing />
  
  // Dashboard routing
  if (role === 'superadmin') return <Navigate to="/sa" replace />
  if (role === 'staff') return <Navigate to="/my-tasks" replace />
  
  // Default for owner or anything else
  return <AuthedApp />
}
