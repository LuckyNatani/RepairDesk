import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabaseClient'
import { useNavigate, useLocation } from 'react-router-dom'
import NotificationBell from '../components/Notifications/NotificationBell'
import TaskListItem from '../components/Tasks/TaskListItem'
import SkeletonCard from '../components/shared/SkeletonCard'
import EmptyState from '../components/shared/EmptyState'
import Snackbar from '../components/shared/Snackbar'
import { useSnackbar } from '../hooks/useSnackbar'
import { isPushSupported, subscribeToPush, getNotificationPermission } from '../lib/pushNotifications'
import { ClipboardList, List, Bell, LogOut } from 'lucide-react'

const TABS = ['in_progress', 'unassigned', 'completed']
const TAB_LABELS = { in_progress: 'In Progress', unassigned: 'Unassigned', completed: 'Done' }

export default function StaffMyTasks() {
  const { user, businessId, profile, logout } = useAuth()
  const { snack, show } = useSnackbar()
  const navigate = useNavigate(); const location = useLocation()
  const [activeTab, setActiveTab] = useState('in_progress')
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [pushPermission, setPushPermission] = useState(getNotificationPermission())

  const loadTasks = async () => {
    if (!user?.id) return; setLoading(true)
    const { data } = await supabase.from('tasks').select('*').eq('assigned_to', user.id).eq('status', activeTab).order('created_at', { ascending: false })
    setTasks(data || []); setLoading(false)
  }
  useEffect(() => { loadTasks() }, [activeTab, user?.id])

  const enablePush = async () => {
    const sub = await subscribeToPush(user.id)
    if (sub) { setPushPermission('granted'); show('Push notifications enabled!', 'success') }
    else show('Permission denied or not supported', 'error')
  }

  const navTabs = [
    { id: '/my-tasks', label: 'My Tasks', Icon: ClipboardList },
    { id: '/tasks', label: 'All Tasks', Icon: List },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100dvh' }}>
      <div className="app-bar">
        <span className="app-bar-title">My Tasks</span>
        <div className="flex items-center gap-2">
          <NotificationBell userId={user?.id} />
          <button onClick={logout} className="mobile-logout" title="Sign Out">
            <LogOut size={20} />
          </button>
        </div>
      </div>

      {/* Push CTA */}
      {isPushSupported() && pushPermission !== 'granted' && (
        <div style={{ background: 'var(--blue-surface)', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 10, borderBottom: '2px solid var(--blue)' }}>
          <Bell size={16} color="var(--blue)" />
          <span style={{ flex: 1, fontSize: 13, color: 'var(--blue)' }}>Enable push notifications to get task alerts.</span>
          <button onClick={enablePush} style={{ background: 'var(--blue)', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 14px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Enable</button>
        </div>
      )}

      {/* Filter Tabs */}
      <div style={{ display: 'flex', background: '#fff', borderBottom: '1px solid #E0E0E0' }}>
        {TABS.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{ flex: 1, padding: '12px 4px', border: 'none', background: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: activeTab === tab ? 'var(--navy)' : 'var(--grey-600)', borderBottom: activeTab === tab ? '2px solid var(--navy)' : '2px solid transparent', transition: 'all 150ms ease' }}>
            {TAB_LABELS[tab]}
          </button>
        ))}
      </div>

      {/* Task List */}
      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 80 }}>
        {loading
          ? [0,1,2].map(i => <SkeletonCard key={i} lines={2} width="100%" />)
          : tasks.length === 0
            ? <EmptyState icon={<ClipboardList size={28} />} title={`No ${TAB_LABELS[activeTab].toLowerCase()} tasks`} body="You're all caught up!" />
            : tasks.map(t => <TaskListItem key={t.id} task={t} currentUserRole="staff" onViewDetail={() => navigate(`/${t.id}`)} />)
        }
      </div>

      <div className="bottom-tabs">
        {navTabs.map(({ id, label, Icon }) => (
          <button key={id} className={`bottom-tab${location.pathname === id ? ' active' : ''}`} onClick={() => navigate(id)}>
            <Icon size={20} /><span>{label}</span>
          </button>
        ))}
      </div>
      <Snackbar open={snack.open} message={snack.message} type={snack.type} />
    </div>
  )
}
