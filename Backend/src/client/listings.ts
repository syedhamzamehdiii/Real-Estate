import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  updateDoc,
  where,
  serverTimestamp,
  type Unsubscribe,
  type QueryConstraint,
} from 'firebase/firestore'
import { COLLECTIONS } from '../config/constants'
import type {
  Listing,
  ListingDocument,
  ListingFilters,
  ListingWriteOptions,
  PaginatedResult,
} from '../types/models'
import { DEFAULT_PAGE_SIZE } from '../types/models'
import { validateListingDraft, validateListingInput } from '../validation/listing'
import { ensureUniqueId, slugifyId } from '../utils/ids'
import { stripUndefined } from '../utils/firestore'
import { getCurrentUser } from './auth'
import { getDb } from './firebase'
import { persistListingImages } from './storage'
import {
  getListingsMeta,
  placeListingFeatured,
  commitListingMetaWrite,
  removeMainAreaIfUnused,
  syncMainAreasFromListings,
} from './meta'
import { resolveFeaturedItems, FEATURED_LISTING_LIMIT } from '../utils/featured'

function requireUid(): string {
  const user = getCurrentUser()
  if (!user) throw new Error('You must be signed in to modify listings.')
  return user.uid
}

function toPublicListing(data: ListingDocument | (Listing & Record<string, unknown>)): Listing {
  const listing: Listing = {
    id: String(data.id),
    title: String(data.title),
    location: String(data.location),
    locationKey: String(data.locationKey),
    type: data.type as Listing['type'],
    status: data.status as Listing['status'],
    priceLabel: String(data.priceLabel),
    priceValue: Number(data.priceValue),
    image: String(data.image),
    sizeLabel: String(data.sizeLabel),
    description: String(data.description),
  }
  if (Array.isArray(data.images) && data.images.length) listing.images = data.images as string[]
  if (typeof data.thumbnail === 'string' && data.thumbnail) listing.thumbnail = data.thumbnail
  if (Array.isArray(data.imageThumbnails) && data.imageThumbnails.length) {
    listing.imageThumbnails = data.imageThumbnails as string[]
  }
  if (data.beds != null) listing.beds = Number(data.beds)
  if (data.baths != null) listing.baths = Number(data.baths)
  if (data.featured != null) listing.featured = Boolean(data.featured)
  if (data.details && typeof data.details === 'object') {
    listing.details = data.details as Listing['details']
  }
  return listing
}

export async function listAllListings(): Promise<Listing[]> {
  const snap = await getDocs(
    query(collection(getDb(), COLLECTIONS.listings), orderBy('updatedAt', 'desc')),
  )
  return snap.docs.map((d) => toPublicListing({ id: d.id, ...d.data() } as ListingDocument))
}

export function subscribeListings(
  onData: (listings: Listing[]) => void,
  onError?: (error: Error) => void,
): Unsubscribe {
  const q = query(collection(getDb(), COLLECTIONS.listings), orderBy('updatedAt', 'desc'))
  return onSnapshot(
    q,
    (snap) => {
      onData(snap.docs.map((d) => toPublicListing({ id: d.id, ...d.data() } as ListingDocument)))
    },
    (err) => onError?.(err),
  )
}

export async function getListingById(id: string): Promise<Listing | null> {
  const snap = await getDoc(doc(getDb(), COLLECTIONS.listings, id))
  if (!snap.exists()) return null
  return toPublicListing({ id: snap.id, ...snap.data() } as ListingDocument)
}

export async function queryListings(
  filters: ListingFilters = {},
  pageSize = DEFAULT_PAGE_SIZE,
): Promise<PaginatedResult<Listing>> {
  const constraints: QueryConstraint[] = []

  if (filters.locationKey) {
    constraints.push(where('locationKey', '==', filters.locationKey))
  }
  if (filters.type) {
    constraints.push(where('type', '==', filters.type))
  }
  if (filters.status) {
    constraints.push(where('status', '==', filters.status))
  }
  if (filters.featured != null) {
    constraints.push(where('featured', '==', filters.featured))
  }

  // Prefer composite indexes when filtering by location + type + price
  if (filters.locationKey && filters.type) {
    constraints.push(orderBy('priceValue', 'asc'))
  } else {
    constraints.push(orderBy('updatedAt', 'desc'))
  }

  constraints.push(limit(pageSize + 1))

  const snap = await getDocs(query(collection(getDb(), COLLECTIONS.listings), ...constraints))
  let items = snap.docs.map((d) =>
    toPublicListing({ id: d.id, ...d.data() } as ListingDocument),
  )

  if (filters.minPrice != null) {
    items = items.filter((l) => l.priceValue >= filters.minPrice!)
  }
  if (filters.maxPrice != null && Number.isFinite(filters.maxPrice)) {
    items = items.filter((l) => l.priceValue <= filters.maxPrice!)
  }

  const hasMore = snap.docs.length > pageSize
  if (hasMore) items = items.slice(0, pageSize)

  return {
    items,
    hasMore,
    nextCursor: hasMore ? items[items.length - 1]?.id ?? null : null,
  }
}

export async function createListing(
  input: Omit<Listing, 'id'> & { id?: string },
  options?: ListingWriteOptions,
): Promise<Listing> {
  const uid = requireUid()
  const draft = validateListingDraft(input)
  const existing = await listAllListings()
  const desired = draft.id?.trim() || slugifyId(draft.title)
  const id = ensureUniqueId(
    desired,
    existing.map((l) => l.id),
  )

  const imagesPersisted = await persistListingImages(
    id,
    draft.image,
    draft.images ?? [],
    draft.thumbnail,
    draft.imageThumbnails ?? [],
  )

  const parsed = validateListingInput({
    ...draft,
    id,
    image: imagesPersisted.image,
    thumbnail: imagesPersisted.thumbnail,
    images: imagesPersisted.images.length ? imagesPersisted.images : undefined,
    imageThumbnails: imagesPersisted.imageThumbnails,
  })

  const wantFeatured = Boolean(parsed.featured)

  // Write the listing first so a meta-only success cannot leave orphan featured slots.
  const docData = stripUndefined({
    ...parsed,
    id,
    featured: wantFeatured,
    ownerId: uid,
    createdBy: uid,
    updatedBy: uid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })

  await setDoc(doc(getDb(), COLLECTIONS.listings, id), docData)

  let featuredOrder: string[]
  try {
    featuredOrder = await commitListingMetaWrite({
      listingId: id,
      featured: wantFeatured,
      replaceFeaturedId: options?.replaceFeaturedId,
      mainArea:
        options?.mainAreaLabel || parsed.location
          ? {
              value: parsed.locationKey,
              label: options?.mainAreaLabel || parsed.location,
            }
          : undefined,
    })
  } catch (err) {
    const meta = await getListingsMeta().catch(() => null)
    const actuallyFeatured = Boolean(meta?.featuredOrder.includes(id))
    if (actuallyFeatured !== wantFeatured) {
      await updateDoc(doc(getDb(), COLLECTIONS.listings, id), {
        featured: actuallyFeatured,
        updatedAt: serverTimestamp(),
      }).catch(() => undefined)
    }
    throw err
  }

  const featured = featuredOrder.includes(id)
  if (featured !== wantFeatured) {
    await updateDoc(doc(getDb(), COLLECTIONS.listings, id), {
      featured,
      updatedAt: serverTimestamp(),
    })
    docData.featured = featured
  }

  return toPublicListing(docData as ListingDocument)
}

export async function updateListing(
  id: string,
  input: Listing,
  options?: ListingWriteOptions,
): Promise<Listing> {
  const uid = requireUid()
  const draft = validateListingDraft({ ...input, id })
  const existingSnap = await getDoc(doc(getDb(), COLLECTIONS.listings, id))
  if (!existingSnap.exists()) throw new Error(`Listing "${id}" not found.`)

  const previousLocationKey =
    typeof existingSnap.data().locationKey === 'string'
      ? (existingSnap.data().locationKey as string)
      : undefined

  const imagesPersisted = await persistListingImages(
    id,
    draft.image,
    draft.images ?? [],
    draft.thumbnail,
    draft.imageThumbnails ?? [],
  )

  const parsed = validateListingInput({
    ...draft,
    id,
    image: imagesPersisted.image,
    thumbnail: imagesPersisted.thumbnail,
    images: imagesPersisted.images.length ? imagesPersisted.images : undefined,
    imageThumbnails: imagesPersisted.imageThumbnails,
  })

  const wantFeatured = Boolean(parsed.featured)
  const prev = existingSnap.data()
  const listingRef = doc(getDb(), COLLECTIONS.listings, id)

  const docData = stripUndefined({
    ...parsed,
    id,
    featured: wantFeatured,
    ownerId: prev.ownerId ?? uid,
    createdBy: prev.createdBy ?? uid,
    updatedBy: uid,
    createdAt: prev.createdAt ?? serverTimestamp(),
    updatedAt: serverTimestamp(),
  })

  await setDoc(listingRef, docData)

  let featuredOrder: string[]
  try {
    featuredOrder = await commitListingMetaWrite({
      listingId: id,
      featured: wantFeatured,
      replaceFeaturedId: options?.replaceFeaturedId,
      mainArea:
        options?.mainAreaLabel || parsed.location
          ? {
              value: parsed.locationKey,
              label: options?.mainAreaLabel || parsed.location,
            }
          : undefined,
    })
  } catch (err) {
    const meta = await getListingsMeta().catch(() => null)
    const actuallyFeatured = Boolean(meta?.featuredOrder.includes(id))
    if (actuallyFeatured !== wantFeatured) {
      await updateDoc(listingRef, {
        featured: actuallyFeatured,
        updatedAt: serverTimestamp(),
      }).catch(() => undefined)
    }
    throw err
  }

  const featured = featuredOrder.includes(id)
  if (featured !== wantFeatured) {
    await updateDoc(listingRef, {
      featured,
      updatedAt: serverTimestamp(),
    })
    docData.featured = featured
  }

  if (previousLocationKey && previousLocationKey !== parsed.locationKey) {
    const remaining = await listAllListings()
    await removeMainAreaIfUnused(
      previousLocationKey,
      remaining.map((l) => l.locationKey),
    )
  }

  return toPublicListing(docData as ListingDocument)
}

export async function deleteListing(id: string): Promise<void> {
  requireUid()
  await placeListingFeatured(id, false)
  await deleteDoc(doc(getDb(), COLLECTIONS.listings, id))

  const remaining = await listAllListings()
  await syncMainAreasFromListings(
    remaining.map((l) => ({ locationKey: l.locationKey, location: l.location })),
  )
}

/** Sync `featured` flags on listing docs to match meta.featuredOrder. */
export async function syncListingFeaturedFlags(): Promise<void> {
  const uid = requireUid()
  const meta = await getListingsMeta()
  const featuredSet = new Set(meta.featuredOrder)
  const listings = await listAllListings()
  await Promise.all(
    listings.map(async (listing) => {
      const should = featuredSet.has(listing.id)
      if (Boolean(listing.featured) === should) return
      await updateDoc(doc(getDb(), COLLECTIONS.listings, listing.id), {
        featured: should,
        updatedBy: uid,
        updatedAt: serverTimestamp(),
      })
    }),
  )
}

export async function getFeaturedListings(): Promise<Listing[]> {
  const [listings, meta] = await Promise.all([listAllListings(), getListingsMeta()])
  return resolveFeaturedItems(listings, meta.featuredOrder, FEATURED_LISTING_LIMIT)
}
