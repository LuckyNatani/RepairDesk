import { useAuth } from '../hooks/useAuth'
import { ShieldOff, Phone } from 'lucide-react'

const SUPPORT_PHONE = import.meta.env.VITE_SUPPORT_PHONE || ''

export default function Suspended() {
  const { logout, profile } = useAuth()
  const role = profile?.role
  return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5', padding: 24 }}>
      <div style={{ background: '#fff', borderRadius: 20, padding: 32, maxWidth: 400, width: '100%', textAlign: 'center' }}>
        <div style={{ width: 64, height: 64, background: 'var(--red-surface)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
          <ShieldOff size={28} color="var(--red)" />
        </div>
        <h1 style={{ fontFamily: '"Inter", sans-serif', fontSize: 22, fontWeight: 700, margin: '0 0 10px' }}>Account Suspended</h1>
        <p style={{ color: 'var(--gray-600)', fontSize: 14, lineHeight: 1.6, margin: '0 0 24px' }}>
          {role === 'staff'
            ? 'Your account has been deactivated. Please contact your manager.'
            : 'Your business account has been suspended. Contact TaskPod support.'}
        </p>
        {SUPPORT_PHONE && (
          <a href={`tel:${SUPPORT_PHONE}`} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', background: 'var(--blue-surface)', borderRadius: 10, textDecoration: 'none', color: 'var(--blue)', fontWeight: 600, marginBottom: 12, justifyContent: 'center' }}>
            <Phone size={16} /> Contact Support
          </a>
        )}
        <button onClick={logout} style={{ background: 'none', border: 'none', color: 'var(--gray-600)', cursor: 'pointer', fontSize: 13 }}>Sign Out</button>
      </div>
    </div>
  )
}
