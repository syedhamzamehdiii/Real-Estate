import { trackLeadClick, type LeadChannel } from '@estate-line/backend/client'
import { firebaseReady } from '../firebase/config'
import {
  getVisitorId,
  hasTrackedLocally,
  markTrackedLocally,
} from './visitorId'

/**
 * Count a call or WhatsApp click once per browser visitor.
 * Safe to call from onClick — never blocks navigation.
 */
export function recordLeadClick(channel: LeadChannel): void {
  if (hasTrackedLocally(channel)) return
  if (!firebaseReady) return

  const visitorId = getVisitorId()
  void trackLeadClick(visitorId, channel).then((counted) => {
    if (counted) markTrackedLocally(channel)
  })
}

export function onCallLeadClick(): void {
  recordLeadClick('call')
}

export function onWhatsAppLeadClick(): void {
  recordLeadClick('whatsapp')
}
