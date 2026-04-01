import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useAnalytics } from '../hooks/useAnalytics'
import SkeletonCard from '../components/shared/SkeletonCard'
import { Clock, Download, AlertTriangle } from 'lucide-react'
import { supabase } from '../lib/supabaseClient'

function MetricCard({ label, value, sub, color = 'var(--teal)' }) {
  return (
    <div className="card" style={{ padding: '14px 16px', flex: 1, minWidth: '44%' }}>
      <div style={{ fontSize: 26, fontFamily: '"Inter", sans-serif', fontWeight: 700, color }}>{value ?? '—'}</div>
      <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--gray-600)', marginTop: 2 }}>{label}</div>
      {sub && <div style={{ fontSize: 11, color: 'var(--gray-600)', marginTop: 1 }}>{sub}</div>}
    </div>
  )
}

export default function AnalyticsDashboard() {
  const { businessId } = useAuth()
  const { data, loading, fetchAnalytics } = useAnalytics(businessId)
  const [range, setRange] = useState('week')
  const [customFrom, setCustomFrom] = useState('')
  const [customTo, setCustomTo] = useState('')
  const [draftCount, setDraftCount] = useState(0)

  useEffect(() => {
    if (range !== 'custom') fetchAnalytics(range)
  }, [range, fetchAnalytics])

  useEffect(() => {
    if (!businessId) return
    supabase.from('tasks').select('id', { count: 'exact', head: true }).eq('business_id', businessId).eq('is_draft', true).then(({ count }) => setDraftCount(count || 0))
  }, [businessId])

  const applyCustomRange = () => {
    if (customFrom && customTo) fetchAnalytics('custom', customFrom, customTo)
  }

  const exportCSV = () => {
    if (!data?.staffStats?.length) return
    const headers = 'Name,Assigned,Completed,Completion Rate,Avg Minutes'
    const rows = data.staffStats.map(s => `${s.name},${s.assigned},${s.completed},${s.completionRate}%,${s.avgMinutes || 0}`)
    const csv = [headers, ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `taskpod-analytics-${range}.csv`; a.click()
    URL.revokeObjectURL(url)
  }

  const ranges = [['today', 'Today'], ['week', 'This Week'], ['month', 'This Month'], ['custom', 'Custom']]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100dvh - 56px - 64px)' }}>
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px', paddingBottom: '16px' }}>

        {/* Draft Alert Banner */}
        {draftCount > 0 && (
          <div style={{ background: 'var(--amber-surface)', border: '1px solid var(--amber)', borderRadius: 10, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, fontSize: 13 }}>
            <AlertTriangle size={16} color="var(--amber)" />
            <span>You have <strong>{draftCount}</strong> incomplete draft task{draftCount > 1 ? 's' : ''}.</span>
          </div>
        )}

        {/* Range chips */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
          {ranges.map(([id, label]) => (
            <button key={id} onClick={() => setRange(id)} style={{ padding: '6px 16px', borderRadius: 100, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, background: range === id ? 'var(--teal)' : '#F0F0F0', color: range === id ? '#fff' : 'var(--gray-600)', transition: 'all 150ms ease' }}>
              {label}
            </button>
          ))}
        </div>

        {/* Custom date picker */}
        {range === 'custom' && (
          <div style={{ display: 'flex', gap: 8, marginBottom: 16, alignItems: 'center' }}>
            <input type="date" className="input" value={customFrom} onChange={e => setCustomFrom(e.target.value)} style={{ flex: 1 }} />
            <span style={{ fontSize: 13, color: 'var(--gray-600)' }}>to</span>
            <input type="date" className="input" value={customTo} onChange={e => setCustomTo(e.target.value)} style={{ flex: 1 }} />
            <button className="btn btn-teal btn-sm" onClick={applyCustomRange} disabled={!customFrom || !customTo}>Go</button>
          </div>
        )}

        {loading ? (
          <>{[0,1,2,3].map(i => <SkeletonCard key={i} lines={2} />)}</>
        ) : data ? (
          <>
            {/* Summary cards */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 20 }}>
              <MetricCard label="Total Tasks" value={data.total} color="var(--teal)" />
              <MetricCard label="Completed" value={data.completed} color="var(--green)" />
              <MetricCard label="In Progress" value={data.inProgress} color="var(--blue)" />
              <MetricCard label="Completion Rate" value={`${data.completionRate}%`} color={data.completionRate >= 70 ? 'var(--green)' : data.completionRate >= 40 ? 'var(--amber)' : 'var(--red)'} />
            </div>

            {/* Per-staff table */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <h3 style={{ fontFamily: '"Inter", sans-serif', fontSize: 14, fontWeight: 600, color: 'var(--gray-900)', margin: 0 }}>Staff Performance</h3>
              {data.staffStats.length > 0 && (
                <button onClick={exportCSV} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: '1px solid #E0E0E0', borderRadius: 8, padding: '5px 12px', cursor: 'pointer', fontSize: 12, fontWeight: 600, color: 'var(--gray-600)' }}>
                  <Download size={13} /> Export CSV
                </button>
              )}
            </div>
            {data.staffStats.length === 0
              ? <p style={{ color: 'var(--gray-600)', fontSize: 13 }}>No staff data for this period.</p>
              : <div className="card" style={{ overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                    <thead>
                      <tr style={{ background: '#F5F5F5' }}>
                        {['Name', 'Assigned', 'Done', '%', 'Avg Time'].map(h => (
                          <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: 'var(--gray-600)', whiteSpace: 'nowrap' }}>{h}</th>
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
                          <td style={{ padding: '10px 12px', color: 'var(--gray-600)', display: 'flex', alignItems: 'center', gap: 4 }}>
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
    </div>
  )
}
