import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useSABusinesses } from '../../hooks/useSABusinesses'
import { LayoutDashboard, Building2, Settings, LogOut, ChevronLeft, ChevronRight } from 'lucide-react'

function SANav({ collapsed, setCollapsed, activePath }) {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const items = [
    { path: '/sa', label: 'Dashboard', Icon: LayoutDashboard },
  ]
  return (
    <div className={`sa-sidebar${collapsed ? ' collapsed' : ''}`}>
      {/* Logo */}
      <div style={{ padding: '20px 16px 16px', display: 'flex', alignItems: 'center', gap: 10, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <div style={{ width: 32, height: 32, background: 'rgba(255,255,255,0.2)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>
        </div>
        {!collapsed && <span style={{ fontFamily: '"Inter", sans-serif', fontWeight: 700, fontSize: 16, color: '#fff' }}>TaskPod SA</span>}
      </div>
      {/* Nav items */}
      <nav style={{ flex: 1, padding: '8px 0' }}>
        {items.map(({ path, label, Icon }) => (
          <button key={path} onClick={() => navigate(path)} className={`sa-nav-item${activePath === path ? ' active' : ''}`}>
            <Icon size={18} />
            {!collapsed && <span>{label}</span>}
          </button>
        ))}
      </nav>
      {/* Collapse + Logout */}
      <div style={{ padding: '8px 0', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        <button onClick={logout} className="sa-nav-item">
          <LogOut size={18} />
          {!collapsed && <span>Sign Out</span>}
        </button>
        <button onClick={() => setCollapsed(c => !c)} className="sa-nav-item" style={{ justifyContent: collapsed ? 'center' : undefined }}>
          {collapsed ? <ChevronRight size={18} /> : <><ChevronLeft size={18} /><span>Collapse</span></>}
        </button>
      </div>
    </div>
  )
}

export default function SALayout({ children }) {
  const [collapsed, setCollapsed] = useState(false)
  const location = useLocation()
  return (
    <div style={{ display: 'flex', minHeight: '100dvh' }}>
      <SANav collapsed={collapsed} setCollapsed={setCollapsed} activePath={location.pathname} />
      <div style={{ flex: 1, background: 'var(--grey-100)', overflowY: 'auto', minWidth: 0 }}>
        {children}
      </div>
    </div>
  )
}
