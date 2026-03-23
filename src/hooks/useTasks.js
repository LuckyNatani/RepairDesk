import { useEffect, useState, useCallback, useRef } from 'react'
import { supabase } from '../lib/supabaseClient'

export function useTasks(businessId) {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const channelRef = useRef(null)

  const fetchTasks = useCallback(async () => {
    if (!businessId) return
    setLoading(true)
    const { data, error } = await supabase
      .from('tasks')
      .select(`
        *,
        assigned_user:assigned_to(id, name, phone, avatar_color),
        creator:created_by(id, name)
      `)
      .eq('business_id', businessId)
      .order('is_urgent', { ascending: false })
      .order('created_at', { ascending: true })
    if (error) setError(error.message)
    else setTasks(data || [])
    setLoading(false)
  }, [businessId])

  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

  useEffect(() => {
    if (!businessId) return
    if (channelRef.current) supabase.removeChannel(channelRef.current)

    const channel = supabase
      .channel(`tasks:business_id=eq.${businessId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'tasks',
        filter: `business_id=eq.${businessId}`,
      }, (payload) => {
        if (payload.eventType === 'DELETE') {
          setTasks(prev => prev.filter(t => t.id !== payload.old.id))
        } else if (payload.eventType === 'INSERT') {
          fetchTasks() // Refetch to get joined data
        } else {
          fetchTasks()
        }
      })
      .subscribe()

    channelRef.current = channel
    return () => { if (channelRef.current) supabase.removeChannel(channelRef.current) }
  }, [businessId, fetchTasks])

  const byStatus = {
    unassigned: tasks.filter(t => t.status === 'unassigned' && !t.is_draft),
    in_progress: tasks.filter(t => t.status === 'in_progress'),
    completed: tasks.filter(t => {
      if (t.status !== 'completed') return false
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      return new Date(t.created_at) > thirtyDaysAgo
    }),
    drafts: tasks.filter(t => t.is_draft),
  }

  return { tasks, byStatus, loading, error, refetch: fetchTasks }
}
