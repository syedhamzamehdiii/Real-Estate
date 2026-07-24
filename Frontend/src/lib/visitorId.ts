const VISITOR_KEY = 'estate-line-visitor-id'
const TRACKED_KEY = 'estate-line-lead-tracked'

function randomId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `v_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 12)}`
}

/** Stable anonymous visitor id for unique lead counting (local browser). */
export function getVisitorId(): string {
  try {
    const existing = localStorage.getItem(VISITOR_KEY)?.trim()
    if (existing && existing.length >= 8) return existing
    const next = randomId()
    localStorage.setItem(VISITOR_KEY, next)
    return next
  } catch {
    return randomId()
  }
}

export function hasTrackedLocally(channel: 'call' | 'whatsapp'): boolean {
  try {
    const raw = localStorage.getItem(TRACKED_KEY)
    if (!raw) return false
    const parsed = JSON.parse(raw) as Partial<Record<'call' | 'whatsapp', boolean>>
    return Boolean(parsed[channel])
  } catch {
    return false
  }
}

export function markTrackedLocally(channel: 'call' | 'whatsapp'): void {
  try {
    const raw = localStorage.getItem(TRACKED_KEY)
    const parsed = raw
      ? (JSON.parse(raw) as Partial<Record<'call' | 'whatsapp', boolean>>)
      : {}
    parsed[channel] = true
    localStorage.setItem(TRACKED_KEY, JSON.stringify(parsed))
  } catch {
    // ignore quota / private mode
  }
}
