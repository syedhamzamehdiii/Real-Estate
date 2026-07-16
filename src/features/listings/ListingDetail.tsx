import { Link, Navigate, useParams } from 'react-router-dom'
import { Button, Reveal } from '../../components/ui'
import { listings } from '../../data/listings'
import { SITE } from '../../data/site'
import { getListingById } from '../../lib/listings'
import './ListingDetail.css'

export function ListingDetailPage() {
  const { id } = useParams()
  const listing = getListingById(listings, id ?? '')

  if (!listing) {
    return <Navigate to="/listings" replace />
  }

  const waText = encodeURIComponent(
    `Hi Estate Line — I'm interested in ${listing.title} (${listing.priceLabel}).`,
  )

  return (
    <article className="listing-detail">
      <div className="detail-hero">
        <img src={listing.image} alt={listing.title} />
        <div className="detail-hero-overlay" />
        <div className="detail-hero-content">
          <Link to="/listings" className="back-link">
            ← All listings
          </Link>
          <span className="badge">{listing.status}</span>
          <h1>{listing.title}</h1>
          <p className="detail-loc">{listing.location}</p>
          <p className="detail-price">{listing.priceLabel}</p>
        </div>
      </div>

      <section className="section detail-body">
        <Reveal className="detail-grid">
          <div>
            <h2>About this property</h2>
            <p>{listing.description}</p>
            <div className="detail-specs">
              <div>
                <span>Type</span>
                <strong>{listing.type}</strong>
              </div>
              {listing.beds != null && (
                <div>
                  <span>Beds</span>
                  <strong>{listing.beds}</strong>
                </div>
              )}
              {listing.baths != null && (
                <div>
                  <span>Baths</span>
                  <strong>{listing.baths}</strong>
                </div>
              )}
              <div>
                <span>Size</span>
                <strong>{listing.sizeLabel}</strong>
              </div>
            </div>
          </div>

          <aside className="detail-cta">
            <h3>Book a private viewing</h3>
            <p>One dedicated agent from first visit through to final transfer.</p>
            <Button to="/contact">Schedule a Visit →</Button>
            <Button
              variant="outline"
              href={`https://wa.me/${SITE.whatsapp}?text=${waText}`}
            >
              WhatsApp an Agent
            </Button>
            <a className="detail-phone" href={`tel:${SITE.phone}`}>
              Or call {SITE.phoneDisplay}
            </a>
          </aside>
        </Reveal>
      </section>
    </article>
  )
}
