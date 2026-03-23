import { useSABusinesses } from '../../hooks/useSABusinesses'
import { useNavigate } from 'react-router-dom'
import { Building2, ChevronRight, Users, CheckCircle, Clock, AlertCircle } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

const STATUS_CONFIG = {
  trial_active:   { label: 'Trial',     bg: 'var(--amber-surface)', color: 'var(--amber)',   Icon: Clock },
  active:         { label: 'Active',    bg: 'var(--green-surface)', color: 'var(--green)',   Icon: CheckCircle },
  trial_expired:  { label: 'Expired',   bg: '#F5F5F5',              color: 'var(--grey-600)', Icon: AlertCircle },
  suspended:      { label: 'Suspended', bg: 'var(--red-surface)',   color: 'var(--red)',     Icon: AlertCircle },
}

export function BusinessStatusChip({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.trial_active
  const { Icon } = cfg
  return (
    <span className="badge badge-sm" style={{ background: cfg.bg, color: cfg.color, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
      <Icon size={10} /> {cfg.label}
    </span>
  )
}

export function BusinessCard({ biz, onSelect }) {
  return (
    <div className="card" onClick={() => onSelect(biz.id)} style={{ cursor: 'pointer', padding: '16px', marginBottom: 10 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <div style={{ width: 44, height: 44, background: 'var(--sa-surface)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Building2 size={22} color="var(--sa-purple)" />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span style={{ fontFamily: '"Inter", sans-serif', fontWeight: 700, fontSize: 15 }}>{biz.name}</span>
            <BusinessStatusChip status={biz.account_status} />
          </div>
          <p style={{ margin: '0 0 4px', fontSize: 12, color: 'var(--grey-600)' }}>Owner: {biz.owner?.name}</p>
          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--grey-600)' }}><Users size={10} /> {biz.users?.[0]?.count ?? 0} users</div>
            <div style={{ fontSize: 11, color: 'var(--grey-600)' }}>Created {formatDistanceToNow(new Date(biz.created_at), { addSuffix: true })}</div>
          </div>
        </div>
        <ChevronRight size={16} color="var(--grey-600)" />
      </div>
    </div>
  )
}
