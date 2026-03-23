import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useAnalytics } from '../hooks/useAnalytics'
import { useNavigate, useLocation } from 'react-router-dom'
import NotificationBell from '../components/Notifications/NotificationBell'
import SkeletonCard from '../components/shared/SkeletonCard'
import { LayoutDashboard, List, BarChart2, Users, Clock } from 'lucide-react'

function MetricCard({ label, value, sub, color = 'var(--navy)' }) {
  return (
    <div className="card" style={{ padding: '14px 16px', flex: 1, minWidth: '44%' }}>
      <div style={{ fontSize: 26, fontFamily: '"Inter", sans-serif', fontWeight: 700, color }}>{value ?? '—'}</div>
      <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--grey-600)', marginTop: 2 }}>{label}</div>
      {sub && <div style={{ fontSize: 11, color: 'var(--grey-600)', marginTop: 1 }}>{sub}</div>}
    </div>
  )
}

export default function AnalyticsDashboard() {
  const { user, businessId } = useAuth()
  const { data, loading, fetchAnalytics } = useAnalytics(businessId)
  const [range, setRange] = useState('week')
  const navigate = useNavigate(); const location = useLocation()

  useEffect(() => { fetchAnalytics(range) }, [range, fetchAnalytics])

  const tabs = [
    { id: '/', label: 'Dashboard', Icon: LayoutDashboard },
    { id: '/tasks', label: 'Tasks', Icon: List },
    { id: '/analytics', label: 'Analytics', Icon: BarChart2 },
    { id: '/admin', label: 'Admin', Icon: Users },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100dvh' }}>
      <div className="app-bar">
        <span className="app-bar-title">Analytics</span>
        <NotificationBell userId={user?.id} />
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '16px', paddingBottom: '90px' }}>
        {/* Range chips */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          {[['week', 'This Week'], ['month', 'This Month']].map(([id, label]) => (
            <button key={id} onClick={() => setRange(id)} style={{ padding: '6px 16px', borderRadius: 100, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, background: range === id ? 'var(--navy)' : '#F0F0F0', color: range === id ? '#fff' : 'var(--grey-600)', transition: 'all 150ms ease' }}>
              {label}
            </button>
          ))}
        </div>

        {loading ? (
          <>{[0,1,2,3].map(i => <SkeletonCard key={i} lines={2} />)}</>
        ) : data ? (
          <>
            {/* Summary cards */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 20 }}>
              <MetricCard label="Total Tasks" value={data.total} color="var(--navy)" />
              <MetricCard label="Completed" value={data.completed} color="var(--green)" />
              <MetricCard label="In Progress" value={data.inProgress} color="var(--blue)" />
              <MetricCard label="Completion Rate" value={`${data.completionRate}%`} color={data.completionRate >= 70 ? 'var(--green)' : data.completionRate >= 40 ? 'var(--amber)' : 'var(--red)'} />
            </div>

            {/* Per-staff table */}
            <h3 style={{ fontFamily: '"Inter", sans-serif', fontSize: 14, fontWeight: 600, color: 'var(--grey-900)', marginBottom: 10 }}>Staff Performance</h3>
            {data.staffStats.length === 0
              ? <p style={{ color: 'var(--grey-600)', fontSize: 13 }}>No staff data for this period.</p>
              : <div className="card" style={{ overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                    <thead>
                      <tr style={{ background: '#F5F5F5' }}>
                        {['Name', 'Assigned', 'Done', '%', 'Avg Time'].map(h => (
                          <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: 'var(--grey-600)', whiteSpace: 'nowrap' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {data.staffStats.map((s, i) => (
                        <tr key={s.id} style={{ borderTop: '1px solid #F0F0F0', background: i % 2 === 0 ? '#fff' : '#FAFAFA' }}>
                          <td style={{ padding: '10px 12px', fontWeight: 600 }}>{s.name}</td>
                          <td style={{ padding: '10px 12px' }}>{s.assigned}</td>
                          <td style={{ padding: '10px 12px', color: 'var(--green)', fontWeight: 600 }}>{s.completed}</td>
                          <td style={{ padding: '10px 12px' }}>{s.completionRate}%</td>
                          <td style={{ padding: '10px 12px', color: 'var(--grey-600)', display: 'flex', alignItems: 'center', gap: 4 }}>
                            {s.avgMinutes ? <><Clock size={11} />{s.avgMinutes >= 60 ? `${Math.round(s.avgMinutes/60)}h` : `${s.avgMinutes}m`}</> : '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
            }
          </>
        ) : null}
      </div>

      <div className="bottom-tabs">
        {tabs.map(({ id, label, Icon }) => (
          <button key={id} className={`bottom-tab${location.pathname === id ? ' active' : ''}`} onClick={() => navigate(id)}>
            <Icon size={20} /><span>{label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
