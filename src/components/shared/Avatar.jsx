const SIZE_MAP = { sm: 28, md: 36, lg: 48 }

export default function Avatar({ name = '', color = '#1E3A5F', size = 'md' }) {
  const px = SIZE_MAP[size] || 36
  const parts = name.trim().split(' ')
  const initials = parts.length >= 2
    ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    : name.slice(0, 2).toUpperCase()
  return (
    <div style={{
      width: px, height: px, borderRadius: '50%',
      background: color, display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: '#fff', fontWeight: 700,
      fontSize: px < 36 ? 11 : px < 48 ? 13 : 16,
      flexShrink: 0,
      userSelect: 'none',
    }}>
      {initials}
    </div>
  )
}
