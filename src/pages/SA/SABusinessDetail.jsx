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

  const runAction = async () => {
    if (!confirm) return
    const { action, userId, isActive } = confirm
    setActionLoading(true)
    
    let body = { action, businessId: id }
    if (action === 'extend_trial') body.days = extendDays
    if (action === 'toggle_user') {
      body.userId = userId
      body.isActive = isActive
    }

    const { error } = await supabase.functions.invoke('manage-account', { body })
    setActionLoading(false); setConfirm(null)
    if (error) show('Action failed: ' + error.message, 'error')
    else { show('Done!', 'success'); load() }
  }


  if (loading) return <SALayout><div style={{ padding: 24 }}>Loading…</div></SALayout>
  if (!biz) return <SALayout><div style={{ padding: 24 }}>Business not found</div></SALayout>

  const status = biz.account_status

  return (
    <SALayout>

      <div style={{ padding: '24px', maxWidth: 1200, margin: '0 auto' }}>
        {/* Breadcrumbs & Header */}
        <div style={{ marginBottom: 24 }}>
          <button onClick={() => navigate('/sa')} style={{ background: 'none', border: 'none', color: 'var(--gray-500)', cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', gap: 4, marginBottom: 8, padding: 0 }}>
            <ArrowLeft size={14} /> Back to Businesses
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <h1 style={{ fontSize: 28, fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>{biz.name}</h1>
            <BusinessStatusChip status={status} />
          </div>
        </div>

        {/* Desktop Grid Layout */}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 340px', gap: 24, alignItems: 'start' }}>
          
          {/* Main Column (Left) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            
            {/* Business Overview & Owner */}
            <div className="card" style={{ padding: 24 }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>Overview</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--gray-400)', textTransform: 'uppercase', marginBottom: 8 }}>Owner Details</div>
                  <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>{biz.owner?.name}</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <a href={`mailto:${biz.owner?.email}`} style={{ fontSize: 13, color: 'var(--teal)', display: 'flex', alignItems: 'center', gap: 6, textDecoration: 'none' }}><Mail size={14} />{biz.owner?.email}</a>
                    {biz.owner?.phone && (
                      <a href={toTelLink(biz.owner.phone)} style={{ fontSize: 13, color: 'var(--teal)', display: 'flex', alignItems: 'center', gap: 6, textDecoration: 'none' }}>
                        <Phone size={14} />{biz.owner.phone}
                      </a>
                    )}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--gray-400)', textTransform: 'uppercase', marginBottom: 8 }}>Account Stats</div>
                  <div style={{ fontSize: 13, color: 'var(--gray-600)' }}>Created: <strong>{format(new Date(biz.created_at), 'dd MMM yyyy')}</strong></div>
                  <div style={{ fontSize: 13, color: 'var(--gray-600)' }}>Total Users: <strong>{staff.length}</strong></div>
                </div>
              </div>
            </div>

            {/* Users List */}
            <div className="card" style={{ padding: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Business Users</h2>
                <span className="badge" style={{ background: 'var(--gray-100)', color: 'var(--gray-600)' }}>{staff.length} Total</span>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--gray-100)' }}>
                      <th style={{ padding: '12px 8px', fontSize: 12, color: 'var(--gray-400)', fontWeight: 600 }}>NAME</th>
                      <th style={{ padding: '12px 8px', fontSize: 12, color: 'var(--gray-400)', fontWeight: 600 }}>ROLE</th>
                      <th style={{ padding: '12px 8px', fontSize: 12, color: 'var(--gray-400)', fontWeight: 600 }}>STATUS</th>
                      <th style={{ padding: '12px 8px', fontSize: 12, color: 'var(--gray-400)', fontWeight: 600, textAlign: 'right' }}>ACTION</th>
                    </tr>
                  </thead>
                  <tbody>
                    {staff.map(s => (
                      <tr key={s.id} style={{ borderBottom: '1px solid var(--gray-50)' }}>
                        <td style={{ padding: '12px 8px', fontSize: 14, fontWeight: 600 }}>{s.name}</td>
                        <td style={{ padding: '12px 8px', fontSize: 13, color: 'var(--gray-600)' }}>{s.role}</td>
                        <td style={{ padding: '12px 8px' }}>
                          <span className="badge badge-sm" style={{ 
                            background: s.is_active ? 'var(--teal-surface)' : 'var(--gray-100)', 
                            color: s.is_active ? 'var(--teal)' : 'var(--gray-500)' 
                          }}>
                            {s.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td style={{ padding: '12px 8px', textAlign: 'right' }}>
                          <button 
                            className="btn btn-ghost btn-sm" 
                            style={{ padding: '4px 8px', fontSize: 11, height: 28 }}
                            onClick={() => setConfirm({ 
                              action: 'toggle_user', 
                              label: s.is_active ? 'Deactivate User' : 'Activate User', 
                              color: s.is_active ? 'red' : 'teal',
                              userId: s.id,
                              isActive: !s.is_active
                            })}
                          >
                            {s.is_active ? 'Deactivate' : 'Activate'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>

                </table>
              </div>
            </div>
          </div>

          {/* Sidebar Column (Right) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            
            {/* Status & Expiry */}
            <div className="card" style={{ 
              padding: 20, 
              background: status === 'active' ? 'var(--teal-surface)' : (status === 'suspended' ? 'var(--red-surface)' : 'var(--gray-50)'),
              border: `1px solid ${status === 'active' ? 'var(--teal)' : (status === 'suspended' ? 'var(--red)' : 'var(--gray-200)')}`
            }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--gray-500)', textTransform: 'uppercase', marginBottom: 8 }}>Subscription Info</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--gray-900)' }}>
                {status === 'active' ? 'Active Subscription' : (status === 'trial_expired' ? 'Trial Expired' : 'Trial Period')}
              </div>
              {biz.trial_ends_at && (
                <div style={{ fontSize: 13, color: 'var(--gray-600)', marginTop: 4 }}>
                  {status === 'active' ? 'Expires' : 'Ends'}: <strong>{format(new Date(biz.trial_ends_at), 'dd MMM yyyy')}</strong>
                </div>
              )}
            </div>

            {/* Admin Actions */}
            <div className="card" style={{ padding: 20 }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16, borderBottom: '1px solid var(--gray-100)', paddingBottom: 8 }}>Admin Actions</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {(status === 'trial_active' || status === 'trial_expired') && (
                  <button className="btn btn-teal btn-full" onClick={() => setConfirm({ action: 'activate', label: 'Activate Account', color: 'teal' })}>Activate for 1 Year</button>
                )}
                {status === 'active' && (
                  <button className="btn btn-danger btn-full" onClick={() => setConfirm({ action: 'suspend', label: 'Suspend Account', color: 'red' })}>Suspend Account</button>
                )}
                {status === 'suspended' && (
                  <button className="btn btn-teal btn-full" onClick={() => setConfirm({ action: 'reactivate', label: 'Reactivate Account', color: 'teal' })}>Reactivate Account</button>
                )}
                
                <div style={{ marginTop: 8, padding: 12, background: 'var(--gray-50)', borderRadius: 8 }}>
                  <label className="input-label" style={{ fontSize: 11 }}>Extend Trial / Sub</label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input type="number" min={1} max={365} value={extendDays} onChange={e => setExtendDays(Number(e.target.value))} className="input" style={{ width: '100%', height: 38, minHeight: 38 }} />
                    <button className="btn btn-ghost" style={{ minHeight: 38, height: 38, padding: '0 12px' }} onClick={() => setConfirm({ action: 'extend_trial', label: `Extend ${extendDays}d`, color: 'black' })}>Extend</button>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="card" style={{ padding: 20 }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>Recent Activity</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {events.length === 0 ? <p style={{ color: 'var(--gray-400)', fontSize: 12, margin: 0 }}>No events recorded.</p> :
                  events.map(ev => (
                    <div key={ev.id} style={{ display: 'flex', flexDirection: 'column', gap: 2, paddingBottom: 8, borderBottom: '1px solid var(--gray-50)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: 12, fontWeight: 700, textTransform: 'capitalize' }}>{ev.event_type.replace(/_/g, ' ')}</span>
                        <span style={{ fontSize: 10, color: 'var(--gray-400)' }}>{format(new Date(ev.created_at), 'dd MMM')}</span>
                      </div>
                      {ev.notes && <span style={{ fontSize: 11, color: 'var(--gray-500)' }}>{ev.notes}</span>}
                    </div>
                  ))
                }
              </div>
            </div>
          </div>
        </div>
      </div>

      <ConfirmModal 
        open={!!confirm} 
        title={confirm?.label || ''} 
        body={`Are you sure you want to ${confirm?.label?.toLowerCase()} for this account?`} 
        confirmLabel={confirm?.label} 
        confirmColor={confirm?.color} 
        loading={actionLoading} 
        onConfirm={runAction} 
        onCancel={() => setConfirm(null)} 
      />

      <Snackbar open={snack.open} message={snack.message} type={snack.type} />
    </SALayout>
  )
}

