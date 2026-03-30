import { useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { AlertCircle, Clock, User, ChevronDown } from 'lucide-react'
import StatusBadge from '../shared/StatusBadge'

const STATUS_DOT_COLOR = { unassigned: 'var(--amber)', in_progress: 'var(--blue)', completed: 'var(--green)' }

export default function TaskCard({ task, staffList = [], onViewDetail, onAssign }) {
  const [showAssign, setShowAssign] = useState(false)
  const isOverdue = task.due_at && new Date(task.due_at) < new Date() && task.status !== 'completed'
  const isAging = task.status === 'unassigned' && (Date.now() - new Date(task.created_at)) > 3600000

  const cardClass = [
    'task-card',
    task.is_urgent ? 'urgent' : task.status,
    isAging ? 'card-tinted-amber' : '',
  ].filter(Boolean).join(' ')

  const handleAssign = (staffId) => {
    setShowAssign(false)
    onAssign?.(task.id, staffId)
  }

  return (
    <div className={cardClass} onClick={() => !showAssign && onViewDetail?.(task.id)}>
      {/* Row 1: Task # + time + urgent */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
        <span style={{ fontFamily: '"Inter", sans-serif', fontSize: 11, fontWeight: 600, color: 'var(--gray-600)' }}>#{task.task_number}</span>
        {task.is_urgent && <span className="badge badge-sm badge-urgent">URGENT</span>}
        {task.is_draft && <span className="badge badge-sm" style={{ background: 'var(--amber-surface)', color: 'var(--amber)' }}>Draft</span>}
        <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--gray-600)' }}>
          {formatDistanceToNow(new Date(task.created_at), { addSuffix: true })}
        </span>
      </div>

      {/* Row 2: Customer name */}
      <p style={{ margin: '0 0 5px', fontWeight: 600, fontSize: 14, color: 'var(--gray-900)', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
        {task.customer_name}
      </p>

      {/* Row 3: Address or draft hint */}
      {task.is_draft
        ? <p style={{ margin: '0 0 8px', fontSize: 12, color: 'var(--amber)', fontStyle: 'italic' }}>Draft — tap to complete details</p>
        : task.customer_address
          ? <p style={{ margin: '0 0 8px', fontSize: 12, color: 'var(--gray-600)', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{task.customer_address}</p>
          : null
      }

      {/* Row 4: Assigned staff or Assign button */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        {task.assigned_user
          ? <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <User size={12} color="var(--gray-600)" />
              <span style={{ fontSize: 12, color: 'var(--gray-600)' }}>{task.assigned_user.name}</span>
            </div>
          : task.status === 'unassigned' && onAssign
            ? <button
                onClick={e => { e.stopPropagation(); setShowAssign(s => !s) }}
                style={{ fontSize: 12, color: 'var(--blue)', fontWeight: 600, background: 'var(--blue-surface)', border: 'none', borderRadius: 6, padding: '3px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                Assign <ChevronDown size={11} />
              </button>
            : <span style={{ fontSize: 12, color: 'var(--gray-600)' }}>Unassigned</span>
        }

        {/* Due date / aging */}
        {isOverdue && task.due_at && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--red)', fontSize: 11 }}>
            <Clock size={11} /> Overdue
          </div>
        )}
        {isAging && !task.due_at && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--amber)', fontSize: 11 }}>
            <AlertCircle size={11} /> {formatDistanceToNow(new Date(task.created_at), { addSuffix: true })}
          </div>
        )}
      </div>

      {/* Assign popover */}
      {showAssign && staffList.length > 0 && (
        <div onClick={e => e.stopPropagation()} style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#fff', borderRadius: '0 0 10px 10px', boxShadow: 'var(--shadow-lg)', zIndex: 10, border: '1px solid #E0E0E0', overflow: 'hidden' }}>
          {staffList.map(s => (
            <button key={s.id} onClick={() => handleAssign(s.id)} style={{ width: '100%', padding: '10px 14px', border: 'none', background: 'none', cursor: 'pointer', textAlign: 'left', fontSize: 13, color: 'var(--gray-900)', display: 'flex', alignItems: 'center', gap: 8, borderBottom: '1px solid #F5F5F5' }}>
              <User size={14} color="var(--gray-600)" /> {s.name}
              {s.activeTasks !== undefined && <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--gray-600)' }}>({s.activeTasks} active)</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
