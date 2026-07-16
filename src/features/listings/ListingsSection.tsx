import { Button, Reveal, SectionHead } from '../../components/ui'
import { listings } from '../../data/listings'
import { ListingCard } from './ListingCard'
import './ListingsSection.css'

export function ListingsSection() {
  const featured = listings.filter((l) => l.featured).slice(0, 3)

  return (
    <section className="section" id="listings">
      <Reveal>
        <SectionHead
          tag="Featured Properties"
          title={
            <>
              Handpicked homes,
              <br />
              ready to view this week.
            </>
          }
          description="A short list of our most requested listings — verified ownership, walk-through video, and transparent pricing on every property."
        />
      </Reveal>

      <div className="listing-grid">
        {featured.map((listing) => (
          <ListingCard key={listing.id} listing={listing} />
        ))}
      </div>

      <div className="view-all">
        <Reveal>
          <Button variant="outline" to="/listings">
            View All Listings →
          </Button>
        </Reveal>
      </div>
    </section>
  )
}
