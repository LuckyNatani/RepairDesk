import { useEffect, useState, useCallback, useRef } from 'react'
import { supabase } from '../lib/supabaseClient'

export function useSABusinesses() {
  const [businesses, setBusinesses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const channelRef = useRef(null)

  const fetchBusinesses = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('businesses')
      .select(`
        *,
        owner:owner_id(id, name, email, phone),
        tasks:tasks(count),
        users:users(count)
      `)
      .order('created_at', { ascending: false })
    if (error) setError(error.message)
    else setBusinesses(data || [])
    setLoading(false)
  }, [])

  useEffect(() => { fetchBusinesses() }, [fetchBusinesses])

  useEffect(() => {
    if (channelRef.current) supabase.removeChannel(channelRef.current)
    const channel = supabase
      .channel('sa-businesses')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'businesses' }, fetchBusinesses)
      .subscribe()
    channelRef.current = channel
    return () => { if (channelRef.current) supabase.removeChannel(channelRef.current) }
  }, [fetchBusinesses])

  return { businesses, loading, error, refetch: fetchBusinesses }
}
