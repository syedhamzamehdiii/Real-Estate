import { MAIN_AREAS } from '../data/site'
import type { Listing } from '../types'

export type MainArea = {
  value: string
  label: string
}

/** Merge seed + custom areas + anything already used on listings. */
export function collectMainAreas(
  custom: MainArea[],
  listings: Listing[],
): MainArea[] {
  const map = new Map<string, string>()

  for (const area of MAIN_AREAS) {
    map.set(area.value, area.label)
  }
  for (const area of custom) {
    if (!area.value) continue
    map.set(area.value, area.label || area.value)
  }
  for (const listing of listings) {
    if (!listing.locationKey) continue
    if (!map.has(listing.locationKey)) {
      map.set(listing.locationKey, listing.location || listing.locationKey)
    }
  }

  return Array.from(map.entries())
    .map(([value, label]) => ({ value, label }))
    .sort((a, b) => a.label.localeCompare(b.label))
}

export function findMainAreaLabel(areas: MainArea[], value: string): string | undefined {
  return areas.find((a) => a.value === value)?.label
}

export function upsertMainArea(
  areas: MainArea[],
  value: string,
  label: string,
): MainArea[] {
  const trimmedLabel = label.trim() || value
  const existing = areas.find((a) => a.value === value)
  if (existing) {
    if (existing.label === trimmedLabel) return areas
    return areas.map((a) => (a.value === value ? { value, label: trimmedLabel } : a))
  }
  return [...areas, { value, label: trimmedLabel }]
}
