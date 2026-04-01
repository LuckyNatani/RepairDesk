import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabaseClient'
import { useNavigate } from 'react-router-dom'
import TaskListItem from '../components/Tasks/TaskListItem'
import SkeletonCard from '../components/shared/SkeletonCard'
import EmptyState from '../components/shared/EmptyState'
import Snackbar from '../components/shared/Snackbar'
import { useSnackbar } from '../hooks/useSnackbar'
import { isPushSupported, subscribeToPush, getNotificationPermission } from '../lib/pushNotifications'
import { ClipboardList, Bell } from 'lucide-react'

const TABS = ['in_progress', 'unassigned', 'completed']
const TAB_LABELS = { in_progress: 'In Progress', unassigned: 'Unassigned', completed: 'Done' }

export default function StaffMyTasks() {
  const { user, businessId, profile } = useAuth()
  const { snack, show } = useSnackbar()
  const navigate = useNavigate()
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100dvh - 56px - 64px)' }}>
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
          <button key={tab} onClick={() => setActiveTab(tab)} style={{ flex: 1, padding: '12px 4px', border: 'none', background: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: activeTab === tab ? 'var(--teal)' : 'var(--gray-600)', borderBottom: activeTab === tab ? '2px solid var(--teal)' : '2px solid transparent', transition: 'all 150ms ease' }}>
            {TAB_LABELS[tab]}
          </button>
        ))}
      </div>

      {/* Task List */}
      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 16 }}>
        {loading
          ? [0,1,2].map(i => <SkeletonCard key={i} lines={2} width="100%" />)
          : tasks.length === 0
            ? <EmptyState icon={<ClipboardList size={28} />} title={`No ${TAB_LABELS[activeTab].toLowerCase()} tasks`} body="You're all caught up!" />
            : tasks.map(t => <TaskListItem key={t.id} task={t} currentUserRole="staff" onViewDetail={() => navigate(`/${t.id}`)} />)
        }
      </div>

      <Snackbar open={snack.open} message={snack.message} type={snack.type} />
    </div>
  )
}
