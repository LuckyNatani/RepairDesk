import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabaseClient'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchProfile = useCallback(async (uid) => {
    console.log('[fetchProfile] Starting fetch for uid:', uid)
    try {
      const result = await supabase
        .from('users')
        .select('*, businesses!users_business_id_fkey(id, name, account_status, trial_ends_at, next_task_number)')
        .eq('id', uid)
        .single()
      
      console.log('[fetchProfile] Query completed. Error:', result.error, 'Data:', result.data)

      if (!result.error && result.data) {
        setProfile(result.data)
        // Update last_seen_at silently without awaiting
        supabase.from('users').update({ last_seen_at: new Date().toISOString() }).eq('id', uid).then(r => console.log('[fetchProfile] last_seen_at update done', r.error))
      } else {
        console.warn('[fetchProfile] Profile not found or error occurred. Setting profile to null.')
        setProfile(null)
      }
      return result.data
    } catch (e) {
      console.error('[fetchProfile] Exception caught:', e)
      setProfile(null)
      return null
    }
  }, [])

  useEffect(() => {
    let mounted = true
    
    // Initial fallback timeout (pushed to 20s for slow DB cold starts)
    const timeout = setTimeout(() => {
      if (mounted) {
        console.log('Auth initialization timeout reached')
        setLoading(false)
      }
    }, 20000)

    // Single source of truth for auth state
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('[onAuthStateChange] Event:', event, 'Session:', !!session)
      
      if (!mounted) return

      try {
        setUser(session?.user ?? null)
        
        if (session?.user) {
          // If we have a user, fetch the profile immediately
          await fetchProfile(session.user.id)
        } else {
          // No user, clear profile
          setProfile(null)
        }
      } catch (e) {
        console.error('[onAuthStateChange] Error in callback:', e)
      } finally {
        if (mounted) {
          clearTimeout(timeout)
          setLoading(false)
        }
      }
    })

    return () => {
      mounted = false
      clearTimeout(timeout)
      subscription.unsubscribe()
    }
  }, [fetchProfile])

  const logout = useCallback(async () => {
    // 1. Immediate UI state clear
    setUser(null)
    setProfile(null)
    
    // 2. Clear all storage (local and session) to ensure no stale metadata remains
    try {
      localStorage.clear()
      sessionStorage.clear()
    } catch (e) {
      console.error('Storage clear error:', e)
    }

    // 3. Inform Supabase and await sign out completion
    await supabase.auth.signOut().catch(err => console.error('Sign out error:', err))
    
    // 4. Clean exit: full redirect to ensure all memory state is wiped
    window.location.href = '/login'
  }, [])

  const refreshProfile = useCallback(async () => {
    if (user) await fetchProfile(user.id)
  }, [user, fetchProfile])

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
