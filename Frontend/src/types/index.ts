export type PropertyStatus = 'For Sale' | 'For Rent'
export type PropertyType = 'House' | 'Plot' | 'Apartment' | 'Commercial'

/** Optional long-form facts — omit entirely on listings that don't need them. */
export interface ListingDetails {
  beds?: number
  baths?: number
  floors?: number
  yearBuilt?: number
  parking?: string
  kitchen?: string
  furnishing?: string
  facing?: string
  possession?: string
  plotSize?: string
  builtArea?: string
  servantQuarters?: string
  features?: string[]
  notes?: string
}

export interface Listing {
  id: string
  title: string
  location: string
  locationKey: string
  type: PropertyType
  status: PropertyStatus
  priceLabel: string
  priceValue: number
  /** Full-resolution cover for detail pages and lightbox. */
  image: string
  /** Cropped cover for listing cards (falls back to `image`). */
  thumbnail?: string
  /** Extra gallery photos (optional) — full-resolution originals. */
  images?: string[]
  /** Cropped gallery frames aligned with `images` (optional). */
  imageThumbnails?: string[]
  beds?: number
  baths?: number
  sizeLabel: string
  description: string
  featured?: boolean
  /** Full property breakdown — only render "All details" when present. */
  details?: ListingDetails
}

export interface BlogPost {
  id: string
  slug: string
  category: string
  title: string
  excerpt: string
  content: string
  /** Full-resolution cover for article hero / lightbox. */
  image: string
  /** Cropped cover for resource cards (falls back to `image`). */
  thumbnail?: string
  author: string
  readMinutes: number
  publishedAt: string
  /** Shown in the homepage resources slider when true. */
  featured?: boolean
}

export interface StatItem {
  id: string
  value: number
  label: string
  decimals?: number
  suffix?: string
}

export interface SearchFilters {
  location: string
  type: string
  budget: string
}

export interface ContactFormData {
  name: string
  email: string
  phone: string
  message: string
  interest: string
}
