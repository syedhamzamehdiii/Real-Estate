import { Link } from 'react-router-dom'
import { TiltCard } from '../../components/ui/TiltCard'
import { Reveal } from '../../components/ui'
import type { Listing } from '../../types'
import './ListingCard.css'

type ListingCardProps = {
  listing: Listing
}

export function ListingCard({ listing }: ListingCardProps) {
  return (
    <Reveal as="article">
      <TiltCard className="listing-card">
        <Link to={`/listings/${listing.id}`} className="listing-card-link">
          <div className="card-img">
            <img src={listing.image} alt={listing.title} loading="lazy" />
            <span className="badge">{listing.status}</span>
            <span className="price-tag">{listing.priceLabel}</span>
          </div>
          <div className="card-body">
            <h3>{listing.title}</h3>
            <div className="loc">
              <LocIcon />
              {listing.location}
            </div>
            <div className="specs">
              {listing.beds != null ? (
                <div>
                  <strong>{listing.beds}</strong> Beds
                </div>
              ) : null}
              {listing.baths != null ? (
                <div>
                  <strong>{listing.baths}</strong> Baths
                </div>
              ) : null}
              <div>
                <strong>{listing.sizeLabel}</strong>
              </div>
            </div>
          </div>
        </Link>
      </TiltCard>
    </Reveal>
  )
}

function LocIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2C8.1 2 5 5.1 5 9c0 5.3 7 13 7 13s7-7.7 7-13c0-3.9-3.1-7-7-7Zm0 9.5A2.5 2.5 0 1 1 12 6a2.5 2.5 0 0 1 0 5.5Z" />
    </svg>
  )
}
