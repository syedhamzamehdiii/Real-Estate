import type { DocumentData, QueryDocumentSnapshot, Timestamp } from 'firebase/firestore'

/** Convert Firestore Timestamp | Date | string → ISO date or leave string. */
export function toIsoDate(value: unknown): string | undefined {
  if (value == null) return undefined
  if (typeof value === 'string') return value
  if (value instanceof Date) return value.toISOString()
  if (typeof value === 'object' && value !== null && 'toDate' in value) {
    const ts = value as Timestamp
    return ts.toDate().toISOString()
  }
  return undefined
}

export function stripUndefined<T extends Record<string, unknown>>(obj: T): T {
  const out: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(obj)) {
    if (value === undefined) continue
    if (value !== null && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
      out[key] = stripUndefined(value as Record<string, unknown>)
    } else {
      out[key] = value
    }
  }
  return out as T
}

export function docToData<T extends DocumentData>(
  snap: QueryDocumentSnapshot<DocumentData>,
): T & { id: string } {
  return { id: snap.id, ...(snap.data() as T) }
}
