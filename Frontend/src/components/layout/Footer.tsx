import { Link } from 'react-router-dom'
import { NAV_LINKS, SITE } from '../../data/site'
import './Footer.css'

export function Footer() {
  return (
    <footer id="contact-footer" className="site-footer">
      <div className="footer-grid">
        <div className="footer-brand">
          <Link to="/" className="logo">
            <img className="logo-mark" src="/logo.png" alt="" width={38} height={38} />
            <span className="logo-text">
              Estate <em>Line</em>
              <small>Properties</small>
            </span>
          </Link>
          <p>
            Local experts, honest guidance — helping you find home in Lahore&apos;s most
            sought-after neighborhoods since {SITE.foundedYear}.
          </p>
          <div className="social">
            <a href="https://www.linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
              in
            </a>
            <a href="https://www.youtube.com" target="_blank" rel="noopener noreferrer" aria-label="YouTube">
              yt
            </a>
            <a
              href={`https://wa.me/${SITE.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp"
            >
              wa
            </a>
            <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              ig
            </a>
          </div>
        </div>

        <div>
          <h4>Explore</h4>
          <ul>
            {NAV_LINKS.map((link) => (
              <li key={link.to}>
                <Link to={link.to}>{link.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4>Listings</h4>
          <ul>
            <li>
              <Link to="/listings?type=House">Houses for Sale</Link>
            </li>
            <li>
              <Link to="/listings?type=Plot">Plots</Link>
            </li>
            <li>
              <Link to="/listings?type=Apartment">Apartments</Link>
            </li>
            <li>
              <Link to="/listings?type=Commercial">Commercial</Link>
            </li>
          </ul>
        </div>

        <div>
          <h4>Contact</h4>
          <ul>
            <li>{SITE.address}</li>
            <li>
              <a href={`tel:${SITE.phone}`}>{SITE.phoneDisplay}</a>
            </li>
            <li>
              <a href={`mailto:${SITE.email}`}>{SITE.email}</a>
            </li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} {SITE.name}. All rights reserved.</span>
        <span>Privacy Policy · Terms of Service</span>
      </div>
    </footer>
  )
}
