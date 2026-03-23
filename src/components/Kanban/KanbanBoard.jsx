import { useNavigate } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import KanbanColumn from './KanbanColumn'
import { useTasks } from '../../hooks/useTasks'
import { supabase } from '../../lib/supabaseClient'
import { useSnackbar } from '../../hooks/useSnackbar'

export default function KanbanBoard({ businessId, staffList }) {
  const { byStatus, loading, error, refetch } = useTasks(businessId)
  const navigate = useNavigate()
  const { show } = useSnackbar()

  const handleAssign = async (taskId, staffId) => {
    const { error } = await supabase
      .from('tasks')
      .update({ assigned_to: staffId, status: 'in_progress', assigned_at: new Date().toISOString(), is_draft: false })
      .eq('id', taskId)
    if (error) show('Failed to assign task', 'error')
    else show('Task assigned', 'success')
  }

  if (error) return (
    <div style={{ padding: 24, textAlign: 'center', color: 'var(--red)' }}>
      Failed to load tasks. <button onClick={refetch} style={{ color: 'var(--blue)', background: 'none', border: 'none', cursor: 'pointer' }}>Retry</button>
    </div>
  )

  return (
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
  )
}
