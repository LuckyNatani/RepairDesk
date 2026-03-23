import { useAuth } from '../hooks/useAuth'
import TaskSearch from '../components/Tasks/TaskSearch'
import NotificationBell from '../components/Notifications/NotificationBell'
import OfflineBanner from '../components/shared/OfflineBanner'
import { useNavigate, useLocation } from 'react-router-dom'
import { LayoutDashboard, List, BarChart2, Users, ClipboardList } from 'lucide-react'

export default function TasksListView() {
  const { user, businessId,Role, profile } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const isOwner = profile?.role === 'owner'

  const ownerTabs = [
    { id: '/', label: 'Dashboard', Icon: LayoutDashboard },
    { id: '/tasks', label: 'Tasks', Icon: List },
    { id: '/analytics', label: 'Analytics', Icon: BarChart2 },
    { id: '/admin', label: 'Admin', Icon: Users },
  ]
  const staffTabs = [
    { id: '/my-tasks', label: 'My Tasks', Icon: ClipboardList },
    { id: '/tasks', label: 'All Tasks', Icon: List },
  ]
  const tabs = isOwner ? ownerTabs : staffTabs

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100dvh' }}>
      <div className="app-bar">
        <span className="app-bar-title">Tasks</span>
        <NotificationBell userId={user?.id} />
      </div>
      <OfflineBanner />
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <TaskSearch businessId={businessId} currentUserRole={profile?.role} />
      </div>
      <div className="bottom-tabs">
        {tabs.map(({ id, label, Icon }) => (
          <button key={id} className={`bottom-tab${location.pathname === id ? ' active' : ''}`} onClick={() => navigate(id)}>
            <Icon size={20} /><span>{label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
