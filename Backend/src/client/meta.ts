import {
  doc,
  getDoc,
  onSnapshot,
  runTransaction,
  setDoc,
  type Unsubscribe,
} from 'firebase/firestore'
import { COLLECTIONS, META_DOCS, BUILTIN_MAIN_AREA_VALUES } from '../config/constants'
import type { ListingsMeta, MainArea, ResourcesMeta } from '../types/models'
import {
  FEATURED_LISTING_LIMIT,
  FEATURED_RESOURCE_LIMIT,
} from '../types/models'
import {
  applyFeaturedPlacement,
  removeFromFeaturedOrder,
} from '../utils/featured'
import { getDb } from './firebase'
import { serverTimestamp } from 'firebase/firestore'

const emptyListingsMeta = (): ListingsMeta => ({
  featuredOrder: [],
  mainAreas: [],
})

const emptyResourcesMeta = (): ResourcesMeta => ({
  featuredOrder: [],
  nextNumericId: 1,
})

function listingsMetaRef() {
  return doc(getDb(), COLLECTIONS.meta, META_DOCS.listings)
}

function resourcesMetaRef() {
  return doc(getDb(), COLLECTIONS.meta, META_DOCS.resources)
}

function parseListingsMeta(data: Partial<ListingsMeta> | undefined): ListingsMeta {
  return {
    featuredOrder: Array.isArray(data?.featuredOrder)
      ? data!.featuredOrder.slice(0, FEATURED_LISTING_LIMIT)
      : [],
    mainAreas: Array.isArray(data?.mainAreas) ? data!.mainAreas : [],
  }
}

function parseResourcesMeta(data: Partial<ResourcesMeta> | undefined): ResourcesMeta {
  return {
    featuredOrder: Array.isArray(data?.featuredOrder)
      ? data!.featuredOrder.slice(0, FEATURED_RESOURCE_LIMIT)
      : [],
    nextNumericId:
      typeof data?.nextNumericId === 'number' && data.nextNumericId >= 1
        ? data.nextNumericId
        : 1,
  }
}

function sanitizeMainAreas(areas: MainArea[]): MainArea[] {
  return areas
    .filter((a) => a && typeof a.value === 'string' && a.value.trim())
    .map((a) => ({
      value: a.value.trim(),
      label: (a.label || a.value).trim(),
    }))
    .slice(0, 200)
}

export async function getListingsMeta(): Promise<ListingsMeta> {
  const snap = await getDoc(listingsMetaRef())
  if (!snap.exists()) return emptyListingsMeta()
  return parseListingsMeta(snap.data() as Partial<ListingsMeta>)
}

export async function getResourcesMeta(): Promise<ResourcesMeta> {
  const snap = await getDoc(resourcesMetaRef())
  if (!snap.exists()) return emptyResourcesMeta()
  return parseResourcesMeta(snap.data() as Partial<ResourcesMeta>)
}

/**
 * Full replace (no merge) so security rules `keys().hasOnly(...)` stay valid
 * even if an older doc had extra fields.
 */
export async function saveListingsMeta(meta: ListingsMeta): Promise<void> {
  await setDoc(listingsMetaRef(), {
    featuredOrder: meta.featuredOrder.slice(0, FEATURED_LISTING_LIMIT),
    mainAreas: sanitizeMainAreas(meta.mainAreas),
    updatedAt: serverTimestamp(),
  })
}

export async function saveResourcesMeta(meta: ResourcesMeta): Promise<void> {
  await setDoc(resourcesMetaRef(), {
    featuredOrder: meta.featuredOrder.slice(0, FEATURED_RESOURCE_LIMIT),
    nextNumericId: meta.nextNumericId,
    updatedAt: serverTimestamp(),
  })
}

async function mutateListingsMeta(
  mutator: (current: ListingsMeta) => ListingsMeta,
): Promise<ListingsMeta> {
  const ref = listingsMetaRef()
  return runTransaction(getDb(), async (tx) => {
    const snap = await tx.get(ref)
    const current = snap.exists()
      ? parseListingsMeta(snap.data() as Partial<ListingsMeta>)
      : emptyListingsMeta()
    const next = mutator(current)
    const payload = {
      featuredOrder: next.featuredOrder.slice(0, FEATURED_LISTING_LIMIT),
      mainAreas: sanitizeMainAreas(next.mainAreas),
      updatedAt: serverTimestamp(),
    }
    tx.set(ref, payload)
    return {
      featuredOrder: payload.featuredOrder,
      mainAreas: payload.mainAreas,
    }
  })
}

async function mutateResourcesMeta(
  mutator: (current: ResourcesMeta) => ResourcesMeta,
): Promise<ResourcesMeta> {
  const ref = resourcesMetaRef()
  return runTransaction(getDb(), async (tx) => {
    const snap = await tx.get(ref)
    const current = snap.exists()
      ? parseResourcesMeta(snap.data() as Partial<ResourcesMeta>)
      : emptyResourcesMeta()
    const next = mutator(current)
    const payload = {
      featuredOrder: next.featuredOrder.slice(0, FEATURED_RESOURCE_LIMIT),
      nextNumericId: next.nextNumericId,
      updatedAt: serverTimestamp(),
    }
    tx.set(ref, payload)
    return {
      featuredOrder: payload.featuredOrder,
      nextNumericId: payload.nextNumericId,
    }
  })
}

export function subscribeListingsMeta(
  onData: (meta: ListingsMeta) => void,
  onError?: (error: Error) => void,
): Unsubscribe {
  return onSnapshot(
    listingsMetaRef(),
    (snap) => {
      if (!snap.exists()) {
        onData(emptyListingsMeta())
        return
      }
      onData(parseListingsMeta(snap.data() as Partial<ListingsMeta>))
    },
    (err) => onError?.(err),
  )
}

export function subscribeResourcesMeta(
  onData: (meta: ResourcesMeta) => void,
  onError?: (error: Error) => void,
): Unsubscribe {
  return onSnapshot(
    resourcesMetaRef(),
    (snap) => {
      if (!snap.exists()) {
        onData(emptyResourcesMeta())
        return
      }
      onData(parseResourcesMeta(snap.data() as Partial<ResourcesMeta>))
    },
    (err) => onError?.(err),
  )
}

function withUpsertedMainArea(meta: ListingsMeta, value: string, label: string): ListingsMeta {
  if (!value) return meta
  if ((BUILTIN_MAIN_AREA_VALUES as readonly string[]).includes(value)) return meta
  const existing = meta.mainAreas.find((a) => a.value === value)
  const mainAreas = existing
    ? meta.mainAreas.map((a) => (a.value === value ? { value, label: label || a.label } : a))
    : [...meta.mainAreas, { value, label: label || value }]
  return { ...meta, mainAreas }
}

export async function upsertMainArea(value: string, label: string): Promise<MainArea[]> {
  if (!value) return (await getListingsMeta()).mainAreas
  if ((BUILTIN_MAIN_AREA_VALUES as readonly string[]).includes(value)) {
    return (await getListingsMeta()).mainAreas
  }
  const next = await mutateListingsMeta((meta) => withUpsertedMainArea(meta, value, label))
  return next.mainAreas
}

/** Drop a custom main area from meta when no listings still use it. */
export async function removeMainAreaIfUnused(
  locationKey: string,
  remainingLocationKeys: string[],
): Promise<MainArea[]> {
  if (!locationKey) return (await getListingsMeta()).mainAreas
  if ((BUILTIN_MAIN_AREA_VALUES as readonly string[]).includes(locationKey)) {
    return (await getListingsMeta()).mainAreas
  }
  if (remainingLocationKeys.includes(locationKey)) {
    return (await getListingsMeta()).mainAreas
  }

  const next = await mutateListingsMeta((meta) => {
    if (!meta.mainAreas.some((a) => a.value === locationKey)) return meta
    return {
      ...meta,
      mainAreas: meta.mainAreas.filter((a) => a.value !== locationKey),
    }
  })
  return next.mainAreas
}

/**
 * Rebuild custom mainAreas from listings that actually exist.
 * Removes orphaned places left behind by failed creates / old deletes.
 */
export async function syncMainAreasFromListings(
  listings: { locationKey: string; location: string }[],
): Promise<MainArea[]> {
  const usedKeys = new Set(listings.map((l) => l.locationKey).filter(Boolean))

  const next = await mutateListingsMeta((meta) => {
    const byKey = new Map<string, string>()
    for (const area of meta.mainAreas) {
      if (!area.value) continue
      if ((BUILTIN_MAIN_AREA_VALUES as readonly string[]).includes(area.value)) continue
      if (!usedKeys.has(area.value)) continue
      byKey.set(area.value, area.label || area.value)
    }

    for (const listing of listings) {
      if (!listing.locationKey) continue
      if ((BUILTIN_MAIN_AREA_VALUES as readonly string[]).includes(listing.locationKey)) {
        continue
      }
      if (!byKey.has(listing.locationKey)) {
        byKey.set(listing.locationKey, listing.location || listing.locationKey)
      }
    }

    const mainAreas = Array.from(byKey.entries()).map(([value, label]) => ({
      value,
      label,
    }))

    const unchanged =
      mainAreas.length === meta.mainAreas.length &&
      mainAreas.every((a) =>
        meta.mainAreas.some((b) => b.value === a.value && b.label === a.label),
      )

    return unchanged ? meta : { ...meta, mainAreas }
  })

  return next.mainAreas
}

export async function placeListingFeatured(
  listingId: string,
  featured: boolean,
  replaceFeaturedId?: string,
): Promise<string[]> {
  const next = await mutateListingsMeta((meta) => {
    const featuredOrder = featured
      ? applyFeaturedPlacement(
          meta.featuredOrder,
          listingId,
          FEATURED_LISTING_LIMIT,
          replaceFeaturedId,
        )
      : removeFromFeaturedOrder(meta.featuredOrder, listingId)
    return { ...meta, featuredOrder }
  })
  return next.featuredOrder
}

/**
 * One atomic meta write: featured slots + optional main-area upsert.
 * Avoids races that caused permission-denied / lost featured slots.
 */
export async function commitListingMetaWrite(options: {
  listingId: string
  featured: boolean
  replaceFeaturedId?: string
  mainArea?: { value: string; label: string }
}): Promise<string[]> {
  const next = await mutateListingsMeta((meta) => {
    let current = meta
    if (options.mainArea?.value) {
      current = withUpsertedMainArea(current, options.mainArea.value, options.mainArea.label)
    }
    const featuredOrder = options.featured
      ? applyFeaturedPlacement(
          current.featuredOrder,
          options.listingId,
          FEATURED_LISTING_LIMIT,
          options.replaceFeaturedId,
        )
      : removeFromFeaturedOrder(current.featuredOrder, options.listingId)
    return { ...current, featuredOrder }
  })
  return next.featuredOrder
}

export async function placeResourceFeatured(
  resourceId: string,
  featured: boolean,
  replaceFeaturedId?: string,
): Promise<string[]> {
  const next = await mutateResourcesMeta((meta) => {
    const featuredOrder = featured
      ? applyFeaturedPlacement(
          meta.featuredOrder,
          resourceId,
          FEATURED_RESOURCE_LIMIT,
          replaceFeaturedId,
        )
      : removeFromFeaturedOrder(meta.featuredOrder, resourceId)
    return { ...meta, featuredOrder }
  })
  return next.featuredOrder
}

/** Atomically allocate the next numeric resource id. */
export async function allocateResourceId(): Promise<string> {
  let allocated = '1'
  await mutateResourcesMeta((meta) => {
    allocated = String(meta.nextNumericId)
    return {
      ...meta,
      nextNumericId: meta.nextNumericId + 1,
    }
  })
  return allocated
}
