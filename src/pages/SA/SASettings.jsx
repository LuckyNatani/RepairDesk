import { useState, useEffect } from 'react'
import SALayout from '../../components/SA/SALayout'
import { supabase } from '../../lib/supabaseClient'
import { useAuth } from '../../hooks/useAuth'

export default function SASettings() {
  const { user } = useAuth()
  const [newPw, setNewPw] = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState(null)
  const [stats, setStats] = useState(null)

  useEffect(() => { loadStats() }, [])

  const loadStats = async () => {
    const [{ count: bizCount }, { count: userCount }, { count: taskCount }] = await Promise.all([
      supabase.from('businesses').select('id', { count: 'exact', head: true }),
      supabase.from('users').select('id', { count: 'exact', head: true }),
      supabase.from('tasks').select('id', { count: 'exact', head: true }),
    ])
    setStats({ businesses: bizCount || 0, users: userCount || 0, tasks: taskCount || 0 })
  }

  const changePassword = async (e) => {
    e.preventDefault()
    setMsg(null)
    if (newPw.length < 8) { setMsg({ type: 'error', text: 'Password must be at least 8 characters' }); return }
    if (newPw !== confirmPw) { setMsg({ type: 'error', text: 'Passwords do not match' }); return }
    setSaving(true)
    const { error } = await supabase.auth.updateUser({ password: newPw })
    setSaving(false)
    if (error) setMsg({ type: 'error', text: error.message })
    else { setMsg({ type: 'success', text: 'Password updated!' }); setNewPw(''); setConfirmPw('') }
  }

  const cardStyle = { background: '#fff', borderRadius: 14, boxShadow: 'var(--shadow-md)', padding: 20, marginBottom: 20 }
  const labelStyle = { fontSize: 13, fontWeight: 600, color: 'var(--gray-600)', marginBottom: 5, display: 'block', textTransform: 'uppercase', letterSpacing: '0.02em' }

  return (
    <SALayout>
      <div style={{ padding: 32, maxWidth: 600 }}>
        <h1 style={{ fontFamily: '"Inter", sans-serif', fontSize: 20, fontWeight: 700, marginBottom: 24 }}>Settings</h1>

        {/* Platform Info */}
        <div style={cardStyle}>
          <h3 style={{ fontFamily: '"Inter", sans-serif', fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Platform Overview</h3>
          {stats ? (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
              <div style={{ textAlign: 'center', padding: 12, background: 'var(--blue-surface)', borderRadius: 10 }}>
                <p style={{ fontSize: 22, fontWeight: 700, margin: 0, color: 'var(--blue)' }}>{stats.businesses}</p>
                <p style={{ fontSize: 11, color: 'var(--gray-600)', margin: '4px 0 0' }}>Businesses</p>
              </div>
              <div style={{ textAlign: 'center', padding: 12, background: 'var(--green-surface)', borderRadius: 10 }}>
                <p style={{ fontSize: 22, fontWeight: 700, margin: 0, color: 'var(--green)' }}>{stats.users}</p>
                <p style={{ fontSize: 11, color: 'var(--gray-600)', margin: '4px 0 0' }}>Users</p>
              </div>
              <div style={{ textAlign: 'center', padding: 12, background: 'var(--teal-surface)', borderRadius: 10 }}>
                <p style={{ fontSize: 22, fontWeight: 700, margin: 0, color: 'var(--teal)' }}>{stats.tasks}</p>
                <p style={{ fontSize: 11, color: 'var(--gray-600)', margin: '4px 0 0' }}>Tasks</p>
              </div>
            </div>
          ) : (
            <p style={{ color: 'var(--gray-600)', fontSize: 13 }}>Loading…</p>
          )}
        </div>

        {/* Keep-Alive Status */}
        <div style={cardStyle}>
          <h3 style={{ fontFamily: '"Inter", sans-serif', fontSize: 15, fontWeight: 700, marginBottom: 12 }}>Keep-Alive Configuration</h3>
          <div style={{ fontSize: 13, color: 'var(--gray-600)', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>GitHub Actions Cron</span>
              <span style={{ background: 'var(--green-surface)', color: 'var(--green)', padding: '2px 10px', borderRadius: 100, fontSize: 12, fontWeight: 600 }}>Every 5 days</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>UptimeRobot</span>
              <span style={{ background: 'var(--blue-surface)', color: 'var(--blue)', padding: '2px 10px', borderRadius: 100, fontSize: 12, fontWeight: 600 }}>Every 5 min</span>
            </div>
            <p style={{ fontSize: 12, color: 'var(--gray-600)', marginTop: 4 }}>Configure UptimeRobot monitor at <a href="https://uptimerobot.com" target="_blank" rel="noopener" style={{ color: 'var(--blue)' }}>uptimerobot.com</a></p>
          </div>
        </div>

        {/* Change Password */}
        <div style={cardStyle}>
          <h3 style={{ fontFamily: '"Inter", sans-serif', fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Change Password</h3>
          {msg && (
            <div style={{ background: msg.type === 'error' ? 'var(--red-surface)' : 'var(--green-surface)', color: msg.type === 'error' ? 'var(--red)' : 'var(--green)', padding: '10px 14px', borderRadius: 8, fontSize: 13, marginBottom: 12 }}>
              {msg.text}
            </div>
          )}
          <form onSubmit={changePassword} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={labelStyle}>New Password</label>
              <input className="input" type="password" value={newPw} onChange={e => setNewPw(e.target.value)} placeholder="Minimum 8 characters" minLength={8} />
            </div>
            <div>
              <label style={labelStyle}>Confirm Password</label>
              <input className="input" type="password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)} placeholder="Re-enter password" minLength={8} />
            </div>
            <button type="submit" className="btn btn-primary" disabled={saving} style={{ alignSelf: 'flex-start' }}>
              {saving ? 'Updating…' : 'Update Password'}
            </button>
          </form>
        </div>

        {/* Environment Info */}
        <div style={cardStyle}>
          <h3 style={{ fontFamily: '"Inter", sans-serif', fontSize: 15, fontWeight: 700, marginBottom: 12 }}>Environment</h3>
          <div style={{ fontSize: 13, color: 'var(--gray-600)', display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Supabase Region</span>
              <span style={{ fontWeight: 600 }}>{import.meta.env.VITE_SUPABASE_URL?.match(/https:\/\/(\w+)/)?.[1] || '—'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>VAPID Keys</span>
              <span style={{ fontWeight: 600, color: import.meta.env.VITE_VAPID_PUBLIC_KEY ? 'var(--green)' : 'var(--red)' }}>{import.meta.env.VITE_VAPID_PUBLIC_KEY ? 'Configured ✓' : 'Missing ✗'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Sentry DSN</span>
              <span style={{ fontWeight: 600, color: import.meta.env.VITE_SENTRY_DSN ? 'var(--green)' : 'var(--amber)' }}>{import.meta.env.VITE_SENTRY_DSN ? 'Configured ✓' : 'Not set'}</span>
            </div>
          </div>
        </div>
      </div>
    </SALayout>
  )
}
