/** Domain models aligned with Frontend/src/types — plus Firestore metadata. */

export type PropertyStatus = 'For Sale' | 'For Rent'
export type PropertyType = 'House' | 'Plot' | 'Apartment' | 'Commercial'

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

/** Public listing shape expected by the SPA. */
export interface Listing {
  id: string
  title: string
  location: string
  locationKey: string
  type: PropertyType
  status: PropertyStatus
  priceLabel: string
  priceValue: number
  image: string
  thumbnail?: string
  images?: string[]
  imageThumbnails?: string[]
  beds?: number
  baths?: number
  sizeLabel: string
  description: string
  featured?: boolean
  details?: ListingDetails
}

/** Firestore document for a listing (includes ownership + timestamps). */
export interface ListingDocument extends Listing {
  ownerId: string
  createdBy: string
  updatedBy: string
  createdAt: unknown
  updatedAt: unknown
}

export interface BlogPost {
  id: string
  slug: string
  category: string
  title: string
  excerpt: string
  content: string
  image: string
  thumbnail?: string
  author: string
  readMinutes: number
  publishedAt: string
  featured?: boolean
}

export interface ResourceDocument extends BlogPost {
  ownerId: string
  createdBy: string
  updatedBy: string
  createdAt: unknown
  updatedAt: unknown
}

export interface MainArea {
  value: string
  label: string
}

export interface ListingsMeta {
  featuredOrder: string[]
  mainAreas: MainArea[]
  updatedAt?: unknown
}

export interface ResourcesMeta {
  featuredOrder: string[]
  /** Next numeric id for new resources (stringified as BlogPost.id). */
  nextNumericId: number
  updatedAt?: unknown
}

export interface ContactFormData {
  name: string
  email: string
  phone: string
  message: string
  interest: string
}

export type InquiryStatus = 'new' | 'read' | 'archived'

export interface InquiryDocument extends ContactFormData {
  id: string
  status: InquiryStatus
  createdAt: unknown
}

export type LeadChannel = 'call' | 'whatsapp'

export interface ContactLeadClick {
  id: string
  channel: LeadChannel
  visitorId: string
  createdAt: unknown
}

export interface LeadClickStats {
  callLeads: number
  whatsappLeads: number
}

export interface ListingWriteOptions {
  mainAreaLabel?: string
  replaceFeaturedId?: string
}

export interface ResourceWriteOptions {
  replaceFeaturedId?: string
}

export interface PageCursor {
  /** Opaque cursor — last document id from previous page. */
  afterId?: string
  limit?: number
}

export interface PaginatedResult<T> {
  items: T[]
  nextCursor: string | null
  hasMore: boolean
}

export interface ListingFilters {
  locationKey?: string
  type?: PropertyType | string
  status?: PropertyStatus | string
  /** Inclusive min priceValue */
  minPrice?: number
  /** Inclusive max priceValue */
  maxPrice?: number
  featured?: boolean
}

export const FEATURED_LISTING_LIMIT = 3
export const FEATURED_RESOURCE_LIMIT = 5
export const DEFAULT_PAGE_SIZE = 24
export const MAX_GALLERY_IMAGES = 24
