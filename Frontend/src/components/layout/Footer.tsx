import { Link } from 'react-router-dom'
import { NAV_LINKS, SITE } from '../../data/site'
import { onCallLeadClick, onWhatsAppLeadClick } from '../../lib/leadTracking'
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
          <p>{SITE.footerBlurb}</p>
          <div className="social">
            <a
              href={SITE.facebook}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
            >
              <FacebookIcon />
            </a>
            <a
              href={SITE.instagram}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
            >
              <InstagramIcon />
            </a>
            <a
              href={SITE.youtube}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="YouTube"
            >
              <YouTubeIcon />
            </a>
            <a
              href={`https://wa.me/${SITE.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp"
              onClick={onWhatsAppLeadClick}
            >
              <WhatsAppIcon />
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
              <a href={`tel:${SITE.phone}`} onClick={onCallLeadClick}>
                {SITE.phoneDisplay}
              </a>
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

function FacebookIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M14 8.2V6.1c0-.6.1-1 .9-1H17V2h-2.6C11.7 2 11 3.7 11 5.9v2.3H9v3.1h2V22h3v-10.7h2.5l.4-3.1H14Z" />
    </svg>
  )
}

function InstagramIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 7.2A4.8 4.8 0 1 0 12 16.8 4.8 4.8 0 0 0 12 7.2Zm0 7.9a3.1 3.1 0 1 1 0-6.2 3.1 3.1 0 0 1 0 6.2Zm6.1-8.1a1.1 1.1 0 1 1-2.2 0 1.1 1.1 0 0 1 2.2 0ZM21.5 8.1a6.5 6.5 0 0 0-1.8-4.6 6.5 6.5 0 0 0-4.6-1.8c-1.8-.1-7.3-.1-9.1 0A6.5 6.5 0 0 0 1.4 3.5 6.5 6.5 0 0 0-.4 8.1c-.1 1.8-.1 7.3 0 9.1a6.5 6.5 0 0 0 1.8 4.6 6.5 6.5 0 0 0 4.6 1.8c1.8.1 7.3.1 9.1 0a6.5 6.5 0 0 0 4.6-1.8 6.5 6.5 0 0 0 1.8-4.6c.1-1.8.1-7.3 0-9.1Zm-2.1 11a3.9 3.9 0 0 1-2.2 2.2c-1.5.6-5.1.5-6.8.5s-5.3.1-6.8-.5a3.9 3.9 0 0 1-2.2-2.2c-.6-1.5-.5-5.1-.5-6.8s-.1-5.3.5-6.8A3.9 3.9 0 0 1 5.2 3.3c1.5-.6 5.1-.5 6.8-.5s5.3-.1 6.8.5a3.9 3.9 0 0 1 2.2 2.2c.6 1.5.5 5.1.5 6.8s.1 5.3-.5 6.8Z" />
    </svg>
  )
}

function YouTubeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2 31.5 31.5 0 0 0 0 12a31.5 31.5 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1A31.5 31.5 0 0 0 24 12a31.5 31.5 0 0 0-.5-5.8ZM9.8 15.5v-7l6.3 3.5-6.3 3.5Z" />
    </svg>
  )
}

function WhatsAppIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20.5 3.5A11 11 0 0 0 3.1 17.8L2 22l4.3-1.1A11 11 0 1 0 20.5 3.5Zm-8.5 17a9 9 0 0 1-4.6-1.3l-.3-.2-2.6.7.7-2.5-.2-.3A9 9 0 1 1 12 20.5Zm5-6.7c-.3-.1-1.6-.8-1.9-.9-.3-.1-.5-.1-.7.1l-.9 1.1c-.2.2-.3.2-.6.1a7.4 7.4 0 0 1-2.2-1.4 8 8 0 0 1-1.5-1.8c-.2-.3 0-.4.1-.6l.5-.6c.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5l-.8-2c-.2-.5-.4-.5-.6-.5h-.5c-.2 0-.5.1-.7.3-.3.3-1 1-1 2.4s1 2.8 1.2 3c.1.2 2 3.1 4.9 4.3 1.8.8 2.2.7 2.6.6.4-.1 1.4-.6 1.6-1.1.2-.6.2-1 .1-1.1-.1-.1-.3-.2-.6-.3Z" />
    </svg>
  )
}
