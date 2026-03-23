import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import TaskCard from './TaskCard'
import SkeletonCard from '../shared/SkeletonCard'
import EmptyState from '../shared/EmptyState'
import { ClipboardList } from 'lucide-react'

const COL_CONFIG = {
  unassigned: { label: 'Unassigned', dotColor: 'var(--amber)' },
  in_progress: { label: 'In Progress', dotColor: 'var(--blue)' },
  completed:   { label: 'Completed',  dotColor: 'var(--green)' },
}

export default function KanbanColumn({ status, tasks, loading, staffList, onViewDetail, onAssign }) {
  const [collapsed, setCollapsed] = useState(false)
  const cfg = COL_CONFIG[status]

  return (
    <div className="kanban-col">
      {/* Column header */}
      <div className="kanban-col-header" onClick={() => setCollapsed(c => !c)}>
        <div className="kanban-col-dot" style={{ background: cfg.dotColor }} />
        <span style={{ fontFamily: '"Inter", sans-serif', fontWeight: 600, fontSize: 13, color: 'var(--grey-900)' }}>{cfg.label}</span>
        <span className="kanban-col-count">{tasks.length}</span>
        {collapsed ? <ChevronDown size={14} color="var(--grey-600)" /> : <ChevronUp size={14} color="var(--grey-600)" />}
      </div>

      {/* Tasks */}
      {!collapsed && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, overflowY: 'auto', paddingBottom: 12 }}>
          {loading
            ? [0,1,2].map(i => <SkeletonCard key={i} lines={3} />)
            : tasks.length === 0
              ? <EmptyState icon={<ClipboardList size={28} />} title={`No ${cfg.label.toLowerCase()} tasks`} />
              : tasks.map(task => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    staffList={staffList}
                    onViewDetail={onViewDetail}
                    onAssign={status === 'unassigned' ? onAssign : undefined}
                  />
                ))
          }
        </div>
      )}
    </div>
  )
}
