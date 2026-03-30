import { formatDistanceToNow } from 'date-fns'
import StatusBadge from '../shared/StatusBadge'
import { ChevronRight, AlertCircle } from 'lucide-react'

export default function TaskListItem({ task, currentUserRole, onViewDetail }) {
  const isOverdue = task.due_at && new Date(task.due_at) < new Date() && task.status !== 'completed'
  return (
    <div onClick={() => onViewDetail?.()} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: '#fff', borderBottom: '1px solid #F0F0F0', cursor: 'pointer', borderLeft: task.is_urgent ? '3px solid var(--red)' : '3px solid transparent', transition: 'background 150ms ease' }}
      onMouseEnter={e => e.currentTarget.style.background = '#F9F9F9'} onMouseLeave={e => e.currentTarget.style.background = '#fff'}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
          <span style={{ fontFamily: '"Inter", sans-serif', fontSize: 11, fontWeight: 600, color: 'var(--gray-600)' }}>#{task.task_number}</span>
          <StatusBadge status={task.status} size="sm" />
          {task.is_urgent && <span className="badge badge-sm badge-urgent">!</span>}
          {isOverdue && <AlertCircle size={12} color="var(--red)" />}
        </div>
        <p style={{ margin: '0 0 2px', fontWeight: 600, fontSize: 14, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{task.customer_name}</p>
        <p style={{ margin: 0, fontSize: 12, color: 'var(--gray-600)' }}>
          {task.assigned_user?.name ? `→ ${task.assigned_user.name}` : 'Unassigned'} · {formatDistanceToNow(new Date(task.created_at), { addSuffix: true })}
        </p>
      </div>
      <ChevronRight size={16} color="var(--gray-600)" />
    </div>
  )
}
