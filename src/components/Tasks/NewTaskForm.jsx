import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { useCustomers } from '../../hooks/useCustomers'
import { createTask } from '../../hooks/useTasks'
import { autoFormatPhone } from '../../lib/phoneUtils'
import { ChevronDown, ChevronUp, User } from 'lucide-react'

export default function NewTaskForm({ businessId, createdBy, staffList = [], serviceTypes = [], onSuccess, onDismiss }) {
  const [mode, setMode] = useState('quick')
  const [form, setForm] = useState({ customerName: '', customerPhone: '', customerAddress: '', serviceTypeId: '', serviceDescription: '', assignedTo: '', isUrgent: false, dueAt: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [addressSuggestion, setAddressSuggestion] = useState(null)
  const { suggestions, search, getLastAddress } = useCustomers(businessId)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const debounceRef = useRef(null)

  const handlePhoneChange = (val) => {
    const formatted = autoFormatPhone(val)
    setForm(f => ({ ...f, customerPhone: formatted }))
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => search(formatted), 300)
  }

  const handleNameChange = (val) => {
    setForm(f => ({ ...f, customerName: val }))
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => { search(val); setShowSuggestions(true) }, 300)
  }

  const selectSuggestion = async (customer) => {
    setForm(f => ({ ...f, customerName: customer.name, customerPhone: customer.phone }))
    setShowSuggestions(false)
    const addr = await getLastAddress(customer.id)
    if (addr) setAddressSuggestion(addr)
  }

  const handleServiceType = (id) => {
    const st = serviceTypes.find(s => s.id === id)
    setForm(f => ({ ...f, serviceTypeId: id, serviceDescription: st?.default_description || f.serviceDescription }))
  }

  const handleSave = async (isDraft) => {
    if (!form.customerName.trim() || !form.customerPhone.trim()) { setError('Customer name and phone are required'); return }
    setLoading(true); setError(null)
    const status = !isDraft && form.assignedTo ? 'in_progress' : 'unassigned'
    const payload = {
      business_id: businessId, created_by: createdBy,
      customer_name: form.customerName.trim(), customer_phone: form.customerPhone.trim(),
      customer_address: form.customerAddress.trim() || null,
      service_type_id: form.serviceTypeId || null,
      service_type_label: serviceTypes.find(s=>s.id===form.serviceTypeId)?.label || null,
      service_description: form.serviceDescription.trim() || null,
      assigned_to: form.assignedTo || null,
      assigned_at: form.assignedTo ? new Date().toISOString() : null,
      is_urgent: form.isUrgent, is_draft: isDraft, status,
      due_at: form.dueAt ? new Date(form.dueAt).toISOString() : null,
    }
    try {
      const data = await createTask(payload)
      setLoading(false)
      onSuccess?.(data)
      onDismiss?.()
    } catch (err) {
      setLoading(false)
      setError(err.message)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {error && <div style={{ background: 'var(--red-surface)', color: 'var(--red)', padding: '10px 14px', borderRadius: 8, fontSize: 13 }}>{error}</div>}

      {/* Phone */}
      <div style={{ position: 'relative' }}>
        <label className="input-label">Customer Phone *</label>
        <input className="input" type="tel" placeholder="+91XXXXXXXXXX" value={form.customerPhone} onChange={e => handlePhoneChange(e.target.value)} />
      </div>

      {/* Name */}
      <div style={{ position: 'relative' }}>
        <label className="input-label">Customer Name *</label>
        <input className="input" type="text" placeholder="Full name" value={form.customerName}
          onChange={e => handleNameChange(e.target.value)} onFocus={() => setShowSuggestions(true)} onBlur={() => setTimeout(() => setShowSuggestions(false), 200)} />
        {showSuggestions && suggestions.length > 0 && (
          <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#fff', border: '1px solid #E0E0E0', borderRadius: 8, boxShadow: 'var(--shadow-lg)', zIndex: 20, overflow: 'hidden' }}>
            {suggestions.map(s => (
              <button key={s.id} onMouseDown={() => selectSuggestion(s)} style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '10px 14px', border: 'none', background: 'none', cursor: 'pointer', textAlign: 'left', borderBottom: '1px solid #F5F5F5' }}>
                <User size={14} color="var(--gray-600)" />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{s.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--gray-600)' }}>{s.phone}</div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Expand link */}
      {mode === 'quick' && (
        <button onClick={() => setMode('full')} style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--blue)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, alignSelf: 'flex-start', padding: 0 }}>
          Add more details <ChevronDown size={14} />
        </button>
      )}
      {mode === 'full' && (
        <>
          <button onClick={() => setMode('quick')} style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--gray-600)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, alignSelf: 'flex-start', padding: 0 }}>
            Collapse <ChevronUp size={14} />
          </button>

          <div>
            <label className="input-label">Customer Address</label>
            <input className="input" type="text" placeholder="Full address" value={form.customerAddress} onChange={e => setForm(f => ({ ...f, customerAddress: e.target.value }))} />
            {addressSuggestion && !form.customerAddress && (
              <button onClick={() => setForm(f => ({ ...f, customerAddress: addressSuggestion }))} style={{ fontSize: 12, color: 'var(--blue)', background: 'var(--blue-surface)', border: 'none', borderRadius: 6, padding: '4px 10px', cursor: 'pointer', marginTop: 6, display: 'block' }}>
                Use: {addressSuggestion.slice(0, 40)}…
              </button>
            )}
          </div>

          {serviceTypes.length > 0 && (
            <div>
              <label className="input-label">Service Type</label>
              <select className="input" value={form.serviceTypeId} onChange={e => handleServiceType(e.target.value)}>
                <option value="">Select type…</option>
                {serviceTypes.map(st => <option key={st.id} value={st.id}>{st.label}</option>)}
              </select>
            </div>
          )}

          <div>
            <label className="input-label">Service Description</label>
            <textarea className="input" rows={3} placeholder="Describe the service required…" value={form.serviceDescription} onChange={e => setForm(f => ({ ...f, serviceDescription: e.target.value }))} style={{ resize: 'vertical' }} />
          </div>

          <div>
            <label className="input-label">Assign Staff</label>
            <select className="input" value={form.assignedTo} onChange={e => setForm(f => ({ ...f, assignedTo: e.target.value }))}>
              <option value="">Unassigned</option>
              {staffList.filter(s => s.is_active).map(s => <option key={s.id} value={s.id}>{s.name}{s.activeTasks !== undefined ? ` (${s.activeTasks} active)` : ''}</option>)}
            </select>
          </div>

          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14 }}>
              <input type="checkbox" checked={form.isUrgent} onChange={e => setForm(f => ({ ...f, isUrgent: e.target.checked }))} />
              <span style={{ color: form.isUrgent ? 'var(--red)' : 'var(--gray-900)', fontWeight: form.isUrgent ? 600 : 400 }}>Mark as Urgent</span>
            </label>
          </div>

          <div>
            <label className="input-label">Due Date & Time</label>
            <input className="input" type="datetime-local" value={form.dueAt} onChange={e => setForm(f => ({ ...f, dueAt: e.target.value }))} />
          </div>
        </>
      )}

      {/* Buttons */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingTop: 4 }}>
        {mode === 'full' && (
          <button className="btn btn-primary btn-full" onClick={() => handleSave(false)} disabled={loading}>
            {loading ? 'Saving…' : 'Save Task'}
          </button>
        )}
        <button className="btn btn-ghost btn-full" onClick={() => handleSave(true)} disabled={loading}>
          {loading ? 'Saving…' : 'Save Draft'}
        </button>
      </div>
    </div>
  )
}
