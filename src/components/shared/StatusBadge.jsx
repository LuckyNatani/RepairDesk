const STATUS_CONFIG = {
  unassigned: { label: 'Unassigned', bg: 'var(--amber-surface)', color: 'var(--amber)' },
  in_progress: { label: 'In Progress', bg: 'var(--blue-surface)', color: 'var(--blue)' },
  completed:   { label: 'Completed',  bg: 'var(--green-surface)', color: 'var(--green)' },
}

export default function StatusBadge({ status, size = 'md' }) {
  const cfg = STATUS_CONFIG[status] || { label: status, bg: '#F5F5F5', color: '#757575' }
  return (
    <span
      className={`badge ${size === 'sm' ? 'badge-sm' : ''}`}
      style={{ background: cfg.bg, color: cfg.color }}
    >
      {cfg.label}
    </span>
  )
}
