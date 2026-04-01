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

    // Call the optimized Postgres RPC for high-performance aggregation
    const { data: analytics, error: err } = await supabase.rpc('get_analytics', {
      p_business_id: businessId,
      p_start: start.toISOString(),
      p_end: end.toISOString()
    })

    if (err) {
      console.error('[useAnalytics] RPC error:', err)
      setError(err.message)
      setLoading(false)
      return
    }

    // The RPC returns a set of rows, but we only expect one row with all aggregated stats
    const stats = analytics?.[0]
    if (stats) {
      setData({
        total: parseInt(stats.total) || 0,
        completed: parseInt(stats.completed) || 0,
        in_progress: parseInt(stats.in_progress) || 0,
        unassigned: parseInt(stats.unassigned) || 0,
        completionRate: stats.completion_rate || 0,
        staffStats: (stats.staff_stats || []).sort((a, b) => b.completed - a.completed),
        dateRange: { start, end }
      })
    } else {
      setData({ total: 0, completed: 0, in_progress: 0, unassigned: 0, completionRate: 0, staffStats: [], dateRange: { start, end } })
    }
    setLoading(false)
  }, [businessId])

  return { data, loading, error, fetchAnalytics }
}
