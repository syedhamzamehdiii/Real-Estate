import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { BUDGETS, PROPERTY_TYPES } from '../../data/site'
import { useListings } from '../../context/ListingsContext'
import type { SearchFilters } from '../../types'
import { Button } from '../../components/ui'
import './SearchPanel.css'

const defaults: SearchFilters = {
  location: 'all',
  type: 'all',
  budget: 'all',
}

type SearchPanelProps = {
  initial?: Partial<SearchFilters>
  compact?: boolean
}

export function SearchPanel({ initial, compact }: SearchPanelProps) {
  const navigate = useNavigate()
  const { mainAreas } = useListings()
  const [filters, setFilters] = useState<SearchFilters>({ ...defaults, ...initial })

  const setField = (key: keyof SearchFilters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (filters.location && filters.location !== 'all') params.set('location', filters.location)
    if (filters.type && filters.type !== 'all') params.set('type', filters.type)
    if (filters.budget && filters.budget !== 'all') params.set('budget', filters.budget)
    const qs = params.toString()
    navigate(qs ? `/listings?${qs}` : '/listings')
  }

  return (
    <form
      className={`search-panel ${compact ? 'compact' : ''}`}
      onSubmit={onSubmit}
      aria-label="Property search"
    >
      <div className="field">
        <label htmlFor="search-location">Main area</label>
        <select
          id="search-location"
          value={filters.location}
          onChange={(e) => setField('location', e.target.value)}
        >
          <option value="all">All areas</option>
          {mainAreas.map((loc) => (
            <option key={loc.value} value={loc.value}>
              {loc.label}
            </option>
          ))}
        </select>
      </div>

      <div className="field">
        <label htmlFor="search-type">Property Type</label>
        <select
          id="search-type"
          value={filters.type}
          onChange={(e) => setField('type', e.target.value)}
        >
          <option value="all">All types</option>
          {PROPERTY_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </div>

      <div className="field">
        <label htmlFor="search-budget">Budget</label>
        <select
          id="search-budget"
          value={filters.budget}
          onChange={(e) => setField('budget', e.target.value)}
        >
          <option value="all">Any budget</option>
          {BUDGETS.map((b) => (
            <option key={b.value} value={b.value}>
              {b.label}
            </option>
          ))}
        </select>
      </div>

      <Button type="submit" className="search-submit">
        Search
      </Button>
    </form>
  )
}
