/** Collection / document path constants — single source of truth. */

export const COLLECTIONS = {
  listings: 'listings',
  resources: 'resources',
  inquiries: 'inquiries',
  contactLeadClicks: 'contactLeadClicks',
  meta: 'meta',
} as const

export const META_DOCS = {
  listings: 'listings',
  resources: 'resources',
} as const

/** Firebase Storage object path helpers. */
export const storagePaths = {
  listingCover: (listingId: string) => `listings/${listingId}/cover.jpg`,
  listingCoverThumb: (listingId: string) => `listings/${listingId}/cover-thumb.jpg`,
  listingGallery: (listingId: string, fileName: string) =>
    `listings/${listingId}/gallery/${fileName}`,
  resourceCover: (resourceId: string) => `resources/${resourceId}/cover.jpg`,
  resourceCoverThumb: (resourceId: string) => `resources/${resourceId}/cover-thumb.jpg`,
} as const

export const PROPERTY_TYPES = ['House', 'Plot', 'Apartment', 'Commercial'] as const
export const PROPERTY_STATUSES = ['For Sale', 'For Rent'] as const

/** Seed filter areas — never stored as custom meta entries. */
export const BUILTIN_MAIN_AREA_VALUES = [
  'dha-phase-6',
  'dha-phase-8',
  'gulberg',
  'bahria',
  'model-town',
] as const
