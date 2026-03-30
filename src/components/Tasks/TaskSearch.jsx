import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Search, X, Filter } from 'lucide-react'
import { supabase } from '../../lib/supabaseClient'
import TaskListItem from './TaskListItem'
import SkeletonCard from '../shared/SkeletonCard'
import EmptyState from '../shared/EmptyState'

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'unassigned', label: 'Unassigned' },
  { id: 'in_progress', label: 'In Progress' },
  { id: 'completed', label: 'Completed' },
  { id: 'urgent', label: 'Urgent' },
]

const OWNER_FILTERS = [...FILTERS, { id: 'drafts', label: 'Drafts' }]

export default function TaskSearch({ businessId, currentUserRole, assignedToId = null }) {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState(searchParams.get('filter') || 'all')
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(false)
  const debounceRef = useRef(null)

  const fetchTasks = useCallback(async (q, f) => {
    if (!businessId) return
    setLoading(true)
    let qb = supabase.from('tasks').select(`*, assigned_user:assigned_to(id,name,avatar_color)`).eq('business_id', businessId).order('created_at', { ascending: false }).limit(100)
    if (assignedToId) qb = qb.eq('assigned_to', assignedToId)
    if (f === 'drafts') qb = qb.eq('is_draft', true)
    else if (f === 'urgent') qb = qb.eq('is_urgent', true).eq('is_draft', false)
    else if (f !== 'all') qb = qb.eq('status', f).eq('is_draft', false)
    else qb = qb.eq('is_draft', false)
    if (q.trim()) qb = qb.or(`customer_name.ilike.%${q}%,customer_phone.ilike.%${q}%,customer_address.ilike.%${q}%`)
    const { data } = await qb
    setTasks(data || [])
    setLoading(false)
  }, [businessId, assignedToId])

  useEffect(() => {
    fetchTasks(query, filter)
  }, [filter, fetchTasks])

  const handleQuery = (val) => {
    setQuery(val)
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => fetchTasks(val, filter), 300)
  }

  const chips = currentUserRole === 'owner' ? OWNER_FILTERS : FILTERS

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Search bar */}
      <div style={{ padding: '12px 16px 0', background: '#fff', borderBottom: '1px solid #F0F0F0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#F5F5F5', borderRadius: 10, padding: '8px 14px', marginBottom: 10 }}>
          <Search size={16} color="var(--gray-600)" />
          <input value={query} onChange={e => handleQuery(e.target.value)} placeholder="Search tasks…" style={{ flex: 1, border: 'none', background: 'transparent', fontSize: 14, outline: 'none', color: 'var(--gray-900)' }} />
          {query && <button onClick={() => handleQuery('')} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex' }}><X size={14} color="var(--gray-600)" /></button>}
        </div>
        {/* Filter chips */}
        <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 10, scrollbarWidth: 'none' }}>
          {chips.map(c => (
            <button key={c.id} onClick={() => setFilter(c.id)} style={{ padding: '5px 12px', borderRadius: 100, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap', background: filter === c.id ? 'var(--navy)' : '#F0F0F0', color: filter === c.id ? '#fff' : 'var(--gray-600)', transition: 'all 150ms ease' }}>
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {loading
          ? [0,1,2,3,4].map(i => <SkeletonCard key={i} lines={2} width="100%" />)
          : tasks.length === 0
            ? <EmptyState icon={<Filter size={28} />} title="No tasks found" body="Try adjusting your search or filters" />
            : tasks.map(task => <TaskListItem key={task.id} task={task} currentUserRole={currentUserRole} onViewDetail={() => navigate(`/${task.id}`)} />)
        }
      </div>
    </div>
  )
}
