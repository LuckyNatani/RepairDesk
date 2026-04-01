import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabaseClient'
import SkeletonCard from '../components/shared/SkeletonCard'

const STATUS_CONFIG = {
  trial_active: { label: 'Trial Active', color: 'var(--blue)', bg: 'var(--blue-surface)' },
  active: { label: 'Active', color: 'var(--green)', bg: 'var(--green-surface)' },
  trial_expired: { label: 'Trial Expired', color: 'var(--amber)', bg: 'var(--amber-surface)' },
  suspended: { label: 'Suspended', color: 'var(--red)', bg: 'var(--red-surface)' },
}

export default function AccountStatus() {
  const { businessId, accountStatus } = useAuth()
  const [business, setBusiness] = useState(null)
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!businessId) return
    loadData()
  }, [businessId])

  const loadData = async () => {
    setLoading(true)
    const [{ data: biz }, { data: evts }] = await Promise.all([
      supabase.from('businesses').select('*').eq('id', businessId).single(),
      supabase.from('account_events').select('*, actor:users!account_events_actor_id_fkey(name)').eq('business_id', businessId).order('created_at', { ascending: false }).limit(20),
    ])
    setBusiness(biz)
    setEvents(evts || [])
    setLoading(false)
  }

  const config = STATUS_CONFIG[accountStatus] || STATUS_CONFIG.trial_active

  if (loading) return (
    <div className="page-content" style={{ padding: 20 }}>
      <SkeletonCard lines={3} />
      <SkeletonCard lines={4} />
    </div>
  )

  const daysLeft = business?.trial_ends_at
    ? Math.max(0, Math.ceil((new Date(business.trial_ends_at) - Date.now()) / (1000 * 60 * 60 * 24)))
    : null

  return (
    <div className="page-content" style={{ padding: 20, maxWidth: 560, margin: '0 auto' }}>
      <h1 style={{ fontFamily: '"Inter", sans-serif', fontSize: 20, fontWeight: 700, marginBottom: 20 }}>Account</h1>

      {/* Status Card */}
      <div style={{ background: '#fff', borderRadius: 14, boxShadow: 'var(--shadow-md)', padding: 20, marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <div style={{ width: 44, height: 44, borderRadius: '50%', background: config.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: 12, height: 12, borderRadius: '50%', background: config.color }} />
          </div>
          <div>
            <h2 style={{ fontFamily: '"Inter", sans-serif', fontSize: 16, fontWeight: 700, margin: 0 }}>{business?.name}</h2>
            <span style={{ background: config.bg, color: config.color, padding: '2px 10px', borderRadius: 100, fontSize: 12, fontWeight: 600 }}>{config.label}</span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, fontSize: 13 }}>
          <div>
            <span style={{ color: 'var(--gray-600)' }}>Created</span>
            <p style={{ fontWeight: 600, margin: '2px 0 0' }}>{new Date(business?.created_at).toLocaleDateString()}</p>
          </div>
          {business?.trial_ends_at && (
            <div>
              <span style={{ color: 'var(--gray-600)' }}>{accountStatus === 'trial_active' ? 'Trial ends' : 'Trial ended'}</span>
              <p style={{ fontWeight: 600, margin: '2px 0 0' }}>
                {new Date(business.trial_ends_at).toLocaleDateString()}
                {accountStatus === 'trial_active' && daysLeft !== null && <span style={{ color: config.color, marginLeft: 6 }}>({daysLeft}d left)</span>}
              </p>
            </div>
          )}
          {business?.activated_at && (
            <div>
              <span style={{ color: 'var(--gray-600)' }}>Activated</span>
              <p style={{ fontWeight: 600, margin: '2px 0 0' }}>{new Date(business.activated_at).toLocaleDateString()}</p>
            </div>
          )}
        </div>
      </div>

      {/* Account History */}
      <div style={{ background: '#fff', borderRadius: 14, boxShadow: 'var(--shadow-md)', overflow: 'hidden' }}>
        <h3 style={{ fontFamily: '"Inter", sans-serif', fontSize: 15, fontWeight: 700, padding: '16px 20px 12px' }}>Account History</h3>
        {events.length === 0 ? (
          <p style={{ padding: '0 20px 20px', fontSize: 13, color: 'var(--gray-600)' }}>No events recorded yet.</p>
        ) : (
          <div style={{ maxHeight: 400, overflowY: 'auto' }}>
            {events.map((evt, i) => (
              <div key={evt.id || i} style={{ padding: '12px 20px', borderTop: i > 0 ? '1px solid #f1f1f1' : 'none', display: 'flex', gap: 12 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: getEventColor(evt.event_type), marginTop: 6, flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, margin: 0, textTransform: 'capitalize' }}>{evt.event_type.replace(/_/g, ' ')}</p>
                  {evt.note && <p style={{ fontSize: 12, color: 'var(--gray-600)', margin: '2px 0 0' }}>{evt.note}</p>}
                  <p style={{ fontSize: 11, color: 'var(--gray-600)', margin: '4px 0 0' }}>
                    {new Date(evt.created_at).toLocaleString()}
                    {evt.actor?.name && <span> · by {evt.actor.name}</span>}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function getEventColor(type) {
  const map = { created: 'var(--blue)', activated: 'var(--green)', suspended: 'var(--red)', reactivated: 'var(--green)', trial_expired: 'var(--amber)', trial_extended: 'var(--blue)' }
  return map[type] || 'var(--gray-600)'
}
