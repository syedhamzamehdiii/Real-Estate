import { ZodError } from 'zod'

/** Map form error keys → element ids to scroll/focus. */
export type FieldIdMap = Record<string, string>

/**
 * Scroll the first error into view (and focus it when possible).
 * Call after setState so the error UI is painted — uses rAF + short delay.
 */
export function scrollToFirstError(
  errors: Record<string, string | undefined | null>,
  fieldIds: FieldIdMap = {},
  preferredOrder: string[] = [],
) {
  const keys = [
    ...preferredOrder.filter((key) => errors[key]),
    ...Object.keys(errors).filter((key) => errors[key] && !preferredOrder.includes(key)),
  ]
  const firstKey = keys[0]
  if (!firstKey) return

  const targetId = fieldIds[firstKey] ?? firstKey

  window.requestAnimationFrame(() => {
    window.setTimeout(() => {
      const el = document.getElementById(targetId)
      if (!el) return
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      if (typeof (el as HTMLElement).focus === 'function') {
        try {
          ;(el as HTMLElement).focus({ preventScroll: true })
        } catch {
          // non-focusable wrappers are fine
        }
      }
    }, 50)
  })
}

/** Turn Zod / Storage / generic save failures into field → message map. */
export function mapSaveError(err: unknown): Record<string, string> {
  if (err instanceof ZodError) {
    const out: Record<string, string> = {}
    for (const issue of err.issues) {
      const raw = issue.path[0]
      const key =
        raw === 'images' ? 'image' : raw != null ? String(raw) : 'form'
      if (!out[key]) out[key] = issue.message
    }
    return Object.keys(out).length ? out : { form: 'Validation failed' }
  }

  const message = err instanceof Error ? err.message : 'Could not save'

  // Zod sometimes stringifies issues into Error.message
  const trimmed = message.trim()
  if (trimmed.startsWith('[')) {
    try {
      const parsed = JSON.parse(trimmed) as Array<{
        path?: (string | number)[]
        message?: string
      }>
      if (Array.isArray(parsed) && parsed[0]?.message) {
        const out: Record<string, string> = {}
        for (const issue of parsed) {
          const raw = issue.path?.[0]
          const key =
            raw === 'images' ? 'image' : raw != null ? String(raw) : 'form'
          if (issue.message && !out[key]) out[key] = issue.message
        }
        if (Object.keys(out).length) return out
      }
    } catch {
      // fall through
    }
  }

  if (/storage|upload|image|permission|unauthorized|network/i.test(message)) {
    return { image: message, upload: message }
  }

  return { form: message }
}
