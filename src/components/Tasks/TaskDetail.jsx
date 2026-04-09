import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { formatDistanceToNow, format } from 'date-fns'
import { ArrowLeft, Phone, MapPin, Clock, AlertCircle, RefreshCw, Share2 } from 'lucide-react'
import { supabase } from '../../lib/supabaseClient'
import { updateTask } from '../../hooks/useTasks'
import StatusBadge from '../shared/StatusBadge'
import ConfirmModal from '../shared/ConfirmModal'
import ConflictSnackbar from '../shared/ConflictSnackbar'
import WhatsAppShareButton from '../shared/WhatsAppShareButton'
import Avatar from '../shared/Avatar'
import { toTelLink } from '../../lib/phoneUtils'
import TaskTimeline from './TaskTimeline'

function RemarkItem({ remark }) {
  return (
    <div style={{ display: 'flex', gap: 10, padding: '10px 0', borderBottom: '1px solid #F5F5F5' }}>
      <Avatar name={remark.author?.name || '?'} color={remark.author?.avatar_color || '#757575'} size="sm" />
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--gray-900)' }}>{remark.author?.name}</span>
          {remark.is_system && <span className="badge badge-sm" style={{ background: 'var(--gray-100)', color: 'var(--gray-600)' }}>System</span>}
          <span style={{ fontSize: 11, color: 'var(--gray-600)', marginLeft: 'auto' }}>{formatDistanceToNow(new Date(remark.created_at), { addSuffix: true })}</span>
        </div>
        <p style={{ margin: 0, fontSize: 13, color: 'var(--gray-900)', lineHeight: 1.5 }}>{remark.text}</p>
      </div>
    </div>
  )
}

function RemarkInput({ taskId, authorId, onSuccess }) {
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const charCount = text.length
  const submit = async () => {
    if (!text.trim()) return
    setLoading(true)
    const { data } = await supabase.from('remarks').insert({ task_id: taskId, author_id: authorId, text: text.trim() }).select().single()
    setLoading(false)
    if (data) { setText(''); onSuccess?.(data) }
  }
  return (
    <div style={{ paddingTop: 12 }}>
      <textarea className="input" rows={3} value={text} onChange={e => setText(e.target.value)} maxLength={500} placeholder="Add a remark…" style={{ resize: 'none', marginBottom: 4 }} />
      {charCount >= 450 && <div style={{ fontSize: 11, color: charCount >= 490 ? 'var(--red)' : 'var(--gray-600)', textAlign: 'right', marginBottom: 6 }}>{charCount}/500</div>}
      <button className="btn btn-primary btn-full btn-sm" onClick={submit} disabled={loading || !text.trim()}>
        {loading ? 'Adding…' : 'Add Remark'}
      </button>
    </div>
  )
}

export default function TaskDetail({ taskId, currentUser }) {
  const navigate = useNavigate()
  const [task, setTask] = useState(null)
  const [remarks, setRemarks] = useState([])
  const [staffList, setStaffList] = useState([])
  const [loading, setLoading] = useState(true)
  const [conflict, setConflict] = useState(false)
  const [confirmComplete, setConfirmComplete] = useState(false)
  const [confirmReopen, setConfirmReopen] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  const remarksRef = useRef(null)
  const lastVersionRef = useRef(null)

  const isOwner = currentUser?.role === 'owner'
  const isMyTask = task?.assigned_to === currentUser?.id

  const fetchTask = async () => {
    const { data } = await supabase.from('tasks').select(`*, assigned_user:assigned_to(id,name,phone,avatar_color), creator:created_by(id,name)`).eq('id', taskId).single()
    if (data) { setTask(data); lastVersionRef.current = data.version }
    setLoading(false)
  }

  const fetchRemarks = async () => {
    const { data } = await supabase.from('remarks').select(`*, author:author_id(id,name,avatar_color)`).eq('task_id', taskId).order('created_at', { ascending: true })
    setRemarks(data || [])
  }

  const fetchStaff = async () => {
    if (!currentUser?.business_id) return
    const { data } = await supabase.from('users').select('id,name,phone,avatar_color,last_seen_at').eq('business_id', currentUser.business_id).eq('role', 'staff').eq('is_active', true)
    if (!data) { setStaffList([]); return }
    // Fetch workload counts (PRD §1.2: "Amit (2 active) · 5m ago")
    const { data: taskCounts } = await supabase.from('tasks').select('assigned_to').eq('business_id', currentUser.business_id).eq('status', 'in_progress')
    const countMap = {}
    taskCounts?.forEach(t => { if (t.assigned_to) countMap[t.assigned_to] = (countMap[t.assigned_to] || 0) + 1 })
    setStaffList(data.map(s => ({ ...s, activeTasks: countMap[s.id] || 0 })))
  }

  useEffect(() => {
    fetchTask(); fetchRemarks(); fetchStaff()
    const ch = supabase.channel(`task-detail:${taskId}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'tasks', filter: `id=eq.${taskId}` }, (payload) => {
        if (lastVersionRef.current && payload.new.version !== lastVersionRef.current) setConflict(true)
        fetchTask()
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'remarks', filter: `task_id=eq.${taskId}` }, fetchRemarks)
      .subscribe()
    return () => supabase.removeChannel(ch)
  }, [taskId])

  const assignStaff = async (staffId) => {
    const updates = { assigned_to: staffId, status: 'in_progress', assigned_at: new Date().toISOString() }
    const res = await updateTask(taskId, updates, { actorId: currentUser.id, expectedVersion: lastVersionRef.current })

    if (res.conflict || res.error) setConflict(true)
    else fetchTask()
  }

  const markComplete = async () => {
    setActionLoading(true)
    const updates = { status: 'completed', completed_at: new Date().toISOString() }
    const res = await updateTask(taskId, updates, { actorId: currentUser.id, expectedVersion: lastVersionRef.current })
    
    setActionLoading(false)
    if (res.conflict || res.error) setConflict(true)
    else { setConfirmComplete(false); fetchTask() }
  }

  const reopenTask = async () => {
    setActionLoading(true)
    const updates = { status: 'unassigned', completed_at: null, assigned_to: null }
    const res = await updateTask(taskId, updates, { actorId: currentUser.id, expectedVersion: lastVersionRef.current })

    setActionLoading(false)
    if (res.conflict || res.error) setConflict(true)
    else { setConfirmReopen(false); fetchTask() }
  }

  if (loading) return <div style={{ padding: 20 }}>{[0,1,2].map(i => <div key={i} className="skeleton" style={{ height: 40, borderRadius: 8, marginBottom: 12 }} />)}</div>
  if (!task) return <div style={{ padding: 24, textAlign: 'center', color: 'var(--gray-600)' }}>Task not found</div>

  const mapsUrl = `https://maps.google.com/?q=${encodeURIComponent(task.customer_address || '')}`

  return (
    <div style={{ maxWidth: 600, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ background: 'var(--navy)', color: '#fff', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', padding: 4 }}>
          <ArrowLeft size={20} />
        </button>
        <span style={{ flex: 1, fontFamily: '"Inter", sans-serif', fontWeight: 700, fontSize: 16 }}>Task #{task.task_number}</span>
        <WhatsAppShareButton task={task} assignedStaffName={task.assigned_user?.name} compact />
      </div>

      <div className="page-content" style={{ padding: '16px' }}>
        {/* Status + Urgent */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <StatusBadge status={task.status} />
          {task.is_urgent && <span className="badge badge-urgent">URGENT</span>}
          {task.is_draft && <span className="badge" style={{ background: 'var(--amber-surface)', color: 'var(--amber)' }}>Draft</span>}
        </div>

        {/* Customer info */}
        <div className="card" style={{ padding: '14px 16px', marginBottom: 12 }}>
          <h2 style={{ margin: '0 0 8px', fontSize: 20, fontWeight: 700, color: 'var(--gray-900)' }}>{task.customer_name}</h2>
          <a href={toTelLink(task.customer_phone)} style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--blue)', fontSize: 14, textDecoration: 'none', marginBottom: 6 }}>
            <Phone size={14} /> {task.customer_phone}
          </a>
          {task.customer_address && (
            <a href={mapsUrl} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--gray-600)', fontSize: 13, textDecoration: 'none', marginBottom: 6 }}>
              <MapPin size={14} color="var(--gray-600)" /> {task.customer_address}
            </a>
          )}
          {task.service_description && (
            <p style={{ margin: '8px 0 0', fontSize: 13, color: 'var(--gray-900)', lineHeight: 1.5 }}>{task.service_description}</p>
          )}
          {task.due_at && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8, color: new Date(task.due_at) < new Date() ? 'var(--red)' : 'var(--gray-600)', fontSize: 12 }}>
              <Clock size={12} /> Due: {format(new Date(task.due_at), 'dd MMM yyyy, h:mm a')}
            </div>
          )}
        </div>

        {/* Timestamps */}
        <div className="card" style={{ padding: '12px 16px', marginBottom: 12, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          {[['Created', task.created_at], ['Assigned', task.assigned_at], ['Completed', task.completed_at]].map(([label, ts]) => (
            <div key={label}>
              <div style={{ fontSize: 11, color: 'var(--gray-600)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</div>
              <div style={{ fontSize: 12, color: ts ? 'var(--gray-900)' : 'var(--gray-600)', marginTop: 2 }}>{ts ? format(new Date(ts), 'dd MMM, h:mm a') : '—'}</div>
            </div>
          ))}
        </div>

        {/* Owner actions */}
        {isOwner && (
          <div className="card" style={{ padding: '14px 16px', marginBottom: 12 }}>
            <div style={{ marginBottom: 10 }}>
              <label className="input-label">Assign / Reassign</label>
              <select className="input" value={task.assigned_to || ''} onChange={e => assignStaff(e.target.value || null)}>
                <option value="">Unassigned</option>
                {staffList.map(s => <option key={s.id} value={s.id}>{s.name} ({s.activeTasks} active)</option>)}
              </select>
            </div>
            {task.assigned_user && (
              <a href={toTelLink(task.assigned_user.phone)} style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--blue)', fontSize: 13, textDecoration: 'none', marginBottom: 8 }}>
                <Phone size={13} /> Call {task.assigned_user.name}
              </a>
            )}
            {task.status === 'completed' && (
              <button className="btn btn-ghost btn-full btn-sm" onClick={() => setConfirmReopen(true)}>Reopen Task</button>
            )}
          </div>
        )}

        {/* Staff action */}
        {!isOwner && isMyTask && task.status === 'in_progress' && (
          <button className="btn btn-green btn-full" style={{ marginBottom: 12 }} onClick={() => setConfirmComplete(true)}>Mark as Completed</button>
        )}
        {!isOwner && task.status === 'completed' && (
          <div style={{ background: 'var(--green-surface)', color: 'var(--green)', borderRadius: 10, padding: '12px 16px', fontSize: 13, fontWeight: 600, marginBottom: 12, textAlign: 'center' }}>This task is completed</div>
        )}

        <TaskTimeline taskId={taskId} />

        {/* Remarks */}
        <div className="card" style={{ padding: '14px 16px' }}>
          <h3 style={{ margin: '0 0 12px', fontFamily: '"Inter", sans-serif', fontSize: 14, fontWeight: 600, color: 'var(--gray-900)' }}>Remarks & Notes</h3>
          <div ref={remarksRef} id="remarks">
            {remarks.length === 0
              ? <p style={{ color: 'var(--gray-600)', fontSize: 13, margin: 0 }}>No remarks yet.</p>
              : remarks.map(r => <RemarkItem key={r.id} remark={r} />)
            }
          </div>
          {(isOwner || (isMyTask && task.status === 'in_progress')) && (
            <RemarkInput taskId={taskId} authorId={currentUser.id} onSuccess={(r) => setRemarks(prev => [...prev, r])} />
          )}
        </div>
      </div>

      <ConflictSnackbar open={conflict} onRefresh={() => { setConflict(false); fetchTask() }} onClose={() => setConflict(false)} />
      <ConfirmModal open={confirmComplete} title="Mark as Completed?" body="Confirm that this task is done. The owner will be notified." confirmLabel="Mark Complete" confirmColor="green" loading={actionLoading} onConfirm={markComplete} onCancel={() => setConfirmComplete(false)} />
      <ConfirmModal open={confirmReopen} title="Reopen Task?" body="This will move the task back to Unassigned and clear the assigned staff." confirmLabel="Reopen" confirmColor="navy" loading={actionLoading} onConfirm={reopenTask} onCancel={() => setConfirmReopen(false)} />
    </div>
  )
}
