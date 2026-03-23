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
    // Initial session check with timeout fallback
    const timeout = setTimeout(() => {
      console.log('Auth initialization timeout reached')
      setLoading(false)
    }, 10000)

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      console.log('Session fetched:', !!session)
      setUser(session?.user ?? null)
      if (session?.user) {
        try {
          await fetchProfile(session.user.id)
        } catch (e) {
          console.error('Initial profile fetch failed:', e)
        }
      }
      clearTimeout(timeout)
      setLoading(false)
    }).catch(err => {
      console.error('getSession error:', err)
      clearTimeout(timeout)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth event:', event, !!session)
      try {
        setUser(session?.user ?? null)
        if (session?.user) {
          await fetchProfile(session.user.id)
        } else {
          setProfile(null)
        }
      } catch (e) {
        console.error('onAuthStateChange callback error:', e)
      } finally {
        setLoading(false)
      }
    })

    return () => {
      clearTimeout(timeout)
      subscription.unsubscribe()
    }
  }, [fetchProfile])

  const logout = useCallback(async () => {
    setUser(null)
    setProfile(null)
    // Force clear local storage to break out of gotrue locks in dev
    for (let key in localStorage) {
      if (key.startsWith('sb-')) localStorage.removeItem(key)
    }
    await supabase.auth.signOut().catch(err => console.error('Sign out error:', err))
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
