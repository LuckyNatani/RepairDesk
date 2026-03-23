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
      {/* Logo */}
      <div style={{ padding: '24px 16px', display: 'flex', alignItems: 'center', gap: 10, borderBottom: '1px solid var(--gray-100)' }}>
        <Logo className="w-8 h-8" textClassName="text-xl font-bold" textColor="default" />
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
      <div style={{ padding: '8px 0', borderTop: '1px solid var(--gray-100)' }}>
        <button onClick={logout} className="sa-nav-item">
          <LogOut size={18} />
          {!collapsed && <span>Sign Out</span>}
        </button>
        <button onClick={() => setCollapsed(c => !c)} className="sa-nav-item" style={{ justifyContent: collapsed ? 'center' : undefined }}>
          {collapsed ? <ChevronRight size={18} /> : <><ChevronLeft size={18} /><span>Collapse Sidebar</span></>}
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
      <div style={{ flex: 1, background: 'var(--white)', overflowY: 'auto', minWidth: 0, borderLeft: '1px solid var(--gray-100)' }}>
        {children}
      </div>
    </div>
  )
}
