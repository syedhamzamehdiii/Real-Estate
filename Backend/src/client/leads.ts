import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  serverTimestamp,
  type Unsubscribe,
} from 'firebase/firestore'
import { COLLECTIONS } from '../config/constants'
import type { ContactLeadClick, LeadChannel, LeadClickStats } from '../types/models'
import { getCurrentUser } from './auth'
import { getDb } from './firebase'

export function leadClickDocId(visitorId: string, channel: LeadChannel): string {
  return `${visitorId}__${channel}`
}

function errorCode(err: unknown): string {
  if (typeof err === 'object' && err && 'code' in err) {
    return String((err as { code: string }).code)
  }
  return ''
}

/**
 * Record a unique call/WhatsApp click for a visitor.
 * Same visitor + channel is stored once (second click is a no-op).
 * Public — no auth required.
 * @returns true if the click is counted (new or already stored)
 */
export async function trackLeadClick(
  visitorId: string,
  channel: LeadChannel,
): Promise<boolean> {
  const id = visitorId.trim()
  if (id.length < 8 || id.length > 80) return false
  if (channel !== 'call' && channel !== 'whatsapp') return false

  const ref = doc(getDb(), COLLECTIONS.contactLeadClicks, leadClickDocId(id, channel))
  try {
    await setDoc(ref, {
      channel,
      visitorId: id,
      createdAt: serverTimestamp(),
    })
    return true
  } catch (err) {
    const code = errorCode(err)
    // Update is denied when the unique doc already exists
    if (code === 'permission-denied' || code === 'already-exists') return true
    return false
  }
}

function emptyStats(): LeadClickStats {
  return { callLeads: 0, whatsappLeads: 0 }
}

function tally(docs: ContactLeadClick[]): LeadClickStats {
  const stats = emptyStats()
  for (const item of docs) {
    if (item.channel === 'call') stats.callLeads += 1
    else if (item.channel === 'whatsapp') stats.whatsappLeads += 1
  }
  return stats
}

/** Live unique call / WhatsApp lead totals — admin only. */
export function subscribeLeadClickStats(
  onData: (stats: LeadClickStats) => void,
  onError?: (error: Error) => void,
): Unsubscribe {
  if (!getCurrentUser()) {
    onError?.(new Error('You must be signed in to view lead stats.'))
    return () => {}
  }

  return onSnapshot(
    collection(getDb(), COLLECTIONS.contactLeadClicks),
    (snap) => {
      const items = snap.docs.map(
        (d) => ({ id: d.id, ...d.data() }) as ContactLeadClick,
      )
      onData(tally(items))
    },
    (err) => onError?.(err),
  )
}
