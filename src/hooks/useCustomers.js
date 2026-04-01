import { useCallback, useState, useRef } from 'react'
import { supabase } from '../lib/supabaseClient'

export function useCustomers(businessId) {
  const [suggestions, setSuggestions] = useState([])
  const [loading, setLoading] = useState(false)

  const abortControllerRef = useRef(null)

  const search = useCallback(async (query) => {
    if (!businessId || !query || query.length < 2) {
      setSuggestions([])
      return
    }

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    abortControllerRef.current = new AbortController()

    setLoading(true)
    try {
      const isPhone = /^\d+$/.test(query.replace(/\D/g, ''))
      let q = supabase
        .from('customers')
        .select('id, name, phone, last_task_at', { abortSignal: abortControllerRef.current.signal })
        .eq('business_id', businessId)
        .order('last_task_at', { ascending: false })
        .limit(5)

      if (isPhone) {
        q = q.ilike('phone', `%${query}%`)
      } else {
        q = q.ilike('name', `%${query}%`)
      }

      const { data, error } = await q
      if (error && error.message === 'Fetch is aborted') return
      
      setSuggestions(data || [])
    } catch (err) {
      if (err.name === 'AbortError') return
      console.error('[useCustomers] Search error:', err)
    } finally {
      setLoading(false)
    }
  }, [businessId])

  const getLastAddress = useCallback(async (customerId) => {
    const { data } = await supabase
      .from('tasks')
      .select('customer_address')
      .eq('customer_id', customerId)
      .not('customer_address', 'is', null)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()
    return data?.customer_address || null
  }, [])

  return { suggestions, loading, search, getLastAddress }
}
