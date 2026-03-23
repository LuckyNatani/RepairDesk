import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import SALayout from '../../components/SA/SALayout'
import { BusinessCard } from '../../components/SA/BusinessCard'
import { useSABusinesses } from '../../hooks/useSABusinesses'
import SkeletonCard from '../../components/shared/SkeletonCard'
import EmptyState from '../../components/shared/EmptyState'
import { Building2, Plus } from 'lucide-react'

export default function SADashboard() {
  const { businesses, loading } = useSABusinesses()
  const navigate = useNavigate()
  const counts = {
    total: businesses.length,
    trial: businesses.filter(b => b.account_status === 'trial_active').length,
    active: businesses.filter(b => b.account_status === 'active').length,
    suspended: businesses.filter(b => ['suspended', 'trial_expired'].includes(b.account_status)).length,
  }

  return (
    <SALayout>
      <div style={{ padding: '28px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <h1 style={{ fontFamily: '"Inter", sans-serif', fontSize: 22, fontWeight: 700, margin: 0 }}>Superadmin Dashboard</h1>
          <button className="btn btn-primary btn-sm" onClick={() => navigate('/sa/businesses/new')}><Plus size={16} /> New Business</button>
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 28, flexWrap: 'wrap' }}>
          {[['Total', counts.total, 'var(--sa-purple)'], ['Trial', counts.trial, 'var(--amber)'], ['Active', counts.active, 'var(--green)'], ['Suspended', counts.suspended, 'var(--red)']].map(([label, val, color]) => (
            <div key={label} style={{ background: '#fff', borderRadius: 12, padding: '14px 18px', minWidth: 80, boxShadow: 'var(--shadow-md)', flex: 1 }}>
              <div style={{ fontFamily: '"Inter", sans-serif', fontSize: 24, fontWeight: 700, color }}>{val}</div>
              <div style={{ fontSize: 12, color: 'var(--grey-600)', fontWeight: 600, marginTop: 2 }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Business list */}
        <h2 style={{ fontFamily: '"Inter", sans-serif', fontSize: 16, fontWeight: 600, marginBottom: 14 }}>Businesses</h2>
        {loading
          ? [0,1,2].map(i => <SkeletonCard key={i} lines={3} />)
          : businesses.length === 0
            ? <EmptyState icon={<Building2 size={28} />} title="No businesses yet" action={<button className="btn btn-primary btn-sm" onClick={() => navigate('/sa/businesses/new')}>Create First Business</button>} />
            : businesses.map(b => <BusinessCard key={b.id} biz={b} onSelect={(id) => navigate(`/sa/businesses/${id}`)} />)
        }
      </div>
    </SALayout>
  )
}
