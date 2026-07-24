import { Link, Navigate, useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Button, Reveal } from '../../components/ui'
import { MediaViewer } from '../../components/media/MediaViewer'
import { useListings } from '../../context/ListingsContext'
import { SITE } from '../../data/site'
import { getListingGallery } from '../../lib/listings'
import { onCallLeadClick, onWhatsAppLeadClick } from '../../lib/leadTracking'
import type { ListingDetails } from '../../types'
import './ListingDetail.css'

const DETAIL_FIELDS: { key: keyof ListingDetails; label: string }[] = [
  { key: 'floors', label: 'Floors' },
  { key: 'yearBuilt', label: 'Year built' },
  { key: 'plotSize', label: 'Plot size' },
  { key: 'builtArea', label: 'Built area' },
  { key: 'parking', label: 'Parking' },
  { key: 'kitchen', label: 'Kitchen' },
  { key: 'furnishing', label: 'Furnishing' },
  { key: 'facing', label: 'Facing' },
  { key: 'possession', label: 'Possession' },
  { key: 'servantQuarters', label: 'Servant quarters' },
]

function detailEntries(details: ListingDetails) {
  return DETAIL_FIELDS.flatMap(({ key, label }) => {
    const value = details[key]
    if (value == null || value === '') return []
    return [{ label, value: String(value) }]
  })
}

export function ListingDetailPage() {
  const { id } = useParams()
  const { getById } = useListings()
  const listing = getById(id ?? '')
  const [activeImage, setActiveImage] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const gallery = listing ? getListingGallery(listing) : []

  useEffect(() => {
    setActiveImage(0)
    setLightboxOpen(false)
  }, [id])

  if (!listing) {
    return <Navigate to="/listings" replace />
  }

  const hasGallery = gallery.length > 1
  const details = listing.details
  const detailRows = details ? detailEntries(details) : []
  const hasAllDetails =
    details != null &&
    (detailRows.length > 0 ||
      (details.features?.length ?? 0) > 0 ||
      Boolean(details.notes))

  const waText = encodeURIComponent(
    `Hi Estate Line — I'm interested in ${listing.title} (${listing.priceLabel}).`,
  )

  const goPrev = () => {
    setActiveImage((i) => (i === 0 ? gallery.length - 1 : i - 1))
  }

  const goNext = () => {
    setActiveImage((i) => (i === gallery.length - 1 ? 0 : i + 1))
  }

  return (
    <article className="listing-detail">
      <div className="detail-hero">
        {gallery.map((src, index) => (
          <img
            key={src}
            src={src}
            alt={`${listing.title} — photo ${index + 1}`}
            className={index === activeImage ? 'is-active' : undefined}
          />
        ))}
        <button
          type="button"
          className="detail-hero-open"
          aria-label={hasGallery ? 'View all photos' : 'View photo'}
          onClick={() => setLightboxOpen(true)}
        />
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

        {hasGallery ? (
          <div className="detail-gallery-controls">
            <button type="button" className="gallery-nav" onClick={goPrev} aria-label="Previous photo">
              ‹
            </button>
            <div className="gallery-dots" role="tablist" aria-label="Photos">
              {gallery.map((src, index) => (
                <button
                  key={src}
                  type="button"
                  role="tab"
                  aria-selected={index === activeImage}
                  aria-label={`Photo ${index + 1}`}
                  className={index === activeImage ? 'is-active' : undefined}
                  onClick={() => setActiveImage(index)}
                />
              ))}
            </div>
            <button type="button" className="gallery-nav" onClick={goNext} aria-label="Next photo">
              ›
            </button>
            <span className="gallery-count">
              {activeImage + 1} / {gallery.length}
            </span>
          </div>
        ) : null}
      </div>

      <MediaViewer
        open={lightboxOpen}
        images={gallery.map((src, index) => ({
          src,
          alt: `${listing.title} — photo ${index + 1}`,
        }))}
        index={activeImage}
        onIndexChange={setActiveImage}
        onClose={() => setLightboxOpen(false)}
        title={`${listing.title} photos`}
        details={
          <>
            <span className="badge">{listing.status}</span>
            <h2>{listing.title}</h2>
            <p className="media-meta">{listing.location}</p>
            <p className="media-price">{listing.priceLabel}</p>
            <p className="media-copy">{listing.description}</p>
            <div className="media-specs">
              <div>
                <span>Type</span>
                <strong>{listing.type}</strong>
              </div>
              {listing.beds != null ? (
                <div>
                  <span>Beds</span>
                  <strong>{listing.beds}</strong>
                </div>
              ) : null}
              {listing.baths != null ? (
                <div>
                  <span>Baths</span>
                  <strong>{listing.baths}</strong>
                </div>
              ) : null}
              <div>
                <span>Size</span>
                <strong>{listing.sizeLabel}</strong>
              </div>
            </div>
          </>
        }
      />

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

            {hasAllDetails ? (
              <div className="detail-all">
                <h2>All details</h2>
                {detailRows.length > 0 ? (
                  <dl className="detail-all-grid">
                    {detailRows.map((row) => (
                      <div key={row.label}>
                        <dt>{row.label}</dt>
                        <dd>{row.value}</dd>
                      </div>
                    ))}
                  </dl>
                ) : null}
                {details?.features && details.features.length > 0 ? (
                  <div className="detail-features">
                    <h3>Features</h3>
                    <ul>
                      {details.features.map((feature) => (
                        <li key={feature}>{feature}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}
                {details?.notes ? <p className="detail-notes">{details.notes}</p> : null}
              </div>
            ) : null}
          </div>

          <aside className="detail-cta">
            <h3>Book a private viewing</h3>
            <p>One dedicated agent from first visit through to final transfer.</p>
            <Button to="/contact">Schedule a Visit →</Button>
            <Button
              variant="outline"
              href={`https://wa.me/${SITE.whatsapp}?text=${waText}`}
              onClick={onWhatsAppLeadClick}
            >
              WhatsApp an Agent
            </Button>
            <a className="detail-phone" href={`tel:${SITE.phone}`} onClick={onCallLeadClick}>
              Or call {SITE.phoneDisplay}
            </a>
          </aside>
        </Reveal>
      </section>
    </article>
  )
}
