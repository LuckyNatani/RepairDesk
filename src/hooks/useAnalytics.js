import { useState, useCallback } from 'react'
import { supabase } from '../lib/supabaseClient'
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subDays } from 'date-fns'

export function useAnalytics(businessId) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchAnalytics = useCallback(async (range = 'week', customStart = null, customEnd = null) => {
    if (!businessId) return
    setLoading(true)
    setError(null)

    let start, end
    const now = new Date()
    if (range === 'today') {
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59)
    } else if (range === 'week') {
      start = startOfWeek(now, { weekStartsOn: 1 })
      end = endOfWeek(now, { weekStartsOn: 1 })
    } else if (range === 'month') {
      start = startOfMonth(now)
      end = endOfMonth(now)
    } else if (range === 'custom' && customStart && customEnd) {
      start = new Date(customStart)
      end = new Date(customEnd + 'T23:59:59')
    } else {
      start = customStart || subDays(now, 30)
      end = customEnd || now
    }

    const { data: tasks, error: err } = await supabase
      .from('tasks')
      .select('id, status, assigned_to, assigned_at, completed_at, is_urgent, assigned_user:assigned_to(id, name)')
      .eq('business_id', businessId)
      .gte('created_at', start.toISOString())
      .lte('created_at', end.toISOString())
      .eq('is_draft', false)

    if (err) { setError(err.message); setLoading(false); return }

    const total = tasks.length
    const completed = tasks.filter(t => t.status === 'completed').length
    const inProgress = tasks.filter(t => t.status === 'in_progress').length
    const unassigned = tasks.filter(t => t.status === 'unassigned').length
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0

    // Per-staff breakdown
    const staffMap = {}
    tasks.forEach(t => {
      if (!t.assigned_to) return
      const key = t.assigned_to
      if (!staffMap[key]) {
        staffMap[key] = { id: key, name: t.assigned_user?.name || 'Unknown', assigned: 0, completed: 0, totalTime: 0, timeCount: 0 }
      }
      staffMap[key].assigned++
      if (t.status === 'completed') {
        staffMap[key].completed++
        if (t.assigned_at && t.completed_at) {
          const minutes = (new Date(t.completed_at) - new Date(t.assigned_at)) / 60000
          staffMap[key].totalTime += minutes
          staffMap[key].timeCount++
        }
      }
    })
    const staffStats = Object.values(staffMap)
      .map(s => ({ ...s, completionRate: s.assigned > 0 ? Math.round((s.completed / s.assigned) * 100) : 0, avgMinutes: s.timeCount > 0 ? Math.round(s.totalTime / s.timeCount) : null }))
      .sort((a, b) => b.completed - a.completed)

    setData({ total, completed, inProgress, unassigned, completionRate, staffStats, dateRange: { start, end } })
    setLoading(false)
  }, [businessId])

  return { data, loading, error, fetchAnalytics }
}
