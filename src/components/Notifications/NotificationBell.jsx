import { Bell } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useNotifications } from '../../hooks/useNotifications'

export default function NotificationBell({ userId }) {
  const { unreadCount } = useNotifications(userId)
  const navigate = useNavigate()
  return (
    <button onClick={() => navigate('/notifications')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#fff', display: 'flex', alignItems: 'center', position: 'relative', padding: 6 }} aria-label="Notifications">
      <Bell size={22} />
      {unreadCount > 0 && (
        <span style={{ position: 'absolute', top: 2, right: 2, background: 'var(--amber)', color: '#fff', fontSize: 9, fontWeight: 700, padding: '1px 4px', borderRadius: 100, minWidth: 15, textAlign: 'center' }}>
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </button>
  )
}
