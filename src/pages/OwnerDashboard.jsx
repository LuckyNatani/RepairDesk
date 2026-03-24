import { useEffect, useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabaseClient'
import KanbanBoard from '../components/Kanban/KanbanBoard'
import AccountBanner from '../components/Owner/AccountBanner'
import NotificationBell from '../components/Notifications/NotificationBell'
import FAB from '../components/shared/FAB'
import BottomSheet from '../components/shared/BottomSheet'
import NewTaskForm from '../components/Tasks/NewTaskForm'
import OfflineBanner from '../components/shared/OfflineBanner'
import Snackbar from '../components/shared/Snackbar'
import { useScrollDirection } from '../hooks/useScrollDirection'
import { useSnackbar } from '../hooks/useSnackbar'
import { LayoutDashboard, List, BarChart2, Users, LogOut } from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'

export default function OwnerDashboard() {
  const { profile, user, businessId, business, logout } = useAuth()
  const { snack, show } = useSnackbar()
  const scrollingDown = useScrollDirection()
  const [fabOpen, setFabOpen] = useState(false)
  const [staffList, setStaffList] = useState([])
  const [serviceTypes, setServiceTypes] = useState([])
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    if (!businessId) return
    supabase.from('users').select('id,name,phone,avatar_color,is_active').eq('business_id', businessId).eq('role', 'staff').eq('is_active', true).then(({ data }) => setStaffList(data || []))
    supabase.from('service_types').select('id,label,default_description').eq('business_id', businessId).order('sort_order').then(({ data }) => setServiceTypes(data || []))
  }, [businessId])

  const tabs = [
    { id: '/', label: 'Dashboard', Icon: LayoutDashboard },
    { id: '/tasks', label: 'Tasks', Icon: List },
    { id: '/analytics', label: 'Analytics', Icon: BarChart2 },
    { id: '/admin', label: 'Admin', Icon: Users },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100dvh' }}>
      {/* App Bar */}
      <div className="app-bar">
        <span className="app-bar-title">TaskPod</span>
        <div className="flex items-center gap-2">
          <NotificationBell userId={user?.id} />
          <button onClick={logout} className="mobile-logout" title="Sign Out">
            <LogOut size={20} />
          </button>
        </div>
      </div>

      <OfflineBanner />
      <AccountBanner business={business} />

      {/* Kanban */}
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <KanbanBoard businessId={businessId} staffList={staffList} />
      </div>

      {/* FAB */}
      <FAB onClick={() => setFabOpen(true)} visible={!scrollingDown} />

      {/* New Task Sheet */}
      <BottomSheet open={fabOpen} onClose={() => setFabOpen(false)} title="New Task">
        <NewTaskForm
          businessId={businessId}
          createdBy={user?.id}
          staffList={staffList}
          serviceTypes={serviceTypes}
          onSuccess={() => { setFabOpen(false); show('Task created!', 'success') }}
          onDismiss={() => setFabOpen(false)}
        />
      </BottomSheet>

      {/* Bottom Tab Bar */}
      <div className="bottom-tabs">
        {tabs.map(({ id, label, Icon }) => (
          <button key={id} className={`bottom-tab${location.pathname === id ? ' active' : ''}`} onClick={() => navigate(id)}>
            <Icon size={20} />
            <span>{label}</span>
          </button>
        ))}
      </div>

      <Snackbar open={snack.open} message={snack.message} type={snack.type} />
    </div>
  )
}
