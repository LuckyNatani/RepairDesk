import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useNotifications } from '../hooks/useNotifications'
import { NotificationRow } from '../components/Notifications/NotificationCentre'
import { ArrowLeft, CheckCheck } from 'lucide-react'
import EmptyState from '../components/shared/EmptyState'
import { Bell } from 'lucide-react'

export default function NotificationCentrePage() {
  const { user } = useAuth()
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications(user?.id)
  const navigate = useNavigate()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100dvh' }}>
      <div className="app-bar">
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', padding: 4 }}><ArrowLeft size={20} /></button>
        <span className="app-bar-title">Notifications</span>
        {unreadCount > 0 && (
          <button onClick={markAllRead} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.8)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 12 }}>
            <CheckCheck size={16} /> Mark all read
          </button>
        )}
      </div>
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {notifications.length === 0
          ? <EmptyState icon={<Bell size={28} />} title="No notifications" body="You're all caught up!" />
          : notifications.map(n => (
              <NotificationRow key={n.id} notification={n} onClick={() => {
                markRead(n.id)
                if (n.task_id) navigate(`/${n.task_id}`)
              }} />
            ))
        }
      </div>
    </div>
  )
}
