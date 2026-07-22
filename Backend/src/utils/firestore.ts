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

/**
 * Firestore FieldValue sentinels (serverTimestamp, deleteField, etc.) are plain
 * objects with `_methodName`. Recursing into them destroys the sentinel and
 * causes security-rules `is timestamp` checks to fail with permission-denied.
 */
function isFirestoreSentinel(value: unknown): boolean {
  return (
    value !== null &&
    typeof value === 'object' &&
    '_methodName' in (value as Record<string, unknown>)
  )
}

function isPlainDataObject(value: unknown): value is Record<string, unknown> {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) return false
  if (value instanceof Date) return false
  if (isFirestoreSentinel(value)) return false
  // Firestore Timestamp instances
  if (typeof (value as { toDate?: unknown }).toDate === 'function') return false
  const proto = Object.getPrototypeOf(value)
  return proto === Object.prototype || proto === null
}

/**
 * Drop `undefined` and empty-string fields before setDoc.
 * Preserves FieldValue sentinels and Timestamps.
 */
export function stripUndefined<T extends Record<string, unknown>>(obj: T): T {
  const out: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(obj)) {
    if (value === undefined || value === '') continue
    if (isPlainDataObject(value)) {
      out[key] = stripUndefined(value)
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
