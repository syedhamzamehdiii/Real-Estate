/** ID / slug helpers shared by client services and seed scripts. */

export function slugifyId(title: string): string {
  const base =
    title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 48) || 'listing'
  return base
}

export function ensureUniqueId(desired: string, existingIds: string[]): string {
  if (!existingIds.includes(desired)) return desired
  let n = 2
  while (existingIds.includes(`${desired}-${n}`)) n += 1
  return `${desired}-${n}`
}

export function slugifyResource(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 72)
}

export function finalizeSlug(slug: string, title: string): string {
  return slugifyResource(slug) || slugifyResource(title) || 'resource'
}

export function ensureUniqueSlug(desired: string, existingSlugs: string[]): string {
  if (!existingSlugs.includes(desired)) return desired
  let n = 2
  while (existingSlugs.includes(`${desired}-${n}`)) n += 1
  return `${desired}-${n}`
}

export function randomFileId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}
