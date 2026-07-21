import {
  FEATURED_LISTING_LIMIT,
  FEATURED_RESOURCE_LIMIT,
} from '../types/models'

/**
 * Place `newId` into an ordered featured slot list.
 * Mirrors Frontend listingsStorage / resourcesStorage semantics.
 */
export function applyFeaturedPlacement(
  order: string[],
  newId: string,
  limit: number,
  replaceId?: string,
): string[] {
  let next = order.filter((id) => id !== newId)

  if (replaceId) {
    const idx = next.indexOf(replaceId)
    if (idx >= 0) {
      next[idx] = newId
    } else if (next.length < limit) {
      next.push(newId)
    } else {
      next[limit - 1] = newId
    }
  } else if (next.length < limit) {
    next.push(newId)
  }

  return next.slice(0, limit)
}

export function removeFromFeaturedOrder(order: string[], id: string): string[] {
  return order.filter((fid) => fid !== id)
}

export function resolveFeaturedItems<T extends { id: string; featured?: boolean }>(
  items: T[],
  featuredOrder: string[],
  limit: number,
): T[] {
  const byId = new Map(items.map((item) => [item.id, item]))
  const ordered: T[] = []
  for (const id of featuredOrder) {
    const item = byId.get(id)
    if (item) ordered.push(item)
  }
  if (ordered.length) return ordered.slice(0, limit)
  return items.filter((item) => item.featured).slice(0, limit)
}

export { FEATURED_LISTING_LIMIT, FEATURED_RESOURCE_LIMIT }
