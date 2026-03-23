import { useState } from 'react'
import SALayout from '../../components/SA/SALayout'
import Snackbar from '../../components/shared/Snackbar'
import { useSnackbar } from '../../hooks/useSnackbar'
import { supabase } from '../../lib/supabaseClient'

export default function SACreateBusiness() {
  const { snack, show, error: showError } = useSnackbar()
  // alias
  const [form, setForm] = useState({ businessName: '', ownerName: '', ownerEmail: '', ownerPhone: '', tempPassword: '' })
  const [loading, setLoading] = useState(false)
  const [created, setCreated] = useState(null)

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!form.businessName || !form.ownerName || !form.ownerEmail || !form.ownerPhone || !form.tempPassword) { showError('All fields required'); return }
    setLoading(true)
    const { data, error } = await supabase.functions.invoke('create-business', { body: form })
    setLoading(false)
    if (error) showError('Failed: ' + error.message)
    else { setCreated(data); show('Business created!', 'success') }
  }

  if (created) return (
    <SALayout>
      <div style={{ padding: 32, maxWidth: 480 }}>
        <div style={{ background: 'var(--green-surface)', borderRadius: 16, padding: 24, textAlign: 'center' }}>
          <h2 style={{ fontFamily: '"Inter", sans-serif', color: 'var(--green)', marginBottom: 12 }}>Business Created!</h2>
          <p style={{ fontSize: 14, color: 'var(--grey-900)', marginBottom: 4 }}><strong>{created.businessName}</strong></p>
          <p style={{ fontSize: 13, color: 'var(--grey-600)', margin: '4px 0' }}>Owner: {created.ownerEmail}</p>
          <p style={{ fontSize: 13, color: 'var(--grey-600)', margin: '4px 0' }}>Temp password: <strong>{created.tempPassword}</strong></p>
        </div>
        <button className="btn btn-ghost btn-full" onClick={() => setCreated(null)} style={{ marginTop: 16 }}>Create Another</button>
      </div>
    </SALayout>
  )

  return (
    <SALayout>
      <div style={{ padding: 32, maxWidth: 480 }}>
        <h1 style={{ fontFamily: '"Inter", sans-serif', fontSize: 20, fontWeight: 700, marginBottom: 24 }}>New Business</h1>
        <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 14, background: '#fff', borderRadius: 14, padding: 20, boxShadow: 'var(--shadow-md)' }}>
          {[['businessName','Business Name','text'], ['ownerName','Owner Full Name','text'], ['ownerEmail','Owner Email','email'], ['ownerPhone','Owner Phone','tel'], ['tempPassword','Temp Password','password']].map(([field, label, type]) => (
            <div key={field}>
              <label className="input-label">{label}</label>
              <input className="input" type={type} value={form[field]} onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))} />
            </div>
          ))}
          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>{loading ? 'Creating…' : 'Create Business & Owner'}</button>
        </form>
      </div>
      <Snackbar open={snack.open} message={snack.message} type={snack.type} />
    </SALayout>
  )
}
