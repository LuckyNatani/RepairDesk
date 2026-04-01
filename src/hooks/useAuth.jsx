import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabaseClient'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchProfile = useCallback(async (uid) => {
    if (import.meta.env.DEV) console.log('[fetchProfile] Starting fetch for uid:', uid)
    try {
      const result = await supabase
        .from('users')
        .select('*, businesses!users_business_id_fkey(id, name, account_status, trial_ends_at, next_task_number)')
        .eq('id', uid)
        .single()
      
      if (import.meta.env.DEV) console.log('[fetchProfile] Query completed. Error:', result.error, 'Data:', result.data)

      if (!result.error && result.data) {
        setProfile(result.data)
        // Update last_seen_at silently
        supabase.from('users').update({ last_seen_at: new Date().toISOString() }).eq('id', uid).then(r => {
          if (import.meta.env.DEV && r.error) console.log('[fetchProfile] last_seen_at update error', r.error)
        })
      } else {
        if (import.meta.env.DEV) console.warn('[fetchProfile] Profile not found or error occurred.')
        setProfile(null)
      }
      return result.data
    } catch (e) {
      if (import.meta.env.DEV) console.error('[fetchProfile] Exception caught:', e)
      setProfile(null)
      return null
    }
  }, [])


  useEffect(() => {
    let mounted = true
    let authTimeout = null
    
    // Fallback timeout in case initialization hangs completely
    authTimeout = setTimeout(() => {
      if (mounted) {
        if (import.meta.env.DEV) console.warn('[useAuth] Auth initialization timeout reached')
        setLoading(false)
      }
    }, 15000)


    // Helper to safely load user + profile
    const loadSessionAndProfile = async (session) => {
      if (!mounted) return
      try {
        setUser(session?.user ?? null)
        if (session?.user) {
          await fetchProfile(session.user.id)
        } else {
          setProfile(null)
        }
      } catch (e) {
        if (import.meta.env.DEV) console.error('[loadSessionAndProfile] Error:', e)
      } finally {
        if (mounted) {
          clearTimeout(authTimeout)
          setLoading(false)
        }
      }
    }


    // Explicitly grab the session on mount (robust against page refresh)
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error && import.meta.env.DEV) {
        console.error('[getSession] error:', error)
      }
      loadSessionAndProfile(session)
    })


    // Listen to changes (e.g. multi-tab sign out, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (import.meta.env.DEV) console.log('[onAuthStateChange] Event:', event)
      if (!mounted) return
      // We ignore INITIAL_SESSION since getSession handles it, 
      // preventing duplicate fetchProfile calls.
      if (event === 'INITIAL_SESSION') return
      
      loadSessionAndProfile(session)
    })


    return () => {
      mounted = false
      clearTimeout(authTimeout)
      subscription.unsubscribe()
    }
  }, [fetchProfile])

  // ── Auth Actions (Defined before usage in Effects to avoid TDZ) ──

  const logout = useCallback(async () => {
    // 1. Immediate UI state clear
    setUser(null)
    setProfile(null)
    
    // 2. Inform Supabase and await sign out completion
    // This will clear Supabase-specific storage keys automatically
    await supabase.auth.signOut().catch(err => {
      if (import.meta.env.DEV) console.error('Sign out error:', err)
    })
    
    // 3. Clean exit: full redirect to ensure all memory state is wiped
    window.location.href = '/login'
  }, [])

  const refreshProfile = useCallback(async () => {
    if (user) await fetchProfile(user.id)
  }, [user, fetchProfile])

  // ── Realtime Account Status Monitor ─────────────────────
  useEffect(() => {
    if (!profile?.business_id) return
    
    if (import.meta.env.DEV) console.log('[useAuth] Subscribing to business status for:', profile.business_id)
    const channel = supabase
      .channel(`business_status_${profile.business_id}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'businesses',
        filter: `id=eq.${profile.business_id}`,
      }, (payload) => {
        if (import.meta.env.DEV) console.log('[useAuth] Business status update received:', payload.new.account_status)
        if (payload.new.account_status === 'suspended') {
          if (import.meta.env.DEV) console.warn('[useAuth] Account suspended! Logging out...')
          logout()
        } else {
          // Refresh profile to reflect active/trial_expired etc.
          refreshProfile()
        }
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [profile?.business_id, logout, refreshProfile])


  const value = {
    user,
    profile,
    loading,
    role: profile?.role ?? null,
    businessId: profile?.business_id ?? null,
    business: profile?.businesses ?? null,
    accountStatus: profile?.businesses?.account_status ?? null,
    mustChangePassword: profile?.must_change_password ?? false,
    logout,
    refreshProfile,
    isOwner: profile?.role === 'owner',
    isStaff: profile?.role === 'staff',
    isSuperadmin: profile?.role === 'superadmin',
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
