import { useEffect, useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabaseClient'
import KanbanBoard from '../components/Kanban/KanbanBoard'
import AccountBanner from '../components/Owner/AccountBanner'
import FAB from '../components/shared/FAB'
import BottomSheet from '../components/shared/BottomSheet'
import NewTaskForm from '../components/Tasks/NewTaskForm'
import OfflineBanner from '../components/shared/OfflineBanner'
import Snackbar from '../components/shared/Snackbar'
import { useScrollDirection } from '../hooks/useScrollDirection'
import { useSnackbar } from '../hooks/useSnackbar'

export default function OwnerDashboard() {
  const { user, businessId, business } = useAuth()
  const { snack, show } = useSnackbar()
  const scrollingDown = useScrollDirection()
  const [fabOpen, setFabOpen] = useState(false)
  const [staffList, setStaffList] = useState([])
  const [serviceTypes, setServiceTypes] = useState([])

  useEffect(() => {
    if (!businessId) return
    // Fetch staff with workload (PRD §1.2: "Amit (2 active)")
    const loadStaff = async () => {
      const { data } = await supabase.from('users').select('id,name,phone,avatar_color,is_active,last_seen_at').eq('business_id', businessId).eq('role', 'staff').eq('is_active', true)
      if (!data) { setStaffList([]); return }
      const { data: taskCounts } = await supabase.from('tasks').select('assigned_to').eq('business_id', businessId).eq('status', 'in_progress')
      const countMap = {}
      taskCounts?.forEach(t => { if (t.assigned_to) countMap[t.assigned_to] = (countMap[t.assigned_to] || 0) + 1 })
      setStaffList(data.map(s => ({ ...s, activeTasks: countMap[s.id] || 0 })))
    }
    loadStaff()
    supabase.from('service_types').select('id,label,default_description').eq('business_id', businessId).order('sort_order').then(({ data }) => setServiceTypes(data || []))
  }, [businessId])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100dvh - 56px - 64px)' }}>
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

      <Snackbar open={snack.open} message={snack.message} type={snack.type} />
    </div>
  )
}
