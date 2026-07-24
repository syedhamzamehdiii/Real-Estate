const foundedYear = 2001
const yearsOfExpertise = new Date().getFullYear() - foundedYear

export const SITE = {
  name: 'Estate Line Properties',
  tagline: 'Homes Found at Dusk',
  phone: '+923004368166',
  phoneDisplay: '0300 4368166',
  whatsapp: '923004368166',
  email: 'estatelineproperties@gmail.com',
  address: 'Plaza No 170 CCA1, DHA Phase 6 Lahore, Pakistan',
  foundedYear,
  yearsOfExpertise,
  facebook: 'https://www.facebook.com/share/1Jj6c3Nqk5/',
  instagram: 'https://www.instagram.com/estatelineproperties',
  youtube: 'https://www.youtube.com/@Estatelineproperties',
  eyebrow: `Trusted Real Estate · Since ${foundedYear}`,
  heroSub:
    'Estate Line Properties curates rare listings across the city\'s most desired addresses — guided by local and international expertise and quiet, honest advice from first visit to closing day.',
  footerBlurb: `Local and international expertise, honest guidance — helping you find home in Lahore's most sought-after neighborhoods since ${foundedYear}.`,
  aboutTag: 'About Estate Line Properties',
  aboutTitleLine1: 'Local & international knowledge.',
  aboutTitleLine2: 'Honest guidance.',
  aboutDescription: `For over ${yearsOfExpertise} years, we've helped families and investors navigate competitive markets at home and abroad — without the pressure tactics. Every listing on this site is personally verified by our team before it ever reaches you.`,
  expertiseStatLabel: 'Years of Local & International Expertise',
  metaDescription:
    'Estate Line Properties — local and international real estate expertise since 2001. Curated homes and plots across Lahore. Honest guidance from first visit to closing day.',
} as const

export const NAV_LINKS = [
  { label: 'Home', to: '/' },
  { label: 'Listings', to: '/listings' },
  { label: 'About', to: '/about' },
  { label: 'Resources', to: '/resources' },
  { label: 'Contact', to: '/contact' },
] as const

export const MAIN_AREAS = [
  { value: 'dha-phase-6', label: 'DHA Phase 6, Lahore' },
  { value: 'dha-phase-8', label: 'Phase 8, DHA Lahore' },
  { value: 'gulberg', label: 'Gulberg, Lahore' },
  { value: 'bahria', label: 'Bahria Town' },
  { value: 'model-town', label: 'Model Town' },
] as const

/** @deprecated Prefer MAIN_AREAS — kept for older imports */
export const LOCATIONS = MAIN_AREAS

export const PROPERTY_TYPES = [
  { value: 'House', label: 'House' },
  { value: 'Plot', label: 'Plot' },
  { value: 'Apartment', label: 'Apartment' },
  { value: 'Commercial', label: 'Commercial' },
] as const

export const BUDGETS = [
  { value: '50-100', label: '50M – 100M PKR', min: 50_000_000, max: 100_000_000 },
  { value: '100-200', label: '100M – 200M PKR', min: 100_000_000, max: 200_000_000 },
  { value: '200+', label: '200M+ PKR', min: 200_000_000, max: Infinity },
  { value: 'rent', label: 'For Rent (any)', min: 0, max: Infinity },
] as const
