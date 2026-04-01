import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { LayoutDashboard, List, BarChart2, Users, CheckSquare } from 'lucide-react'

export default function BottomTabBar() {
  const { role } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  if (role === 'superadmin') return null

  const ownerTabs = [
    { path: '/', label: 'Dashboard', Icon: LayoutDashboard },
    { path: '/tasks', label: 'Tasks', Icon: List },
    { path: '/analytics', label: 'Analytics', Icon: BarChart2 },
    { path: '/admin', label: 'Admin', Icon: Users },
  ]

  const staffTabs = [
    { path: '/my-tasks', label: 'My Tasks', Icon: CheckSquare },
    { path: '/tasks', label: 'All Tasks', Icon: List },
  ]

  const tabs = role === 'owner' ? ownerTabs : staffTabs

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/'
    return location.pathname === path || location.pathname.startsWith(path + '/')
  }

  return (
    <nav className="bottom-tabs">
      {tabs.map(({ path, label, Icon }) => (
        <button
          key={path}
          onClick={() => navigate(path)}
          className={`bottom-tab${isActive(path) ? ' active' : ''}`}
          aria-label={label}
        >
          <Icon size={20} strokeWidth={isActive(path) ? 2.5 : 1.8} />
          <span>{label}</span>
        </button>
      ))}
    </nav>
  )
}
