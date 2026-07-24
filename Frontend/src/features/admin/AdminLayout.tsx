import { NavLink, Outlet, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { SITE } from '../../data/site'
import { useLeadClickStats } from './useLeadClickStats'
import './Admin.css'

export function AdminLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const leadStats = useLeadClickStats()

  const onLogout = () => {
    logout()
    navigate('/admin/login', { replace: true })
  }

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <span className="admin-brand-mark">EL</span>
          <div>
            <strong>{SITE.name}</strong>
            <span className="admin-brand-meta">Admin</span>
          </div>
        </div>

        <nav className="admin-nav" aria-label="Admin">
          <div className="admin-nav-group">
            <span className="admin-nav-label">Listings</span>
            <NavLink to="/admin" end>
              All listings
            </NavLink>
            <NavLink to="/admin/listings/new">Add listing</NavLink>
          </div>

          <div className="admin-nav-group">
            <span className="admin-nav-label">Resources</span>
            <NavLink to="/admin/resources" end>
              All resources
            </NavLink>
            <NavLink to="/admin/resources/new">Add resource</NavLink>
          </div>

          <div className="admin-nav-group">
            <span className="admin-nav-label">Inbox</span>
            <div className="admin-lead-stats" aria-label="Lead click totals">
              <p>
                Total call leads: <strong>{leadStats.callLeads}</strong>
              </p>
              <p>
                Total WhatsApp leads: <strong>{leadStats.whatsappLeads}</strong>
              </p>
            </div>
            <NavLink to="/admin/responses">Responses</NavLink>
          </div>
        </nav>

        <div className="admin-sidebar-foot">
          {user ? (
            <div className="admin-session">
              <span className="admin-session-email" title={user.email}>
                {user.email}
              </span>
              <button type="button" className="admin-logout" onClick={onLogout}>
                Sign out
              </button>
            </div>
          ) : null}
          <Link to="/" className="admin-back-site">
            ← View public site
          </Link>
        </div>
      </aside>

      <div className="admin-main">
        <Outlet />
      </div>
    </div>
  )
}
