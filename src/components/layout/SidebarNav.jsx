import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { LayoutDashboard, List, BarChart2, Users, CheckSquare, Bell, LogOut } from 'lucide-react'

export default function SidebarNav() {
  const { role, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  if (role === 'superadmin') return null;

  let items = []
  if (role === 'owner') {
    items = [
      { path: '/', label: 'Dashboard', Icon: LayoutDashboard },
      { path: '/tasks', label: 'Tasks', Icon: List },
      { path: '/analytics', label: 'Analytics', Icon: BarChart2 },
      { path: '/admin', label: 'Admin', Icon: Users },
      { path: '/notifications', label: 'Notifications', Icon: Bell },
    ]
  } else if (role === 'staff') {
    items = [
      { path: '/my-tasks', label: 'My Tasks', Icon: CheckSquare },
      { path: '/tasks', label: 'All Tasks', Icon: List },
      { path: '/notifications', label: 'Notifications', Icon: Bell },
    ]
  }

  return (
    <div className="main-sidebar">
      {/* Logo */}
      <div style={{ padding: '20px 16px 16px', display: 'flex', alignItems: 'center', gap: 10, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ width: 32, height: 32, background: 'rgba(255,255,255,0.2)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>
        </div>
        <span style={{ fontFamily: '"Inter", sans-serif', fontWeight: 700, fontSize: 16, color: '#fff' }}>TaskPod</span>
      </div>
      {/* Nav items */}
      <nav style={{ flex: 1, padding: '8px 0' }}>
        {items.map(({ path, label, Icon }) => (
          <button key={path} onClick={() => navigate(path)} className={`sa-nav-item ${(location.pathname === path || (path === '/tasks' && location.pathname.startsWith('/tasks/'))) ? ' active' : ''}`}>
            <Icon size={18} />
            <span>{label}</span>
          </button>
        ))}
      </nav>
      {/* Logout */}
      <div style={{ padding: '8px 0', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <button onClick={logout} className="sa-nav-item">
          <LogOut size={18} />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  )
}
