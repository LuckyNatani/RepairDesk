import { useEffect, useState, useCallback, useRef } from 'react'
import { supabase } from '../lib/supabaseClient'

export async function logTaskEvent(payload) {
  // payload: { task_id, event_type, actor_id, to_user_id?, from_user_id?, note? }
  const { error } = await supabase.from('task_events').insert(payload)
  if (error) console.error('Failed to log task event:', error)
}

export async function createTask(payload) {
  const { data, error } = await supabase.from('tasks').insert(payload).select().single()
  if (error) throw error
  
  await logTaskEvent({ task_id: data.id, event_type: 'created', actor_id: payload.created_by })
  if (payload.assigned_to) {
    await logTaskEvent({ task_id: data.id, event_type: 'assigned', actor_id: payload.created_by, to_user_id: payload.assigned_to })
  }
  return data
}

export async function updateTask(id, updates, options = {}) {
  const { actorId, expectedVersion } = options
  
  // Get old task to compare for logging
  const { data: oldTask } = await supabase.from('tasks').select('assigned_to, status').eq('id', id).single()
  
  let query = supabase.from('tasks').update(updates).eq('id', id)
  if (expectedVersion !== undefined) {
    query = query.eq('version', expectedVersion)
  }
  
  const response = await query.select().single()
  if (response.error || response.status === 406 || response.status === 409) {
     return { error: response.error, conflict: true }
  }
  const data = response.data
  
  if (oldTask && actorId) {
    if (updates.assigned_to !== undefined && updates.assigned_to !== oldTask.assigned_to) {
      if (updates.assigned_to) {
         await logTaskEvent({ task_id: id, event_type: 'assigned', actor_id: actorId, to_user_id: updates.assigned_to, from_user_id: oldTask.assigned_to })
      } else {
         await logTaskEvent({ task_id: id, event_type: 'unassigned', actor_id: actorId, from_user_id: oldTask.assigned_to })
      }
    }
    if (updates.status !== undefined && updates.status !== oldTask.status) {
      await logTaskEvent({ task_id: id, event_type: `status_${updates.status}`, actor_id: actorId })
    }
  }
  return { data, error: null }
}


export function useTasks(businessId, period = 'all', searchQuery = '') {
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



  // Filter tasks locally by period and search query
  const filteredTasks = tasks.filter(t => {
    let matchesPeriod = true
    const taskDate = new Date(t.created_at)
    const now = new Date()

    if (period === 'daily') {
      matchesPeriod = taskDate.toDateString() === now.toDateString()
    } else if (period === 'weekly') {
      const today = new Date(now.setHours(0, 0, 0, 0))
      const day = today.getDay()
      const diff = today.getDate() - day + (day === 0 ? -6 : 1)
      const monday = new Date(today.setDate(diff))
      matchesPeriod = taskDate >= monday
    } else if (period === 'monthly') {
      matchesPeriod = taskDate.getMonth() === now.getMonth() && taskDate.getFullYear() === now.getFullYear()
    }

    if (!matchesPeriod) return false

    if (searchQuery && searchQuery.trim().length > 0) {
      const query = searchQuery.toLowerCase().trim()
      const matchesName = t.customer_name?.toLowerCase().includes(query)
      const matchesPhone = t.customer_phone?.toLowerCase().includes(query)
      const matchesId = t.task_number?.toString().includes(query)
      return matchesName || matchesPhone || matchesId
    }

    return true
  })

  const byStatus = {
    unassigned: filteredTasks.filter(t => t.status === 'unassigned' && !t.is_draft),
    in_progress: filteredTasks.filter(t => t.status === 'in_progress'),
    completed: filteredTasks.filter(t => t.status === 'completed'),
    drafts: filteredTasks.filter(t => t.is_draft),
  }

  return { tasks: filteredTasks, byStatus, loading, error, refetch: fetchTasks, createTask, updateTask }
}
