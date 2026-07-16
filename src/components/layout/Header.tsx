import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { NAV_LINKS } from '../../data/site'
import { useBodyScrollLock } from '../../hooks/useBodyScrollLock'
import { useScrolled } from '../../hooks/useScrolled'
import { Button } from '../ui'
import './Header.css'

export function Header() {
  const scrolled = useScrolled()
  const [menuOpen, setMenuOpen] = useState(false)
  useBodyScrollLock(menuOpen)

  const close = () => setMenuOpen(false)

  return (
    <>
      <header className={`site-header ${scrolled ? 'scrolled' : ''}`}>
        <Link to="/" className="logo" onClick={close}>
          <img className="logo-mark" src="/logo.png" alt="" width={38} height={38} />
          <span className="logo-text">
            Estate <em>Line</em>
            <small>Properties</small>
          </span>
        </Link>

        <nav className="desktop-nav" aria-label="Primary">
          <ul>
            {NAV_LINKS.map((link) => (
              <li key={link.to}>
                <NavLink to={link.to} end={link.to === '/'}>
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="nav-right">
          <Button variant="outline" to="/contact" className="nav-contact">
            Contact
          </Button>
          <Button to="/contact">Book a Visit →</Button>
        </div>

        <button
          type="button"
          className={`burger ${menuOpen ? 'open' : ''}`}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          onClick={() => setMenuOpen((v) => !v)}
        >
          <span />
          <span />
          <span />
        </button>
      </header>

      <div
        id="mobile-menu"
        className={`mobile-menu ${menuOpen ? 'open' : ''}`}
        aria-hidden={!menuOpen}
      >
        {NAV_LINKS.map((link) => (
          <NavLink key={link.to} to={link.to} end={link.to === '/'} onClick={close}>
            {link.label}
          </NavLink>
        ))}
        <Button to="/contact" onClick={close}>
          Book a Visit
        </Button>
      </div>
    </>
  )
}
