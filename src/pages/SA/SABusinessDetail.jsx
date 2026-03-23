import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import SALayout from '../../components/SA/SALayout'
import { BusinessStatusChip } from '../../components/SA/BusinessCard'
import ConfirmModal from '../../components/shared/ConfirmModal'
import Snackbar from '../../components/shared/Snackbar'
import { useSnackbar } from '../../hooks/useSnackbar'
import { supabase } from '../../lib/supabaseClient'
import { format } from 'date-fns'
import { ArrowLeft, Phone, Mail } from 'lucide-react'
import { toTelLink } from '../../lib/phoneUtils'

export default function SABusinessDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { snack, show } = useSnackbar()
  const [biz, setBiz] = useState(null)
  const [events, setEvents] = useState([])
  const [staff, setStaff] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [confirm, setConfirm] = useState(null) // { action, label, color }
  const [extendDays, setExtendDays] = useState(7)

  const load = async () => {
    const [{ data: bizData }, { data: eventsData }, { data: staffData }] = await Promise.all([
      supabase.from('businesses').select('*, owner:owner_id(id,name,email,phone)').eq('id', id).single(),
      supabase.from('account_events').select('*').eq('business_id', id).order('created_at', { ascending: false }).limit(20),
      supabase.from('users').select('id,name,phone,is_active,role,last_seen_at').eq('business_id', id).order('created_at'),
    ])
    setBiz(bizData); setEvents(eventsData || []); setStaff(staffData || [])
    setLoading(false)
  }
  useEffect(() => { load() }, [id])

  const runAction = async (action) => {
    setActionLoading(true)
    const body = action === 'extend_trial' ? { action, businessId: id, days: extendDays } : { action, businessId: id }
    const { error } = await supabase.functions.invoke('manage-account-fix', { body })
    setActionLoading(false); setConfirm(null)
    if (error) show('Action failed: ' + error.message, 'error')
    else { show('Done!', 'success'); load() }
  }

  if (loading) return <SALayout><div style={{ padding: 24 }}>Loading…</div></SALayout>
  if (!biz) return <SALayout><div style={{ padding: 24 }}>Business not found</div></SALayout>

  const status = biz.account_status

  return (
    <SALayout>
      <div style={{ padding: '24px 24px', maxWidth: 800 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <button onClick={() => navigate('/sa')} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex' }}><ArrowLeft size={20} /></button>
          <h1 style={{ fontFamily: '"Inter", sans-serif', fontSize: 20, fontWeight: 700, flex: 1, margin: 0 }}>{biz.name}</h1>
          <BusinessStatusChip status={status} />
        </div>

        {/* Owner */}
        <div className="card" style={{ padding: '14px 16px', marginBottom: 14 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--grey-600)', marginBottom: 6, textTransform: 'uppercase' }}>Owner</div>
          <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>{biz.owner?.name}</div>
          <a href={`mailto:${biz.owner?.email}`} style={{ fontSize: 13, color: 'var(--teal)', display: 'flex', alignItems: 'center', gap: 6, textDecoration: 'none', marginBottom: 4 }}><Mail size={13} />{biz.owner?.email}</a>
          <a href={toTelLink(biz.owner?.phone || '')} style={{ fontSize: 13, color: 'var(--teal)', display: 'flex', alignItems: 'center', gap: 6, textDecoration: 'none' }}><Phone size={13} />{biz.owner?.phone}</a>
        </div>

        {/* Trial Info */}
        {biz.trial_ends_at && (
          <div className="card" style={{ padding: '12px 16px', marginBottom: 14, background: 'var(--gray-50)', border: '1px solid var(--gray-100)' }}>
            <span style={{ fontSize: 13, color: 'var(--gray-600)', fontWeight: 600 }}>
              Trial {status === 'trial_expired' ? 'expired' : 'ends'}: {format(new Date(biz.trial_ends_at), 'dd MMM yyyy, h:mm a')}
            </span>
          </div>
        )}

        {/* Actions */}
        <div className="card" style={{ padding: '16px', marginBottom: 14 }}>
          <h3 style={{ fontFamily: '"Inter", sans-serif', fontSize: 14, fontWeight: 600, margin: '0 0 12px' }}>Actions</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {(status === 'trial_active' || status === 'trial_expired') && (
              <button className="btn btn-teal btn-sm" onClick={() => setConfirm({ action: 'activate', label: 'Activate Account', color: 'teal' })}>Activate</button>
            )}
            {status === 'active' && (
              <button className="btn btn-danger btn-sm" onClick={() => setConfirm({ action: 'suspend', label: 'Suspend', color: 'red' })}>Suspend</button>
            )}
            {status === 'suspended' && (
              <button className="btn btn-teal btn-sm" onClick={() => setConfirm({ action: 'reactivate', label: 'Reactivate', color: 'teal' })}>Reactivate</button>
            )}
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input type="number" min={1} max={90} value={extendDays} onChange={e => setExtendDays(Number(e.target.value))} style={{ width: 56, padding: '6px 10px', border: '1.5px solid var(--gray-200)', borderRadius: 6, fontSize: 13 }} />
              <button className="btn btn-ghost btn-sm" onClick={() => setConfirm({ action: 'extend_trial', label: `Extend Trial ${extendDays}d`, color: 'black' })}>Extend Trial</button>
            </div>
          </div>
        </div>

        {/* Staff */}
        <div className="card" style={{ padding: '14px 16px', marginBottom: 14 }}>
          <h3 style={{ fontFamily: '"Inter", sans-serif', fontSize: 14, fontWeight: 600, margin: '0 0 10px' }}>Users ({staff.length})</h3>
          {staff.map(s => (
            <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid #F0F0F0' }}>
              <span style={{ flex: 1, fontSize: 13, fontWeight: 600 }}>{s.name}</span>
              <span className="badge badge-sm" style={{ background: 'var(--gray-50)', color: 'var(--gray-500)' }}>{s.role}</span>
              <span className="badge badge-sm" style={{ background: s.is_active ? 'var(--teal-surface)' : 'var(--gray-50)', color: s.is_active ? 'var(--teal)' : 'var(--gray-500)' }}>{s.is_active ? 'Active' : 'Inactive'}</span>
            </div>
          ))}
        </div>

        {/* Audit log */}
        <div className="card" style={{ padding: '14px 16px' }}>
          <h3 style={{ fontFamily: '"Inter", sans-serif', fontSize: 14, fontWeight: 600, margin: '0 0 10px' }}>Account Events</h3>
          {events.length === 0 ? <p style={{ color: 'var(--grey-600)', fontSize: 13, margin: 0 }}>No events yet.</p> :
            events.map(ev => (
              <div key={ev.id} style={{ display: 'flex', gap: 12, padding: '8px 0', borderBottom: '1px solid #F5F5F5', fontSize: 13 }}>
                <span style={{ color: 'var(--grey-600)', flexShrink: 0 }}>{format(new Date(ev.created_at), 'dd MMM, h:mm a')}</span>
                <span style={{ fontWeight: 500 }}>{ev.event_type.replace(/_/g, ' ')}</span>
                {ev.notes && <span style={{ color: 'var(--grey-600)' }}>— {ev.notes}</span>}
              </div>
            ))
          }
        </div>
      </div>

      <ConfirmModal open={!!confirm} title={confirm?.label || ''} body={`Are you sure you want to ${confirm?.action?.replace(/_/g, ' ')}?`} confirmLabel={confirm?.label} confirmColor={confirm?.color} loading={actionLoading} onConfirm={() => runAction(confirm?.action)} onCancel={() => setConfirm(null)} />
      <Snackbar open={snack.open} message={snack.message} type={snack.type} />
    </SALayout>
  )
}
