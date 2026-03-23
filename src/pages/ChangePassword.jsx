import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../hooks/useAuth'
import { Eye, EyeOff } from 'lucide-react'

export default function ChangePassword() {
  const { user, logout } = useAuth()
  const [pw, setPw] = useState(''); const [pw2, setPw2] = useState('')
  const [show1, setShow1] = useState(false); const [show2, setShow2] = useState(false)
  const [loading, setLoading] = useState(false); const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (pw.length < 8) { setError('Password must be at least 8 characters'); return }
    if (pw !== pw2) { setError('Passwords do not match'); return }
    setLoading(true); setError(null)
    const { error: updateError } = await supabase.auth.updateUser({ password: pw })
    if (updateError) { setError(updateError.message); setLoading(false); return }
    await supabase.from('users').update({ must_change_password: false }).eq('id', user.id)
    setLoading(false)
    // Auth state refresh will redirect
  }

  return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', background: 'var(--navy)' }}>
      <div style={{ flex: '0 0 35%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 32 }}>
        <h1 style={{ fontFamily: '"Inter", sans-serif', fontWeight: 700, fontSize: 24, color: '#fff', margin: 0 }}>Set New Password</h1>
        <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 14, margin: 0, textAlign: 'center' }}>Please set a new password before continuing.</p>
      </div>
      <div style={{ flex: 1, background: '#fff', borderRadius: '24px 24px 0 0', padding: '28px 24px' }}>
        {error && <div style={{ background: 'var(--red-surface)', color: 'var(--red)', borderRadius: 8, padding: '10px 14px', fontSize: 13, marginBottom: 16 }}>{error}</div>}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {[['New Password', pw, setPw, show1, setShow1], ['Confirm Password', pw2, setPw2, show2, setShow2]].map(([label, val, set, show, setShow]) => (
            <div key={label}>
              <label className="input-label">{label}</label>
              <div style={{ position: 'relative' }}>
                <input className="input" type={show ? 'text' : 'password'} value={val} onChange={e => set(e.target.value)} minLength={8} style={{ paddingRight: 44 }} />
                <button type="button" onClick={() => setShow(v => !v)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--grey-600)', display: 'flex' }}>
                  {show ? <EyeOff size={18}/> : <Eye size={18}/>}
                </button>
              </div>
            </div>
          ))}
          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>{loading ? 'Updating…' : 'Set Password & Continue'}</button>
          <button type="button" onClick={logout} style={{ background: 'none', border: 'none', color: 'var(--grey-600)', cursor: 'pointer', fontSize: 13, marginTop: 4 }}>Cancel & Log Out</button>
        </form>
      </div>
    </div>
  )
}
