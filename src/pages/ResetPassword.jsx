import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import Logo from '../components/shared/Logo'

export default function ResetPassword() {
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const [sessionReady, setSessionReady] = useState(false)

  useEffect(() => {
    // Supabase handles the token exchange from the email link automatically
    // We listen for the PASSWORD_RECOVERY event
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setSessionReady(true)
      }
    })

    // Also check if we already have a session (user clicked link and session was restored)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setSessionReady(true)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    if (password.length < 8) { setError('Password must be at least 8 characters'); return }
    if (password !== confirm) { setError('Passwords do not match'); return }

    setLoading(true)
    const { error: updateErr } = await supabase.auth.updateUser({ password })
    setLoading(false)

    if (updateErr) {
      setError(updateErr.message)
    } else {
      setSuccess(true)
      // Sign out so user logs in fresh with new password
      await supabase.auth.signOut()
      setTimeout(() => navigate('/login'), 2000)
    }
  }

  return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column' }}>
      {/* Top navy section */}
      <div style={{ background: 'var(--navy)', padding: '48px 24px 40px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Logo className="w-12 h-12" textClassName="text-xl font-bold" textColor="white" />
        <h1 style={{ color: '#fff', fontFamily: '"Inter", sans-serif', fontSize: 20, fontWeight: 700, marginTop: 16, marginBottom: 4 }}>
          Reset Password
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, margin: 0 }}>
          Enter your new password below
        </p>
      </div>

      {/* Form card */}
      <div style={{ flex: 1, background: '#fff', borderRadius: '24px 24px 0 0', marginTop: -20, padding: '32px 24px' }}>
        {success ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--green-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: 24 }}>
              ✓
            </div>
            <h2 style={{ fontFamily: '"Inter", sans-serif', fontSize: 18, fontWeight: 700, color: 'var(--green)', marginBottom: 8 }}>
              Password Updated!
            </h2>
            <p style={{ fontSize: 14, color: 'var(--gray-600)' }}>
              Redirecting to login…
            </p>
          </div>
        ) : !sessionReady ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <div className="animate-pulse" style={{ marginBottom: 16 }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--gray-100)', margin: '0 auto' }} />
            </div>
            <p style={{ fontSize: 14, color: 'var(--gray-600)' }}>
              Verifying your reset link…
            </p>
            <p style={{ fontSize: 12, color: 'var(--gray-600)', marginTop: 12 }}>
              If this takes too long, the link may have expired.{' '}
              <button onClick={() => navigate('/login')} style={{ color: 'var(--blue)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, textDecoration: 'underline' }}>
                Back to Login
              </button>
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {error && (
              <div style={{ background: 'var(--red-surface)', color: 'var(--red)', padding: '10px 14px', borderRadius: 8, fontSize: 13 }}>
                {error}
              </div>
            )}

            <div>
              <label className="input-label">New Password</label>
              <input
                className="input"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Minimum 8 characters"
                minLength={8}
                required
                autoFocus
              />
            </div>

            <div>
              <label className="input-label">Confirm Password</label>
              <input
                className="input"
                type="password"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                placeholder="Re-enter password"
                minLength={8}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary btn-full" disabled={loading} style={{ height: 48, fontSize: 15 }}>
              {loading ? 'Updating…' : 'Set New Password'}
            </button>

            <button type="button" onClick={() => navigate('/login')} style={{ background: 'none', border: 'none', color: 'var(--gray-600)', cursor: 'pointer', fontSize: 13, marginTop: 4 }}>
              ← Back to Login
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
