import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useListings } from '../../context/ListingsContext'
import { Button } from '../../components/ui'
import './Admin.css'

export function AdminDashboard() {
  const { listings, removeListing, resetToSeed } = useListings()
  const location = useLocation()
  const navigate = useNavigate()
  const [notice, setNotice] = useState('')

  useEffect(() => {
    const message = (location.state as { notice?: string } | null)?.notice
    if (!message) return
    setNotice(message)
    navigate('.', { replace: true, state: {} })
    const timer = window.setTimeout(() => setNotice(''), 2800)
    return () => window.clearTimeout(timer)
  }, [location.state, navigate])

  const forSale = listings.filter((l) => l.status === 'For Sale').length
  const forRent = listings.filter((l) => l.status === 'For Rent').length
  const featured = listings.filter((l) => l.featured).length

  const handleDelete = (id: string, title: string) => {
    if (window.confirm(`Remove “${title}” from the site?`)) {
      removeListing(id)
    }
  }

  const handleReset = () => {
    if (
      window.confirm(
        'Reset all listings to the built-in samples? Added and edited listings will be cleared.',
      )
    ) {
      resetToSeed()
    }
  }

  return (
    <div className="admin-page">
      {notice ? <p className="admin-saved admin-saved-banner">{notice}</p> : null}
      <header className="admin-page-head">
        <div>
          <p className="admin-eyebrow">Dashboard</p>
          <h1>Listings</h1>
          <p className="admin-lede">
            Manage every property that appears on the public site. New listings are saved in this
            browser and show up immediately.
          </p>
        </div>
        <div className="admin-page-actions">
          <Button variant="outline" type="button" onClick={handleReset}>
            Reset samples
          </Button>
          <Button to="/admin/listings/new">Add listing →</Button>
        </div>
      </header>

      <div className="admin-stats">
        <div className="admin-stat">
          <span>Total</span>
          <strong>{listings.length}</strong>
        </div>
        <div className="admin-stat">
          <span>For sale</span>
          <strong>{forSale}</strong>
        </div>
        <div className="admin-stat">
          <span>For rent</span>
          <strong>{forRent}</strong>
        </div>
        <div className="admin-stat">
          <span>Featured</span>
          <strong>{featured}</strong>
        </div>
      </div>

      {listings.length === 0 ? (
        <div className="admin-empty">
          <h2>No listings yet</h2>
          <p>Add your first property to populate the public listings page.</p>
          <Button to="/admin/listings/new">Create listing</Button>
        </div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Property</th>
                <th>Type</th>
                <th>Status</th>
                <th>Price</th>
                <th>Featured</th>
                <th aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              {listings.map((listing) => (
                <tr key={listing.id}>
                  <td>
                    <div className="admin-listing-cell">
                      <img src={listing.image} alt="" />
                      <div>
                        <strong>{listing.title}</strong>
                        <span>{listing.location}</span>
                      </div>
                    </div>
                  </td>
                  <td>{listing.type}</td>
                  <td>
                    <span
                      className={`admin-pill ${listing.status === 'For Sale' ? 'sale' : 'rent'}`}
                    >
                      {listing.status}
                    </span>
                  </td>
                  <td>{listing.priceLabel}</td>
                  <td>{listing.featured ? 'Yes' : '—'}</td>
                  <td>
                    <div className="admin-row-actions">
                      <Link to={`/listings/${listing.id}`} target="_blank" rel="noreferrer">
                        View
                      </Link>
                      <Link to={`/admin/listings/${listing.id}/edit`}>Edit</Link>
                      <button
                        type="button"
                        className="admin-danger"
                        onClick={() => handleDelete(listing.id, listing.title)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
