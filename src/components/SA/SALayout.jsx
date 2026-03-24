import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useSABusinesses } from '../../hooks/useSABusinesses'
import { LayoutDashboard, Building2, Settings, LogOut, ChevronLeft, ChevronRight } from 'lucide-react'
import Logo from '../shared/Logo'

function SANav({ collapsed, setCollapsed, activePath }) {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const items = [
    { path: '/sa', label: 'Dashboard', Icon: LayoutDashboard },
  ]
  return (
    <div className={`sa-sidebar${collapsed ? ' collapsed' : ''}`}>
      {/* Header with Logo + Toggle */}
      <div style={{ padding: '20px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <Logo className={collapsed ? "w-8 h-8" : "w-8 h-8"} textClassName={collapsed ? "hidden" : "text-xl font-bold"} textColor="white" />
        <button 
          onClick={() => setCollapsed(c => !c)} 
          style={{ background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: 6, color: '#fff', cursor: 'pointer', padding: 4, display: 'flex' }}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
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
      {/* Logout */}
      <div style={{ padding: '8px 0', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <button onClick={logout} className="sa-nav-item">
          <LogOut size={18} />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </div>
  )
}

export default function SALayout({ children }) {
  const [collapsed, setCollapsed] = useState(false)
  const { logout } = useAuth()
  const location = useLocation()
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100dvh' }}>
      {/* Mobile Header (SA) */}
      <div className="app-bar border-b md:hidden" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px', background: '#fff' }}>
        <Logo className="w-8 h-8" textClassName="text-lg font-bold" />
        <button onClick={logout} className="mobile-logout">
          <LogOut size={20} />
        </button>
      </div>
      
      <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
        <SANav collapsed={collapsed} setCollapsed={setCollapsed} activePath={location.pathname} />
        <div style={{ flex: 1, background: 'var(--white)', overflowY: 'auto', minWidth: 0, borderLeft: '1px solid var(--gray-100)' }}>
          {children}
        </div>
      </div>
    </div>
  )
}
