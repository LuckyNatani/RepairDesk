import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronRight, Search } from 'lucide-react'
import KanbanColumn from './KanbanColumn'
import { useTasks, updateTask } from '../../hooks/useTasks'
import { useAuth } from '../../hooks/useAuth'
import { useSnackbar } from '../../hooks/useSnackbar'

export default function KanbanBoard({ businessId, staffList }) {
  const [selectedPeriod, setSelectedPeriod] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const { byStatus, loading, error, refetch } = useTasks(businessId, selectedPeriod, searchQuery)
  const navigate = useNavigate()
  const { show } = useSnackbar()
  const { user } = useAuth()

  const handleAssign = async (taskId, staffId) => {
    const updates = { assigned_to: staffId, status: 'in_progress', assigned_at: new Date().toISOString(), is_draft: false }
    const { error } = await updateTask(taskId, updates, { actorId: user?.id })
    if (error) show('Failed to assign task', 'error')
    else show('Task assigned', 'success')
  }

  if (error) return (
    <div style={{ padding: 24, textAlign: 'center', color: 'var(--red)' }}>
      Failed to load tasks. <button onClick={refetch} style={{ color: 'var(--blue)', background: 'none', border: 'none', cursor: 'pointer' }}>Retry</button>
    </div>
  )

  const periods = [
    { id: 'all', label: 'All' },
    { id: 'daily', label: 'Daily' },
    { id: 'weekly', label: 'Weekly' },
    { id: 'monthly', label: 'Monthly' }
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="filter-container" style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: 300 }}>
          <Search size={16} color="var(--gray-500)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
          <input 
            type="text" 
            placeholder="Search by name, phone or ID..." 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{ width: '100%', padding: '8px 12px 8px 36px', borderRadius: 100, border: '1px solid #E0E0E0', fontSize: 13, outline: 'none' }}
          />
        </div>
        <div className="segmented-filter">
          {periods.map(p => (
            <button
              key={p.id}
              className={`filter-pill ${selectedPeriod === p.id ? 'active' : ''}`}
              onClick={() => setSelectedPeriod(p.id)}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="kanban-board" id="scroll-container">
        <KanbanColumn status="unassigned" tasks={byStatus.unassigned} loading={loading} staffList={staffList} onViewDetail={(id) => navigate(`/${id}`)} onAssign={handleAssign} />
        <KanbanColumn status="in_progress" tasks={byStatus.in_progress} loading={loading} staffList={staffList} onViewDetail={(id) => navigate(`/${id}`)} />
        <div className="kanban-col">
          <KanbanColumn status="completed" tasks={byStatus.completed} loading={loading} staffList={staffList} onViewDetail={(id) => navigate(`/${id}`)} />
          <button onClick={() => navigate('/tasks?status=completed&range=all')} style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--blue)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, paddingLeft: 4, marginTop: 4 }}>
            View older tasks <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  )
}
