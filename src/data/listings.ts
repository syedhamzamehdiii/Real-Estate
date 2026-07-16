import type { Listing } from '../types'

export const listings: Listing[] = [
  {
    id: 'willowmere-villa',
    title: 'The Willowmere Villa',
    location: 'DHA Phase 6, Lahore',
    locationKey: 'dha-phase-6',
    type: 'House',
    status: 'For Sale',
    priceLabel: 'PKR 185M',
    priceValue: 185_000_000,
    image:
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=800&auto=format&fit=crop',
    beds: 5,
    baths: 6,
    sizeLabel: '1 Kanal',
    description:
      'A refined 1-kanal villa with landscaped gardens, double-height foyer, and a private pool courtyard — verified ownership and walk-through video available.',
    featured: true,
  },
  {
    id: 'cedarline-residence',
    title: 'Cedarline Residence',
    location: 'Phase 8, DHA Lahore',
    locationKey: 'dha-phase-8',
    type: 'House',
    status: 'For Sale',
    priceLabel: 'PKR 92M',
    priceValue: 92_000_000,
    image:
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=800&auto=format&fit=crop',
    beds: 4,
    baths: 5,
    sizeLabel: '10 Marla',
    description:
      'Sunlit family home on a quiet Phase 8 street. Open kitchen, rooftop terrace, and covered parking for two cars.',
    featured: true,
  },
  {
    id: 'skyline-loft',
    title: 'Skyline Loft, Tower 9',
    location: 'Gulberg III, Lahore',
    locationKey: 'gulberg',
    type: 'Apartment',
    status: 'For Rent',
    priceLabel: 'PKR 320K/mo',
    priceValue: 320_000,
    image:
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=800&auto=format&fit=crop',
    beds: 3,
    baths: 3,
    sizeLabel: '2100 sqft',
    description:
      'Corner loft with floor-to-ceiling glass and city views. Fully furnished, gym access, and 24/7 security.',
    featured: true,
  },
  {
    id: 'bahria-orchard-plot',
    title: 'Bahria Orchard Corner Plot',
    location: 'Bahria Town',
    locationKey: 'bahria',
    type: 'Plot',
    status: 'For Sale',
    priceLabel: 'PKR 68M',
    priceValue: 68_000_000,
    image:
      'https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=800&auto=format&fit=crop',
    sizeLabel: '10 Marla',
    description:
      'Corner plot with dual road access in a developed sector. Clear title, possession ready.',
    featured: false,
  },
  {
    id: 'model-town-bungalow',
    title: 'Model Town Heritage Bungalow',
    location: 'Model Town',
    locationKey: 'model-town',
    type: 'House',
    status: 'For Sale',
    priceLabel: 'PKR 210M',
    priceValue: 210_000_000,
    image:
      'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?q=80&w=800&auto=format&fit=crop',
    beds: 6,
    baths: 7,
    sizeLabel: '2 Kanal',
    description:
      'Classic bungalow on a wide boulevard. Mature trees, servant quarters, and room to renovate to modern standards.',
    featured: false,
  },
  {
    id: 'gulberg-office-suite',
    title: 'MM Alam Office Suite',
    location: 'Gulberg, Lahore',
    locationKey: 'gulberg',
    type: 'Commercial',
    status: 'For Rent',
    priceLabel: 'PKR 450K/mo',
    priceValue: 450_000,
    image:
      'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=800&auto=format&fit=crop',
    sizeLabel: '1800 sqft',
    description:
      'Fitted commercial suite on MM Alam Road. Reception, three cabins, and dedicated parking.',
    featured: false,
  },
]
