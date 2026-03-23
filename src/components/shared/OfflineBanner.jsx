import { WifiOff } from 'lucide-react'
import { useOnlineStatus } from '../../hooks/useOnlineStatus'

export default function OfflineBanner() {
  const isOnline = useOnlineStatus()
  if (isOnline) return null
  return (
    <div className="offline-banner">
      <WifiOff size={14} />
      <span>You're offline — changes will sync when reconnected.</span>
    </div>
  )
}
