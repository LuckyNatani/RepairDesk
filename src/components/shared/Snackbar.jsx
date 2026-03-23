import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react'

const ICONS = { success: CheckCircle, error: XCircle, info: Info, warning: AlertTriangle }

export default function Snackbar({ open, message, type = 'info', onClose }) {
  if (!open) return null
  const Icon = ICONS[type] || Info
  return (
    <div className={`snackbar snackbar-${type}`} role="alert">
      <Icon size={16} style={{ flexShrink: 0 }} />
      <span style={{ flex: 1 }}>{message}</span>
      {onClose && (
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', padding: 2, display: 'flex' }}>
          <X size={14} />
        </button>
      )}
    </div>
  )
}
