import { useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Button, Reveal, SectionHead } from '../../components/ui'
import { useListings } from '../../context/ListingsContext'
import { BUDGETS, PROPERTY_TYPES } from '../../data/site'
import { filterListings } from '../../lib/listings'
import { ListingCard } from './ListingCard'
import { SearchPanel } from '../home/SearchPanel'
import './ListingsPage.css'

export function ListingsPage() {
  const { listings, mainAreas } = useListings()
  const [params, setParams] = useSearchParams()

  const location = params.get('location') ?? 'all'
  const type = params.get('type') ?? 'all'
  const budget = params.get('budget') ?? 'all'

  const results = useMemo(
    () => filterListings(listings, { location, type, budget }),
    [listings, location, type, budget],
  )

  const clear = () => setParams({})

  return (
    <div className="listings-page">
      <section className="section listings-hero">
        <Reveal>
          <SectionHead
            tag="All Listings"
            title="Browse verified homes & plots."
            description="Filter by main area, type, and budget. Every listing is personally checked by our team before it appears here."
          />
        </Reveal>
        <Reveal>
          <SearchPanel
            key={`${location}-${type}-${budget}`}
            compact
            initial={{ location, type, budget }}
          />
        </Reveal>

        <div className="active-filters">
          <p>
            Showing <strong>{results.length}</strong>{' '}
            {results.length === 1 ? 'property' : 'properties'}
          </p>
          {(location !== 'all' || type !== 'all' || budget !== 'all') && (
            <button type="button" className="clear-filters" onClick={clear}>
              Clear filters
            </button>
          )}
        </div>

        <div className="filter-chips" aria-label="Active filters">
          {location !== 'all' && (
            <span className="chip">
              {mainAreas.find((l) => l.value === location)?.label ?? location}
            </span>
          )}
          {type !== 'all' && (
            <span className="chip">
              {PROPERTY_TYPES.find((t) => t.value === type)?.label ?? type}
            </span>
          )}
          {budget !== 'all' && (
            <span className="chip">
              {BUDGETS.find((b) => b.value === budget)?.label ?? budget}
            </span>
          )}
        </div>
      </section>

      <section className="section listings-results">
        {results.length === 0 ? (
          <div className="empty-state">
            <p>No listings match these filters. Try widening your search.</p>
            <Button type="button" className="empty-cta" onClick={clear}>
              Reset filters
            </Button>
            <p className="empty-hint">
              Or <Link to="/contact">talk to an agent</Link> for off-market options.
            </p>
          </div>
        ) : (
          <div className="listing-grid">
            {results.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
