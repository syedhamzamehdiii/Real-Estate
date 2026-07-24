import type { StatItem } from '../types'
import { SITE } from './site'

export const stats: StatItem[] = [
  { id: 'years', value: SITE.yearsOfExpertise, label: SITE.expertiseStatLabel },
  { id: 'deals', value: 500, label: 'Successful Deals Closed', suffix: '+' },
  { id: 'families', value: 1200, label: 'Happy Families Housed', suffix: '+' },
  { id: 'rating', value: 4.9, label: 'Average Client Rating', decimals: 1 },
]
