import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { Listing } from '../types'
import { SEED_LISTINGS } from '../data/listings'
import { collectMainAreas, type MainArea } from '../lib/mainAreas'
import {
  applyFeaturedPlacement,
  ensureUniqueId,
  FEATURED_SLOT_LIMIT,
  loadListingsStore,
  mergeListings,
  removeFromFeaturedOrder,
  resolveFeaturedListings,
  saveListingsStore,
  slugifyId,
  withRegisteredMainArea,
  type ListingsStoreState,
} from '../lib/listingsStorage'
import { firebaseReady } from '../firebase/config'
import {
  createListing as fbCreateListing,
  updateListing as fbUpdateListing,
  deleteListing as fbDeleteListing,
  subscribeListings,
  subscribeListingsMeta,
  type ListingsMeta,
} from '@estate-line/backend/client'
import { resolveFeaturedItems } from '@estate-line/backend'

type ListingWriteOptions = {
  mainAreaLabel?: string
  replaceFeaturedId?: string
}

type ListingsContextValue = {
  listings: Listing[]
  featuredListings: Listing[]
  mainAreas: MainArea[]
  ready: boolean
  getById: (id: string) => Listing | undefined
  addListing: (
    input: Omit<Listing, 'id'> & { id?: string },
    options?: ListingWriteOptions,
  ) => Promise<Listing>
  updateListing: (
    id: string,
    listing: Listing,
    options?: ListingWriteOptions,
  ) => Promise<void>
  removeListing: (id: string) => Promise<void>
  resetToSeed: () => Promise<void>
}

const ListingsContext = createContext<ListingsContextValue | null>(null)

const SEED_FEATURED_ORDER = SEED_LISTINGS.filter((l) => l.featured)
  .map((l) => l.id)
  .slice(0, FEATURED_SLOT_LIMIT)

function commitListing(
  state: ListingsStoreState,
  listing: Listing,
  options?: ListingWriteOptions,
): ListingsStoreState {
  const isCustom = state.added.some((l) => l.id === listing.id)
  let next: ListingsStoreState = {
    ...state,
    added: isCustom
      ? state.added.map((l) => (l.id === listing.id ? listing : l))
      : state.added,
    updated: { ...state.updated, [listing.id]: listing },
    removed: state.removed.filter((r) => r !== listing.id),
  }

  next = withRegisteredMainArea(
    next,
    listing.locationKey,
    options?.mainAreaLabel || listing.location,
  )

  if (listing.featured) {
    next = applyFeaturedPlacement(next, listing.id, options?.replaceFeaturedId)
  } else {
    next = removeFromFeaturedOrder(next, listing.id)
  }

  return next
}

function LocalListingsProvider({ children }: { children: ReactNode }) {
  const [store, setStore] = useState<ListingsStoreState>(() => loadListingsStore())

  const persist = useCallback((next: ListingsStoreState) => {
    setStore(next)
    saveListingsStore(next)
  }, [])

  const listings = useMemo(() => mergeListings(store), [store])

  const featuredListings = useMemo(
    () => resolveFeaturedListings(listings, store.featuredOrder),
    [listings, store.featuredOrder],
  )

  const mainAreas = useMemo(
    () => collectMainAreas(store.mainAreas, listings),
    [store.mainAreas, listings],
  )

  const getById = useCallback(
    (id: string) => listings.find((l) => l.id === id),
    [listings],
  )

  const addListing = useCallback(
    async (input: Omit<Listing, 'id'> & { id?: string }, options?: ListingWriteOptions) => {
      const desired = input.id?.trim() || slugifyId(input.title)
      const id = ensureUniqueId(
        desired,
        listings.map((l) => l.id),
      )
      const listing: Listing = { ...input, id }
      const withAdded: ListingsStoreState = {
        ...store,
        added: [...store.added, listing],
        removed: store.removed.filter((r) => r !== id),
      }
      persist(commitListing(withAdded, listing, options))
      return listing
    },
    [listings, persist, store],
  )

  const updateListing = useCallback(
    async (id: string, listing: Listing, options?: ListingWriteOptions) => {
      persist(commitListing(store, { ...listing, id }, options))
    },
    [persist, store],
  )

  const removeListing = useCallback(
    async (id: string) => {
      const withoutFeatured = removeFromFeaturedOrder(store, id)
      persist({
        ...withoutFeatured,
        added: withoutFeatured.added.filter((l) => l.id !== id),
        updated: Object.fromEntries(
          Object.entries(withoutFeatured.updated).filter(([key]) => key !== id),
        ),
        removed: withoutFeatured.removed.includes(id)
          ? withoutFeatured.removed
          : [...withoutFeatured.removed, id],
      })
    },
    [persist, store],
  )

  const resetToSeed = useCallback(async () => {
    persist({
      added: [],
      updated: {},
      removed: [],
      mainAreas: [],
      featuredOrder: [...SEED_FEATURED_ORDER],
    })
  }, [persist])

  const value = useMemo(
    () => ({
      listings,
      featuredListings,
      mainAreas,
      ready: true,
      getById,
      addListing,
      updateListing,
      removeListing,
      resetToSeed,
    }),
    [
      listings,
      featuredListings,
      mainAreas,
      getById,
      addListing,
      updateListing,
      removeListing,
      resetToSeed,
    ],
  )

  return <ListingsContext.Provider value={value}>{children}</ListingsContext.Provider>
}

function FirebaseListingsProvider({ children }: { children: ReactNode }) {
  const [listings, setListings] = useState<Listing[]>([])
  const [meta, setMeta] = useState<ListingsMeta>({ featuredOrder: [], mainAreas: [] })
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let listingsReady = false
    let metaReady = false
    const mark = () => {
      if (listingsReady && metaReady) setReady(true)
    }

    const unsubListings = subscribeListings(
      (items) => {
        setListings(items)
        listingsReady = true
        mark()
      },
      (err) => {
        console.error('Listings subscription failed', err)
        listingsReady = true
        mark()
      },
    )
    const unsubMeta = subscribeListingsMeta(
      (next) => {
        setMeta(next)
        metaReady = true
        mark()
      },
      (err) => {
        console.error('Listings meta subscription failed', err)
        metaReady = true
        mark()
      },
    )
    return () => {
      unsubListings()
      unsubMeta()
    }
  }, [])

  const featuredListings = useMemo(
    () => resolveFeaturedItems(listings, meta.featuredOrder, FEATURED_SLOT_LIMIT),
    [listings, meta.featuredOrder],
  )

  const mainAreas = useMemo(
    () => collectMainAreas(meta.mainAreas, listings),
    [meta.mainAreas, listings],
  )

  const getById = useCallback(
    (id: string) => listings.find((l) => l.id === id),
    [listings],
  )

  const addListing = useCallback(
    async (input: Omit<Listing, 'id'> & { id?: string }, options?: ListingWriteOptions) => {
      return fbCreateListing(input, options)
    },
    [],
  )

  const updateListing = useCallback(
    async (id: string, listing: Listing, options?: ListingWriteOptions) => {
      await fbUpdateListing(id, listing, options)
    },
    [],
  )

  const removeListing = useCallback(async (id: string) => {
    await fbDeleteListing(id)
  }, [])

  const resetToSeed = useCallback(async () => {
    console.warn(
      'resetToSeed is a local-only helper. Re-run `npm run seed` in Backend to restore Firestore data.',
    )
  }, [])

  const value = useMemo(
    () => ({
      listings,
      featuredListings,
      mainAreas,
      ready,
      getById,
      addListing,
      updateListing,
      removeListing,
      resetToSeed,
    }),
    [
      listings,
      featuredListings,
      mainAreas,
      ready,
      getById,
      addListing,
      updateListing,
      removeListing,
      resetToSeed,
    ],
  )

  return <ListingsContext.Provider value={value}>{children}</ListingsContext.Provider>
}

export function ListingsProvider({ children }: { children: ReactNode }) {
  if (firebaseReady) {
    return <FirebaseListingsProvider>{children}</FirebaseListingsProvider>
  }
  return <LocalListingsProvider>{children}</LocalListingsProvider>
}

export function useListings() {
  const ctx = useContext(ListingsContext)
  if (!ctx) {
    throw new Error('useListings must be used within ListingsProvider')
  }
  return ctx
}
