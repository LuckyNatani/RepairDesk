import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useNavigate, useLocation } from 'react-router-dom'
import NotificationBell from '../components/Notifications/NotificationBell'
import SkeletonCard from '../components/shared/SkeletonCard'
import ConfirmModal from '../components/shared/ConfirmModal'
import Snackbar from '../components/shared/Snackbar'
import { useSnackbar } from '../hooks/useSnackbar'
import { supabase } from '../lib/supabaseClient'
import { LayoutDashboard, List, BarChart2, Users, Plus, User, Phone, Eye, EyeOff, Edit2, Trash2, LogOut } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import Avatar from '../components/shared/Avatar'
import { toTelLink } from '../lib/phoneUtils'

function StaffRow({ staff, onDeactivate, onReactivate, onReset }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderBottom: '1px solid #F0F0F0' }}>
      <Avatar name={staff.name} color={staff.avatar_color || 'var(--navy)'} size="md" />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontWeight: 600, fontSize: 14 }}>{staff.name}</span>
          <span className="badge badge-sm" style={{ background: staff.is_active ? 'var(--green-surface)' : '#F5F5F5', color: staff.is_active ? 'var(--green)' : 'var(--gray-600)' }}>{staff.is_active ? 'Active' : 'Inactive'}</span>
        </div>
        <a href={toTelLink(staff.phone)} style={{ fontSize: 12, color: 'var(--blue)', textDecoration: 'none' }}>{staff.phone}</a>
        {staff.last_seen_at && <div style={{ fontSize: 11, color: 'var(--gray-600)' }}>Last seen {formatDistanceToNow(new Date(staff.last_seen_at), { addSuffix: true })}</div>}
      </div>
      <div style={{ display: 'flex', gap: 6 }}>
        <button onClick={onReset} style={{ fontSize: 12, padding: '5px 10px', background: '#F5F5F5', border: 'none', borderRadius: 6, cursor: 'pointer', color: 'var(--gray-900)' }}>Reset</button>
        {staff.is_active
          ? <button onClick={onDeactivate} style={{ fontSize: 12, padding: '5px 10px', background: 'var(--red-surface)', border: 'none', borderRadius: 6, cursor: 'pointer', color: 'var(--red)' }}>Deactivate</button>
          : <button onClick={onReactivate} style={{ fontSize: 12, padding: '5px 10px', background: 'var(--green-surface)', border: 'none', borderRadius: 6, cursor: 'pointer', color: 'var(--green)' }}>Reactivate</button>
        }
      </div>
    </div>
  )
}

export default function AdminPanel() {
  const { user, businessId, profile, logout } = useAuth()
  const { snack, show } = useSnackbar()
  const navigate = useNavigate(); const location = useLocation()
  const [staffList, setStaffList] = useState([])
  const [serviceTypes, setServiceTypes] = useState([])
  const [loading, setLoading] = useState(true)
  const [addForm, setAddForm] = useState({ name: '', email: '', phone: '', tempPassword: '' })
  const [showPw, setShowPw] = useState(false)
  const [addLoading, setAddLoading] = useState(false)
  const [confirmDeactivate, setConfirmDeactivate] = useState(null)
  const [newSTLabel, setNewSTLabel] = useState('')

  const loadData = async () => {
    setLoading(true)
    const { data: staff } = await supabase.from('users').select('id,name,email,phone,avatar_color,is_active,last_seen_at').eq('business_id', businessId).eq('role', 'staff').order('created_at')
    const { data: st } = await supabase.from('service_types').select('*').eq('business_id', businessId).order('sort_order')
    setStaffList(staff || []); setServiceTypes(st || [])
    setLoading(false)
  }
  useEffect(() => { if (businessId) loadData() }, [businessId])

  const addStaff = async () => {
    if (!addForm.name || !addForm.email || !addForm.phone || !addForm.tempPassword) { show('All fields required', 'error'); return }
    setAddLoading(true)
    const { error } = await supabase.functions.invoke('manage-staff-fix', { body: { action: 'create', businessId, ...addForm } })
    setAddLoading(false)
    if (error) show('Failed to add staff: ' + error.message, 'error')
    else { show('Staff added!', 'success'); setAddForm({ name: '', email: '', phone: '', tempPassword: '' }); loadData() }
  }

  const deactivateStaff = async (staffId) => {
    await supabase.from('users').update({ is_active: false }).eq('id', staffId)
    await supabase.from('tasks').update({ status: 'unassigned', assigned_to: null }).eq('assigned_to', staffId).eq('status', 'in_progress')
    setConfirmDeactivate(null); loadData(); show('Staff deactivated', 'info')
  }

  const reactivateStaff = async (staffId) => {
    await supabase.from('users').update({ is_active: true }).eq('id', staffId)
    loadData(); show('Staff reactivated', 'success')
  }

  const addServiceType = async () => {
    if (!newSTLabel.trim()) return
    await supabase.from('service_types').insert({ business_id: businessId, label: newSTLabel.trim(), sort_order: serviceTypes.length })
    setNewSTLabel(''); loadData()
  }

  const deleteServiceType = async (id) => {
    const { error } = await supabase.from('service_types').delete().eq('id', id)
    if (error) show('Cannot delete — tasks reference this type', 'error')
    else loadData()
  }

  const tabs = [
    { id: '/', label: 'Dashboard', Icon: LayoutDashboard },
    { id: '/tasks', label: 'Tasks', Icon: List },
    { id: '/analytics', label: 'Analytics', Icon: BarChart2 },
    { id: '/admin', label: 'Admin', Icon: Users },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100dvh' }}>
      <div className="app-bar">
        <span className="app-bar-title">Admin</span>
        <div className="flex items-center gap-2">
          <NotificationBell userId={user?.id} />
          <button onClick={logout} className="mobile-logout" title="Sign Out">
            <LogOut size={20} />
          </button>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 90 }}>
        {/* Add Staff */}
        <div style={{ padding: 16 }}>
          <h3 style={{ fontFamily: '"Inter", sans-serif', fontSize: 15, fontWeight: 700, marginBottom: 14 }}>Add Staff</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, background: '#fff', borderRadius: 12, padding: 16, boxShadow: 'var(--shadow-md)' }}>
            {['name', 'email', 'phone'].map(field => (
              <div key={field}>
                <label className="input-label">{field === 'name' ? 'Full Name' : field === 'email' ? 'Email' : 'Phone'}</label>
                <input className="input" type={field === 'email' ? 'email' : field === 'phone' ? 'tel' : 'text'} value={addForm[field]} onChange={e => setAddForm(f => ({ ...f, [field]: e.target.value }))} />
              </div>
            ))}
            <div>
              <label className="input-label">Temp Password</label>
              <div style={{ position: 'relative' }}>
                <input className="input" type={showPw ? 'text' : 'password'} value={addForm.tempPassword} onChange={e => setAddForm(f => ({ ...f, tempPassword: e.target.value }))} minLength={8} style={{ paddingRight: 44 }} />
                <button type="button" onClick={() => setShowPw(v => !v)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gray-600)', display: 'flex' }}>
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <button className="btn btn-primary btn-full" onClick={addStaff} disabled={addLoading || staffList.length >= 14}>
              {addLoading ? 'Adding…' : <><Plus size={16} /> Add Staff</>}
            </button>
            {staffList.length >= 14 && <p style={{ fontSize: 12, color: 'var(--gray-600)', textAlign: 'center', margin: 0 }}>Maximum 15 users reached</p>}
          </div>
        </div>

        {/* Staff List */}
        <div style={{ paddingBottom: 8 }}>
          <h3 style={{ fontFamily: '"Inter", sans-serif', fontSize: 15, fontWeight: 700, padding: '0 16px 10px' }}>Staff ({staffList.length})</h3>
          {loading ? [0,1,2].map(i => <SkeletonCard key={i} lines={2} />) :
            staffList.map(s => (
              <StaffRow key={s.id} staff={s}
                onDeactivate={() => setConfirmDeactivate(s)}
                onReactivate={() => reactivateStaff(s.id)}
                onReset={async () => {
                  const newPw = prompt(`Enter new temporary password for ${s.name}:`)
                  if (!newPw) return
                  if (newPw.length < 8) {
                    show('Password must be at least 8 characters', 'error')
                    return
                  }
                  try {
                    const { error: resetErr } = await supabase.functions.invoke('manage-staff-fix', {
                      body: { action: 'reset_password', businessId, staffId: s.id, tempPassword: newPw }
                    })
                    if (resetErr) throw resetErr
                    show('Password reset successfully! Staff must change it on next login.', 'success')
                  } catch (err) {
                    show('Failed to reset password: ' + err.message, 'error')
                  }
                }}
              />
            ))
          }
        </div>

        {/* Service Types */}
        <div style={{ padding: 16 }}>
          <h3 style={{ fontFamily: '"Inter", sans-serif', fontSize: 15, fontWeight: 700, marginBottom: 12 }}>Service Types</h3>
          <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
            <input className="input" value={newSTLabel} onChange={e => setNewSTLabel(e.target.value)} placeholder="New service type label…" style={{ flex: 1 }} />
            <button className="btn btn-primary" onClick={addServiceType}><Plus size={16} /></button>
          </div>
          {serviceTypes.map(st => (
            <div key={st.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: '#fff', borderRadius: 8, marginBottom: 6, boxShadow: 'var(--shadow-sm)' }}>
              <span style={{ flex: 1, fontSize: 14 }}>{st.label}</span>
              <button onClick={() => deleteServiceType(st.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gray-600)' }}><Trash2 size={15} /></button>
            </div>
          ))}
        </div>
      </div>

      <ConfirmModal open={!!confirmDeactivate} title={`Deactivate ${confirmDeactivate?.name}?`} body="Their active tasks will be moved to Unassigned." confirmLabel="Deactivate" confirmColor="red" onConfirm={() => deactivateStaff(confirmDeactivate.id)} onCancel={() => setConfirmDeactivate(null)} />

      <div className="bottom-tabs">
        {tabs.map(({ id, label, Icon }) => (
          <button key={id} className={`bottom-tab${location.pathname === id ? ' active' : ''}`} onClick={() => navigate(id)}>
            <Icon size={20} /><span>{label}</span>
          </button>
        ))}
      </div>

      <Snackbar open={snack.open} message={snack.message} type={snack.type} />
    </div>
  )
}
