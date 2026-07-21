import type { Listing } from '../types'
import { SEED_LISTINGS } from '../data/listings'
import { MAIN_AREAS } from '../data/site'
import type { MainArea } from './mainAreas'
import { upsertMainArea } from './mainAreas'

const STORAGE_KEY = 'estate-line-admin-listings-v1'
export const FEATURED_SLOT_LIMIT = 3

export type ListingsStoreState = {
  /** User-created listings */
  added: Listing[]
  /** Full replacements for any listing id (seed or custom) */
  updated: Record<string, Listing>
  /** Soft-deleted ids */
  removed: string[]
  /** Custom main areas (beyond built-in) — appear in public filters */
  mainAreas: MainArea[]
  /** Homepage featured order (max 3). New featured items replace a slot in-place. */
  featuredOrder: string[]
}

const emptyState = (): ListingsStoreState => ({
  added: [],
  updated: {},
  removed: [],
  mainAreas: [],
  featuredOrder: SEED_LISTINGS.filter((l) => l.featured)
    .map((l) => l.id)
    .slice(0, FEATURED_SLOT_LIMIT),
})

export function loadListingsStore(): ListingsStoreState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return emptyState()
    const parsed = JSON.parse(raw) as Partial<ListingsStoreState>
    const base = emptyState()
    return {
      added: Array.isArray(parsed.added) ? parsed.added : [],
      updated: parsed.updated && typeof parsed.updated === 'object' ? parsed.updated : {},
      removed: Array.isArray(parsed.removed) ? parsed.removed : [],
      mainAreas: Array.isArray(parsed.mainAreas) ? parsed.mainAreas : [],
      featuredOrder: Array.isArray(parsed.featuredOrder)
        ? parsed.featuredOrder.slice(0, FEATURED_SLOT_LIMIT)
        : base.featuredOrder,
    }
  } catch {
    return emptyState()
  }
}

export function saveListingsStore(state: ListingsStoreState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

export function mergeListings(state: ListingsStoreState): Listing[] {
  const seedIds = new Set(SEED_LISTINGS.map((l) => l.id))
  const fromSeed = SEED_LISTINGS.filter((l) => !state.removed.includes(l.id)).map(
    (l) => state.updated[l.id] ?? l,
  )
  const fromAdded = state.added
    .filter((l) => !state.removed.includes(l.id) && !seedIds.has(l.id))
    .map((l) => state.updated[l.id] ?? l)
  return [...fromSeed, ...fromAdded]
}

function writeListing(state: ListingsStoreState, listing: Listing): ListingsStoreState {
  const isAdded = state.added.some((l) => l.id === listing.id)
  return {
    ...state,
    added: isAdded
      ? state.added.map((l) => (l.id === listing.id ? listing : l))
      : state.added,
    updated: { ...state.updated, [listing.id]: listing },
  }
}

/** Sync featured flags from featuredOrder onto listing records. */
export function syncFeaturedFlags(state: ListingsStoreState): ListingsStoreState {
  const order = state.featuredOrder.slice(0, FEATURED_SLOT_LIMIT)
  const featuredSet = new Set(order)
  let next = { ...state, featuredOrder: order }

  for (const listing of mergeListings(next)) {
    const shouldFeature = featuredSet.has(listing.id)
    if (Boolean(listing.featured) !== shouldFeature) {
      next = writeListing(next, { ...listing, featured: shouldFeature })
    }
  }
  return next
}

/**
 * Place `newId` on the homepage.
 * - If `replaceId` is set, swap into that slot.
 * - Else append if a free slot exists.
 */
export function applyFeaturedPlacement(
  state: ListingsStoreState,
  newId: string,
  replaceId?: string,
): ListingsStoreState {
  let order = [...state.featuredOrder].filter((id) => id !== newId)

  if (replaceId) {
    const idx = order.indexOf(replaceId)
    if (idx >= 0) {
      order[idx] = newId
    } else if (order.length < FEATURED_SLOT_LIMIT) {
      order.push(newId)
    } else {
      order[FEATURED_SLOT_LIMIT - 1] = newId
    }
  } else if (order.length < FEATURED_SLOT_LIMIT) {
    order.push(newId)
  } else {
    return syncFeaturedFlags({ ...state, featuredOrder: order })
  }

  order = order.slice(0, FEATURED_SLOT_LIMIT)
  return syncFeaturedFlags({ ...state, featuredOrder: order })
}

export function removeFromFeaturedOrder(
  state: ListingsStoreState,
  id: string,
): ListingsStoreState {
  if (!state.featuredOrder.includes(id)) return state
  return syncFeaturedFlags({
    ...state,
    featuredOrder: state.featuredOrder.filter((fid) => fid !== id),
  })
}

/** Register a main area so filters pick it up (skips built-in values). */
export function withRegisteredMainArea(
  state: ListingsStoreState,
  value: string,
  label: string,
): ListingsStoreState {
  if (!value) return state
  if (MAIN_AREAS.some((a) => a.value === value)) return state
  return {
    ...state,
    mainAreas: upsertMainArea(state.mainAreas, value, label),
  }
}

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

export function resolveFeaturedListings(
  listings: Listing[],
  featuredOrder: string[],
): Listing[] {
  const byId = new Map(listings.map((l) => [l.id, l]))
  const ordered: Listing[] = []
  for (const id of featuredOrder) {
    const listing = byId.get(id)
    if (listing) ordered.push(listing)
  }
  if (ordered.length) return ordered.slice(0, FEATURED_SLOT_LIMIT)

  return listings.filter((l) => l.featured).slice(0, FEATURED_SLOT_LIMIT)
}
