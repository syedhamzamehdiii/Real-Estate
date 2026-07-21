import {
  createContext,
  useCallback,
  useContext,
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

type ListingWriteOptions = {
  mainAreaLabel?: string
  /** Current featured listing to swap out when featuring this one */
  replaceFeaturedId?: string
}

type ListingsContextValue = {
  listings: Listing[]
  featuredListings: Listing[]
  mainAreas: MainArea[]
  getById: (id: string) => Listing | undefined
  addListing: (
    input: Omit<Listing, 'id'> & { id?: string },
    options?: ListingWriteOptions,
  ) => Listing
  updateListing: (id: string, listing: Listing, options?: ListingWriteOptions) => void
  removeListing: (id: string) => void
  resetToSeed: () => void
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

export function ListingsProvider({ children }: { children: ReactNode }) {
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
    (input: Omit<Listing, 'id'> & { id?: string }, options?: ListingWriteOptions) => {
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
    (id: string, listing: Listing, options?: ListingWriteOptions) => {
      persist(commitListing(store, { ...listing, id }, options))
    },
    [persist, store],
  )

  const removeListing = useCallback(
    (id: string) => {
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

  const resetToSeed = useCallback(() => {
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

export function useListings() {
  const ctx = useContext(ListingsContext)
  if (!ctx) {
    throw new Error('useListings must be used within ListingsProvider')
  }
  return ctx
}
