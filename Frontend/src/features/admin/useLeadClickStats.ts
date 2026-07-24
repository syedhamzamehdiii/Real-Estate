import { useEffect, useState } from 'react'
import {
  subscribeLeadClickStats,
  type LeadClickStats,
} from '@estate-line/backend/client'
import { firebaseReady } from '../../firebase/config'

const empty: LeadClickStats = { callLeads: 0, whatsappLeads: 0 }

export function useLeadClickStats() {
  const [stats, setStats] = useState<LeadClickStats>(empty)

  useEffect(() => {
    if (!firebaseReady) return
    return subscribeLeadClickStats(
      setStats,
      () => setStats(empty),
    )
  }, [])

  return stats
}
