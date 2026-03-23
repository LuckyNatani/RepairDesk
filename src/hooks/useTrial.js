import { useMemo } from 'react'
import { differenceInDays, differenceInHours } from 'date-fns'

export function useTrial(business) {
  return useMemo(() => {
    if (!business) return { status: null, daysLeft: null, hoursLeft: null, isExpired: false, isActive: false }
    const status = business.account_status
    const trialEndsAt = business.trial_ends_at ? new Date(business.trial_ends_at) : null
    const now = new Date()
    const daysLeft = trialEndsAt ? differenceInDays(trialEndsAt, now) : null
    const hoursLeft = trialEndsAt ? differenceInHours(trialEndsAt, now) : null
    return {
      status,
      daysLeft,
      hoursLeft,
      isExpired: status === 'trial_expired',
      isActive: status === 'trial_active',
      isSuspended: status === 'suspended',
      isFullyActive: status === 'active',
      trialEndsAt,
    }
  }, [business])
}
