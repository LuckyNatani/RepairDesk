import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { Eye, EyeOff, LogIn } from 'lucide-react'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [failCount, setFailCount] = useState(0)
  const [locked, setLocked] = useState(false)
  const [forgotSent, setForgotSent] = useState(false)

  const disabled = !email.trim() || !password.trim() || loading || locked

  const handleSignIn = async (e) => {
    e.preventDefault()
    if (disabled) return
    setLoading(true); setError(null)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) {
      setError('Invalid email or password. Please try again.')
      const newCount = failCount + 1
      setFailCount(newCount)
      if (newCount >= 5) {
        setLocked(true)
        setTimeout(() => { setLocked(false); setFailCount(0) }, 30000)
      }
    }
    // Success → App.jsx auth state change handles redirect
  }

  const handleForgot = async () => {
    if (!email.trim()) { setError('Enter your email first to reset password.'); return }
    await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/reset-password` })
    setForgotSent(true)
  }

  return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', background: 'var(--navy)' }}>
      {/* Hero */}
      <div style={{ flex: '0 0 40%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 32 }}>
        <div style={{ width: 64, height: 64, background: 'rgba(255,255,255,0.15)', borderRadius: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>
        </div>
        <h1 style={{ fontFamily: '"Inter", sans-serif', fontWeight: 700, fontSize: 28, color: '#fff', margin: 0, letterSpacing: '-0.02em' }}>TaskPod</h1>
        <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 14, margin: 0 }}>Task management for field teams</p>
      </div>

      {/* Form Card */}
      <div style={{ flex: '1', background: '#fff', borderRadius: '24px 24px 0 0', padding: '28px 24px', boxShadow: '0 -8px 32px rgba(0,0,0,0.15)' }}>
        <h2 style={{ fontFamily: '"Inter", sans-serif', fontWeight: 700, fontSize: 20, color: 'var(--grey-900)', marginBottom: 24 }}>Sign In</h2>

        {locked && (
          <div style={{ background: 'var(--red-surface)', color: 'var(--red)', borderRadius: 8, padding: '10px 14px', fontSize: 13, marginBottom: 16 }}>
            Too many failed attempts. Please wait 30 seconds.
          </div>
        )}
        {error && !locked && (
          <div style={{ background: 'var(--red-surface)', color: 'var(--red)', borderRadius: 8, padding: '10px 14px', fontSize: 13, marginBottom: 16 }}>
            {error}
          </div>
        )}
        {forgotSent && (
          <div style={{ background: 'var(--green-surface)', color: 'var(--green)', borderRadius: 8, padding: '10px 14px', fontSize: 13, marginBottom: 16 }}>
            Password reset link sent! Check your email.
          </div>
        )}

        <form onSubmit={handleSignIn} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label className="input-label">Email</label>
            <input className="input" type="email" autoComplete="email" inputMode="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" />
          </div>
          <div>
            <label className="input-label">Password</label>
            <div style={{ position: 'relative' }}>
              <input className="input" type={showPw ? 'text' : 'password'} autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" style={{ paddingRight: 44 }} />
              <button type="button" onClick={() => setShowPw(v => !v)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--grey-600)', display: 'flex' }}>
                {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          <button type="submit" className="btn btn-primary btn-full" disabled={disabled} style={{ marginTop: 4, fontSize: 15 }}>
            {loading ? 'Signing in…' : <><LogIn size={16} /> Sign In</>}
          </button>
        </form>

        <button onClick={handleForgot} style={{ display: 'block', margin: '20px auto 0', background: 'none', border: 'none', color: 'var(--grey-600)', cursor: 'pointer', fontSize: 13 }}>
          Forgot your password?
        </button>
        <p style={{ textAlign: 'center', color: '#BDBDBD', fontSize: 12, marginTop: 32 }}>No account registration. Contact your admin.</p>
      </div>
    </div>
  )
}
