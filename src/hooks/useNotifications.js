import { useEffect, useState, useRef, useCallback } from 'react'
import { supabase } from '../lib/supabaseClient'

export function useNotifications(userId) {
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const channelRef = useRef(null)

  const fetchNotifications = useCallback(async () => {
    if (!userId) return
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50)
    setNotifications(data || [])
    setUnreadCount(data?.filter(n => !n.is_read).length || 0)
    setLoading(false)
  }, [userId])

  useEffect(() => { fetchNotifications() }, [fetchNotifications])

  useEffect(() => {
    if (!userId) return
    const channel = supabase
      .channel(`notifications:user_id=eq.${userId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${userId}` }, (payload) => {
        setNotifications(prev => [payload.new, ...prev].slice(0, 50))
        setUnreadCount(c => c + 1)
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'notifications', filter: `user_id=eq.${userId}` }, (payload) => {
        setNotifications(prev => prev.map(n => n.id === payload.new.id ? payload.new : n))
        // Recalculate unread count if is_read changed
        setUnreadCount(prev => {
          const { old: { is_read: wasRead }, new: { is_read: nowRead } } = payload;
          if (wasRead && !nowRead) return prev + 1;
          if (!wasRead && nowRead) return Math.max(0, prev - 1);
          return prev;
        })
      })
      .subscribe()
    
    return () => { supabase.removeChannel(channel) }
  }, [userId])


  const markRead = useCallback(async (notificationId) => {
    await supabase.from('notifications').update({ is_read: true }).eq('id', notificationId)
  }, [])

  const markAllRead = useCallback(async () => {
    await supabase.from('notifications').update({ is_read: true }).eq('user_id', userId).eq('is_read', false)
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
    setUnreadCount(0)
  }, [userId])

  return { notifications, unreadCount, loading, markRead, markAllRead, refetch: fetchNotifications }
}
