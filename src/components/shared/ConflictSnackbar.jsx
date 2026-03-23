import { AlertTriangle, RefreshCw } from 'lucide-react'

export default function ConflictSnackbar({ open, onRefresh, onClose }) {
  if (!open) return null
  return (
    <div className="snackbar snackbar-error" role="alert" style={{ bottom: 'calc(80px + var(--safe-bottom))' }}>
      <AlertTriangle size={16} style={{ flexShrink: 0 }} />
      <span style={{ flex: 1, fontSize: 13 }}>This task was updated by someone else.</span>
      <button onClick={onRefresh} style={{ background: 'none', border: '1px solid rgba(255,255,255,0.4)', borderRadius: 6, color: '#fff', cursor: 'pointer', padding: '4px 10px', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
        <RefreshCw size={12} /> Refresh
      </button>
    </div>
  )
}
