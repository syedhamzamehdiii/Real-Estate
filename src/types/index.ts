export type PropertyStatus = 'For Sale' | 'For Rent'
export type PropertyType = 'House' | 'Plot' | 'Apartment' | 'Commercial'

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
  beds?: number
  baths?: number
  sizeLabel: string
  description: string
  featured?: boolean
}

export interface BlogPost {
  id: string
  slug: string
  category: string
  title: string
  excerpt: string
  content: string
  image: string
  author: string
  readMinutes: number
  publishedAt: string
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
