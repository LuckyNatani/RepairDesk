import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { supabase } from '../../lib/supabaseClient'
import Avatar from '../shared/Avatar'
import { CheckCircle, Clock, UserPlus, FileText, Activity } from 'lucide-react'

export default function TaskTimeline({ taskId }) {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchEvents = async () => {
      const { data } = await supabase
        .from('task_events')
        .select(`
          *,
          actor:actor_id(id, name, avatar_color),
          to_user:to_user_id(id, name),
          from_user:from_user_id(id, name)
        `)
        .eq('task_id', taskId)
        .order('created_at', { ascending: false })
      
      setEvents(data || [])
      setLoading(false)
    }

    fetchEvents()

    const channel = supabase
      .channel(`timeline:${taskId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'task_events', filter: `task_id=eq.${taskId}` }, fetchEvents)
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [taskId])

  if (loading) return null
  if (events.length === 0) return null

  const getEventIcon = (type) => {
    if (type === 'created') return <FileText size={14} color="#fff" />
    if (type === 'assigned' || type === 'unassigned') return <UserPlus size={14} color="#fff" />
    if (type.startsWith('status_')) {
      if (type.includes('completed')) return <CheckCircle size={14} color="#fff" />
      return <Clock size={14} color="#fff" />
    }
    return <Activity size={14} color="#fff" />
  }

  const getEventColor = (type) => {
    if (type === 'created') return 'var(--blue)'
    if (type === 'assigned') return 'var(--indigo)'
    if (type === 'unassigned') return 'var(--gray-500)'
    if (type.includes('completed')) return 'var(--green)'
    return 'var(--navy)'
  }

  const getEventText = (event) => {
    const actorName = event.actor?.name || 'System'
    if (event.event_type === 'created') return <span><b>{actorName}</b> created the task</span>
    if (event.event_type === 'assigned') return <span><b>{actorName}</b> assigned to <b>{event.to_user?.name || 'Unknown'}</b></span>
    if (event.event_type === 'unassigned') return <span><b>{actorName}</b> removed assignment from <b>{event.from_user?.name || 'Unknown'}</b></span>
    if (event.event_type === 'status_completed') return <span><b>{actorName}</b> marked task as completed</span>
    if (event.event_type === 'status_in_progress') return <span><b>{actorName}</b> moved task to in progress</span>
    if (event.event_type === 'status_unassigned') return <span><b>{actorName}</b> reopened task to unassigned</span>
    return <span><b>{actorName}</b> updated task</span>
  }

  return (
    <div className="card" style={{ padding: '16px', marginBottom: 12 }}>
      <h3 style={{ margin: '0 0 16px', fontSize: 14, fontWeight: 600, color: 'var(--gray-900)' }}>Timeline</h3>
      <div style={{ position: 'relative', paddingLeft: 8 }}>
        <div style={{ position: 'absolute', left: 19, top: 0, bottom: 0, width: 2, background: '#E0E0E0' }} />
        {events.map((event, index) => (
          <div key={event.id} style={{ display: 'flex', gap: 12, marginBottom: index === events.length - 1 ? 0 : 20, position: 'relative' }}>
            <div style={{ 
              width: 24, height: 24, borderRadius: '50%', background: getEventColor(event.event_type),
              display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1,
              flexShrink: 0, marginLeft: -2
            }}>
              {getEventIcon(event.event_type)}
            </div>
            <div style={{ flex: 1, marginTop: 2 }}>
              <div style={{ fontSize: 13, color: 'var(--gray-900)', lineHeight: 1.4 }}>
                {getEventText(event)}
              </div>
              <div style={{ fontSize: 11, color: 'var(--gray-500)', marginTop: 2 }}>
                {format(new Date(event.created_at), 'dd MMM yyyy, h:mm a')}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
