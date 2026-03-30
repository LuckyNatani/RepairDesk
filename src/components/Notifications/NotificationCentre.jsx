import { AlertTriangle, Clock, CheckCircle, MessageSquare, Users, Bell, RotateCcw } from 'lucide-react'

const EVENT_ICONS = {
  assigned: { Icon: Bell, color: 'var(--blue)' },
  completed: { Icon: CheckCircle, color: 'var(--green)' },
  remarked: { Icon: MessageSquare, color: 'var(--amber)' },
  reassigned: { Icon: RotateCcw, color: 'var(--navy)' },
  account_activated: { Icon: CheckCircle, color: 'var(--green)' },
  account_suspended: { Icon: AlertTriangle, color: 'var(--red)' },
  draft_reminder: { Icon: Clock, color: 'var(--amber)' },
  staff_deactivated: { Icon: Users, color: 'var(--red)' },
}

export function NotificationRow({ notification, onClick }) {
  const cfg = EVENT_ICONS[notification.event_type] || { Icon: Bell, color: 'var(--gray-600)' }
  const { Icon } = cfg
  return (
    <div onClick={onClick} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 16px', background: notification.is_read ? '#fff' : 'var(--amber-surface)', borderBottom: '1px solid #F0F0F0', cursor: 'pointer', transition: 'background 150ms ease' }}>
      <div style={{ marginTop: 2, flexShrink: 0 }}>
        <Icon size={16} color={cfg.color} />
      </div>
      <div style={{ flex: 1 }}>
        <p style={{ margin: '0 0 2px', fontSize: 13, color: 'var(--gray-900)', lineHeight: 1.5 }}>{notification.message}</p>
        <span style={{ fontSize: 11, color: 'var(--gray-600)' }}>{new Date(notification.created_at).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
      </div>
      {!notification.is_read && <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--blue)', flexShrink: 0, marginTop: 4 }} />}
    </div>
  )
}
