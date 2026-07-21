import type { BlogPost, Listing, MainArea } from '../types/models'

export const SEED_MAIN_AREAS: MainArea[] = [
  { value: 'dha-phase-6', label: 'DHA Phase 6, Lahore' },
  { value: 'dha-phase-8', label: 'Phase 8, DHA Lahore' },
  { value: 'gulberg', label: 'Gulberg, Lahore' },
  { value: 'bahria', label: 'Bahria Town' },
  { value: 'model-town', label: 'Model Town' },
]

export const SEED_LISTINGS: Listing[] = [
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
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1200&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?q=80&w=1200&auto=format&fit=crop',
    ],
    beds: 5,
    baths: 6,
    sizeLabel: '1 Kanal',
    description:
      'A refined 1-kanal villa with landscaped gardens, double-height foyer, and a private pool courtyard — verified ownership and walk-through video available.',
    featured: true,
    details: {
      beds: 5,
      baths: 6,
      floors: 2,
      yearBuilt: 2021,
      parking: 'Covered parking for 3 cars',
      kitchen: 'Imported modular kitchen with island',
      furnishing: 'Semi-furnished',
      facing: 'Park-facing',
      possession: 'Immediate',
      plotSize: '1 Kanal',
      builtArea: '5,400 sqft',
      servantQuarters: 'Separate annex with bath',
      features: [
        'Private pool courtyard',
        'Double-height foyer',
        'Landscaped gardens',
        'Smart home lighting',
        'Backup generator',
        'CCTV & security',
      ],
      notes: 'All ownership documents verified. Walk-through video available on request.',
    },
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
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=1200&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1600585154526-990dced4db0d?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?q=80&w=1200&auto=format&fit=crop',
    ],
    beds: 4,
    baths: 5,
    sizeLabel: '10 Marla',
    description:
      'Sunlit family home on a quiet Phase 8 street. Open kitchen, rooftop terrace, and covered parking for two cars.',
    featured: true,
    details: {
      beds: 4,
      baths: 5,
      floors: 2,
      parking: 'Covered parking for 2 cars',
      kitchen: 'Open-plan kitchen',
      furnishing: 'Unfurnished',
      possession: 'Immediate',
      features: ['Rooftop terrace', 'Quiet cul-de-sac', 'Near school & park'],
    },
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
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=1200&auto=format&fit=crop',
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
      'https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=1200&auto=format&fit=crop',
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
      'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?q=80&w=1200&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1600607687644-c7171b42498f?q=80&w=1200&auto=format&fit=crop',
    ],
    beds: 6,
    baths: 7,
    sizeLabel: '2 Kanal',
    description:
      'Classic bungalow on a wide boulevard. Mature trees, servant quarters, and room to renovate to modern standards.',
    featured: false,
    details: {
      beds: 6,
      baths: 7,
      floors: 1,
      yearBuilt: 1988,
      parking: 'Driveway for 4 cars',
      servantQuarters: 'Yes — rear annex',
      plotSize: '2 Kanal',
      possession: 'Immediate',
      features: ['Mature trees', 'Wide boulevard frontage', 'Original hardwood floors'],
      notes: 'Ideal for renovation or multi-family conversion subject to bylaws.',
    },
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
      'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1200&auto=format&fit=crop',
    sizeLabel: '1800 sqft',
    description:
      'Fitted commercial suite on MM Alam Road. Reception, three cabins, and dedicated parking.',
    featured: false,
  },
]

export const SEED_RESOURCES: BlogPost[] = [
  {
    id: '1',
    slug: 'dha-lahore-price-trends-mid-2026',
    category: 'Market Update',
    title: 'DHA Lahore Price Trends: Mid‑2026 Outlook',
    excerpt:
      "What's driving demand across Phases 6 through 9, and where prices are headed next quarter.",
    content:
      'Demand in DHA Lahore remains concentrated in Phases 6–9, where finished homes with clear documentation continue to command a premium. Mid-2026 inventory is tighter on 10-marla and 1-kanal plots, while apartment rentals in Gulberg and Phase 8 stay resilient. Buyers who lock verified ownership early typically close faster and with fewer transfer surprises.',
    image:
      'https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=700&auto=format&fit=crop',
    author: 'Estate Line Research',
    readMinutes: 6,
    publishedAt: '2026-06-12',
    featured: true,
  },
  {
    id: '2',
    slug: 'first-time-buyer-plot-transfer-checklist',
    category: 'Buying Guide',
    title: "A First‑Time Buyer's Checklist for Plot Transfers",
    excerpt: 'Every document, fee and inspection step to expect before you sign anything.',
    content:
      'Before you transfer a plot, confirm CNIC copies, allotment letter, NOC status, and any outstanding dues. Schedule a site visit, verify boundaries against the map, and budget for transfer tax plus agent fees. A dedicated agent who walks you through each stamp and signature keeps the process calm and on schedule.',
    image:
      'https://images.unsplash.com/photo-1554224155-6726b3ff858f?q=80&w=700&auto=format&fit=crop',
    author: 'Estate Line Research',
    readMinutes: 8,
    publishedAt: '2026-05-28',
    featured: true,
  },
  {
    id: '3',
    slug: 'rental-yield-vs-capital-growth',
    category: 'Investment',
    title: 'Rental Yield vs Capital Growth: Picking Your Lane',
    excerpt: 'A simple framework for deciding which type of property fits your goals.',
    content:
      'If you need cash flow, prioritize furnished apartments and commercial suites in high-footfall corridors. If you are building long-term wealth, focus on scarce plot sizes in established societies. Many investors blend both — one rental for income, one land holding for appreciation.',
    image:
      'https://images.unsplash.com/photo-1582407947304-fd86f028f716?q=80&w=700&auto=format&fit=crop',
    author: 'Estate Line Research',
    readMinutes: 5,
    publishedAt: '2026-05-10',
    featured: true,
  },
  {
    id: '4',
    slug: 'understanding-transfer-tax-dha',
    category: 'Legal',
    title: 'Understanding Transfer Tax on DHA Properties',
    excerpt: 'A plain-English breakdown of the fees due at possession and transfer stage.',
    content:
      'Transfer charges vary by property type and society rules. Always request a written fee schedule from the society office and compare it against your sale agreement. Transparent, all-inclusive quotes from your agent should list society dues, stamp duty, and professional fees separately.',
    image:
      'https://images.unsplash.com/photo-1560184897-ae5062554693?q=80&w=700&auto=format&fit=crop',
    author: 'Estate Line Research',
    readMinutes: 4,
    publishedAt: '2026-04-22',
    featured: true,
  },
  {
    id: '5',
    slug: 'upgrades-that-raise-resale-value',
    category: 'Renovation',
    title: 'Five Upgrades That Actually Raise Resale Value',
    excerpt: 'Where to spend before listing, and what buyers in Lahore consistently overlook.',
    content:
      'Kitchen refreshes, bathroom fixtures, exterior paint, LED lighting, and a tidy landscape return the most for Lahore buyers. Avoid over-customizing interiors — neutral finishes photograph better and appeal to a wider pool of viewers.',
    image:
      'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?q=80&w=700&auto=format&fit=crop',
    author: 'Estate Line Research',
    readMinutes: 7,
    publishedAt: '2026-04-05',
    featured: true,
  },
]
