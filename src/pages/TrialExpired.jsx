import { useAuth } from '../hooks/useAuth'
import { Phone, Mail } from 'lucide-react'

const SUPPORT_PHONE = import.meta.env.VITE_SUPPORT_PHONE || ''
const SUPPORT_EMAIL = import.meta.env.VITE_SUPPORT_EMAIL || ''

export default function TrialExpired() {
  const { logout } = useAuth()
  return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--navy)', padding: 24 }}>
      <div style={{ background: '#fff', borderRadius: 20, padding: 32, maxWidth: 400, width: '100%', textAlign: 'center' }}>
        <div style={{ width: 64, height: 64, background: 'var(--amber-surface)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--amber)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        </div>
        <h1 style={{ fontFamily: '"Inter", sans-serif', fontSize: 22, fontWeight: 700, margin: '0 0 10px', color: 'var(--gray-900)' }}>Trial Expired</h1>
        <p style={{ color: 'var(--gray-600)', fontSize: 14, lineHeight: 1.6, margin: '0 0 24px' }}>Your trial period has ended. Contact TaskPod support to activate your account.</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {SUPPORT_PHONE && (
            <a href={`tel:${SUPPORT_PHONE}`} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', background: 'var(--green-surface)', borderRadius: 10, textDecoration: 'none', color: 'var(--green)', fontWeight: 600 }}>
              <Phone size={16} /> Call Support
            </a>
          )}
          {SUPPORT_EMAIL && (
            <a href={`https://wa.me/${SUPPORT_PHONE.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', background: '#E8F5E9', borderRadius: 10, textDecoration: 'none', color: '#25D366', fontWeight: 600 }}>
              <Mail size={16} /> WhatsApp Admin
            </a>
          )}
        </div>
        <button onClick={logout} style={{ background: 'none', border: 'none', color: 'var(--gray-600)', cursor: 'pointer', fontSize: 13, marginTop: 20 }}>Sign Out</button>
      </div>
    </div>
  )
}
