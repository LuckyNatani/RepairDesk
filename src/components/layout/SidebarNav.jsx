import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { ChevronLeft, ChevronRight, LayoutDashboard, List, BarChart2, Users, CheckSquare, Bell, LogOut } from 'lucide-react'
import Logo from '../shared/Logo'
import { useState } from 'react'

export default function SidebarNav() {
  const [collapsed, setCollapsed] = useState(false)
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
    <div className={`main-sidebar${collapsed ? ' collapsed' : ''}`}>
      {/* Header with Logo + Toggle */}
      <div style={{ padding: '20px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <Logo className="w-8 h-8" textClassName={collapsed ? "hidden" : "text-xl font-bold"} textColor="white" />
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
          <button key={path} onClick={() => navigate(path)} className={`sa-nav-item ${(location.pathname === path || (path === '/tasks' && location.pathname.startsWith('/tasks/'))) ? ' active' : ''}`}>
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
