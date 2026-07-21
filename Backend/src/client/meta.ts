import {
  doc,
  getDoc,
  onSnapshot,
  setDoc,
  type Unsubscribe,
} from 'firebase/firestore'
import { COLLECTIONS, META_DOCS } from '../config/constants'
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

export async function getListingsMeta(): Promise<ListingsMeta> {
  const snap = await getDoc(listingsMetaRef())
  if (!snap.exists()) return emptyListingsMeta()
  const data = snap.data() as Partial<ListingsMeta>
  return {
    featuredOrder: Array.isArray(data.featuredOrder)
      ? data.featuredOrder.slice(0, FEATURED_LISTING_LIMIT)
      : [],
    mainAreas: Array.isArray(data.mainAreas) ? data.mainAreas : [],
  }
}

export async function getResourcesMeta(): Promise<ResourcesMeta> {
  const snap = await getDoc(resourcesMetaRef())
  if (!snap.exists()) return emptyResourcesMeta()
  const data = snap.data() as Partial<ResourcesMeta>
  return {
    featuredOrder: Array.isArray(data.featuredOrder)
      ? data.featuredOrder.slice(0, FEATURED_RESOURCE_LIMIT)
      : [],
    nextNumericId:
      typeof data.nextNumericId === 'number' && data.nextNumericId >= 1
        ? data.nextNumericId
        : 1,
  }
}

export async function saveListingsMeta(meta: ListingsMeta): Promise<void> {
  await setDoc(
    listingsMetaRef(),
    {
      featuredOrder: meta.featuredOrder.slice(0, FEATURED_LISTING_LIMIT),
      mainAreas: meta.mainAreas,
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  )
}

export async function saveResourcesMeta(meta: ResourcesMeta): Promise<void> {
  await setDoc(
    resourcesMetaRef(),
    {
      featuredOrder: meta.featuredOrder.slice(0, FEATURED_RESOURCE_LIMIT),
      nextNumericId: meta.nextNumericId,
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  )
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
      const data = snap.data() as Partial<ListingsMeta>
      onData({
        featuredOrder: Array.isArray(data.featuredOrder)
          ? data.featuredOrder.slice(0, FEATURED_LISTING_LIMIT)
          : [],
        mainAreas: Array.isArray(data.mainAreas) ? data.mainAreas : [],
      })
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
      const data = snap.data() as Partial<ResourcesMeta>
      onData({
        featuredOrder: Array.isArray(data.featuredOrder)
          ? data.featuredOrder.slice(0, FEATURED_RESOURCE_LIMIT)
          : [],
        nextNumericId:
          typeof data.nextNumericId === 'number' && data.nextNumericId >= 1
            ? data.nextNumericId
            : 1,
      })
    },
    (err) => onError?.(err),
  )
}

export async function upsertMainArea(
  value: string,
  label: string,
): Promise<MainArea[]> {
  const meta = await getListingsMeta()
  if (!value) return meta.mainAreas
  const existing = meta.mainAreas.find((a) => a.value === value)
  const mainAreas = existing
    ? meta.mainAreas.map((a) => (a.value === value ? { value, label: label || a.label } : a))
    : [...meta.mainAreas, { value, label: label || value }]
  await saveListingsMeta({ ...meta, mainAreas })
  return mainAreas
}

export async function placeListingFeatured(
  listingId: string,
  featured: boolean,
  replaceFeaturedId?: string,
): Promise<string[]> {
  const meta = await getListingsMeta()
  const featuredOrder = featured
    ? applyFeaturedPlacement(
        meta.featuredOrder,
        listingId,
        FEATURED_LISTING_LIMIT,
        replaceFeaturedId,
      )
    : removeFromFeaturedOrder(meta.featuredOrder, listingId)
  await saveListingsMeta({ ...meta, featuredOrder })
  return featuredOrder
}

export async function placeResourceFeatured(
  resourceId: string,
  featured: boolean,
  replaceFeaturedId?: string,
): Promise<string[]> {
  const meta = await getResourcesMeta()
  const featuredOrder = featured
    ? applyFeaturedPlacement(
        meta.featuredOrder,
        resourceId,
        FEATURED_RESOURCE_LIMIT,
        replaceFeaturedId,
      )
    : removeFromFeaturedOrder(meta.featuredOrder, resourceId)
  await saveResourcesMeta({ ...meta, featuredOrder })
  return featuredOrder
}

/** Atomically allocate the next numeric resource id. */
export async function allocateResourceId(): Promise<string> {
  const meta = await getResourcesMeta()
  const id = String(meta.nextNumericId)
  await saveResourcesMeta({ ...meta, nextNumericId: meta.nextNumericId + 1 })
  return id
}
