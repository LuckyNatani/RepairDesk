export default function EmptyState({ icon, title, body = null, action = null }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px 24px', textAlign: 'center', gap: 12 }}>
      {icon && <div style={{ color: 'var(--gray-600)', marginBottom: 4 }}>{icon}</div>}
      <p style={{ fontWeight: 600, color: 'var(--gray-900)', fontSize: 15, margin: 0 }}>{title}</p>
      {body && <p style={{ color: 'var(--gray-600)', fontSize: 13, margin: 0 }}>{body}</p>}
      {action && <div style={{ marginTop: 8 }}>{action}</div>}
    </div>
  )
}
