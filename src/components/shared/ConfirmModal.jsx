import BottomSheet from './BottomSheet'

export default function ConfirmModal({ open, title, body, confirmLabel = 'Confirm', cancelLabel = 'Cancel', confirmColor = 'navy', loading = false, onConfirm, onCancel }) {
  const btnClass = confirmColor === 'red' ? 'btn btn-danger btn-full' : confirmColor === 'green' ? 'btn btn-green btn-full' : 'btn btn-primary btn-full'
  return (
    <BottomSheet open={open} onClose={onCancel} title={title}>
      {typeof body === 'string'
        ? <p style={{ color: 'var(--grey-600)', fontSize: 14, marginBottom: 20, lineHeight: 1.6 }}>{body}</p>
        : <div style={{ marginBottom: 20 }}>{body}</div>}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <button className={btnClass} onClick={onConfirm} disabled={loading}>
          {loading ? 'Please wait…' : confirmLabel}
        </button>
        <button className="btn btn-ghost btn-full" onClick={onCancel} disabled={loading}>{cancelLabel}</button>
      </div>
    </BottomSheet>
  )
}
