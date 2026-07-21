import { BUDGETS } from '../data/site'
import type { Listing, SearchFilters } from '../types'

/** Cover + optional extras, deduped for the detail gallery. */
export function getListingGallery(listing: Listing): string[] {
  const extras = listing.images ?? []
  const seen = new Set<string>()
  const gallery: string[] = []
  for (const src of [listing.image, ...extras]) {
    if (!src || seen.has(src)) continue
    seen.add(src)
    gallery.push(src)
  }
  return gallery
}

export function filterListings(
  items: Listing[],
  filters: Partial<SearchFilters> & { status?: string } = {},
): Listing[] {
  return items.filter((item) => {
    if (filters.location && filters.location !== 'all' && item.locationKey !== filters.location) {
      return false
    }
    if (filters.type && filters.type !== 'all' && item.type !== filters.type) {
      return false
    }
    if (filters.status && filters.status !== 'all' && item.status !== filters.status) {
      return false
    }
    if (filters.budget && filters.budget !== 'all') {
      const budget = BUDGETS.find((b) => b.value === filters.budget)
      if (!budget) return true
      if (budget.value === 'rent') {
        return item.status === 'For Rent'
      }
      if (item.status === 'For Rent') return false
      return item.priceValue >= budget.min && item.priceValue <= budget.max
    }
    return true
  })
}

export function getListingById(items: Listing[], id: string) {
  return items.find((item) => item.id === id)
}
