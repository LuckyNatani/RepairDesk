import { useTrial } from '../../hooks/useTrial'

export default function AccountBanner({ business }) {
  const { status, daysLeft, hoursLeft } = useTrial(business)
  if (!status || status === 'active') return null
  if (status !== 'trial_active') return null

  const isUrgent = daysLeft !== null && daysLeft <= 2
  const msg = isUrgent
    ? `Trial ends in ${hoursLeft}h — contact administrator to activate.`
    : `Trial active — ${daysLeft} day${daysLeft !== 1 ? 's' : ''} remaining.`

  return (
    <div style={{ background: isUrgent ? 'var(--red-surface)' : 'var(--amber-surface)', color: isUrgent ? 'var(--red)' : '#795548', borderBottom: `2px solid ${isUrgent ? 'var(--red)' : 'var(--amber)'}`, padding: '8px 16px', fontSize: 13, fontWeight: 500, textAlign: 'center' }}>
      {msg}
    </div>
  )
}
