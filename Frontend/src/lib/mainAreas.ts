import { MAIN_AREAS } from '../data/site'
import type { Listing } from '../types'

export type MainArea = {
  value: string
  label: string
}

function labelLookup(custom: MainArea[]): Map<string, string> {
  const map = new Map<string, string>()
  for (const area of MAIN_AREAS) {
    map.set(area.value, area.label)
  }
  for (const area of custom) {
    if (!area.value) continue
    map.set(area.value, area.label || area.value)
  }
  return map
}

/**
 * Main areas that currently have at least one listing.
 * Used for public filters so empty / orphaned places never appear.
 */
export function collectMainAreas(
  custom: MainArea[],
  listings: Listing[],
): MainArea[] {
  const labels = labelLookup(custom)
  const used = new Map<string, string>()

  for (const listing of listings) {
    if (!listing.locationKey) continue
    const label =
      labels.get(listing.locationKey) ||
      listing.location ||
      listing.locationKey
    used.set(listing.locationKey, label)
  }

  return Array.from(used.entries())
    .map(([value, label]) => ({ value, label }))
    .sort((a, b) => a.label.localeCompare(b.label))
}

/**
 * Admin picker: built-in areas + anything already on listings / custom meta.
 * Lets agents assign a built-in area even before the first listing exists there.
 */
export function collectSelectableMainAreas(
  custom: MainArea[],
  listings: Listing[],
): MainArea[] {
  const map = labelLookup(custom)

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
