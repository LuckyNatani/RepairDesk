import { useAuth } from '../hooks/useAuth'
import TaskSearch from '../components/Tasks/TaskSearch'
import OfflineBanner from '../components/shared/OfflineBanner'

export default function TasksListView() {
  const { businessId, profile } = useAuth()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100dvh - 56px - 64px)' }}>
      <OfflineBanner />
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <TaskSearch businessId={businessId} currentUserRole={profile?.role} />
      </div>
    </div>
  )
}
