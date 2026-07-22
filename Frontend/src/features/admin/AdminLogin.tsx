import { useState, type FormEvent } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { Button } from '../../components/ui'
import { useAuth } from '../../context/AuthContext'
import { SITE } from '../../data/site'
import { getLoginLockRemainingMs } from '../../lib/adminAuth'
import './Admin.css'

export function AdminLoginPage() {
  const { user, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from =
    (location.state as { from?: string } | null)?.from &&
    (location.state as { from?: string }).from !== '/admin/login'
      ? (location.state as { from: string }).from
      : '/admin'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (user) {
    return <Navigate to={from} replace />
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')

    if (!email.trim() || !password) {
      setError('Enter your email and password.')
      return
    }

    const lockMs = getLoginLockRemainingMs()
    if (lockMs > 0) {
      setError(`Too many attempts. Try again in ${Math.ceil(lockMs / 1000)}s.`)
      return
    }

    setSubmitting(true)
    try {
      await login(email, password)
      navigate(from, { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign-in failed.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="admin-login">
      <div className="admin-login-panel">
        <div className="admin-login-brand">
          <span className="admin-brand-mark">EL</span>
          <div>
            <strong>{SITE.name}</strong>
            <span className="admin-brand-meta">Admin access</span>
          </div>
        </div>

        <h1>Sign in</h1>
        <p className="admin-login-lede">
          Secure area for managing listings and resources. Only authorized agents may continue.
        </p>

        <form className="admin-login-form" onSubmit={onSubmit} noValidate>
          <div className="field">
            <label htmlFor="admin-email">Email</label>
            <input
              id="admin-email"
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@estatelineproperties.com"
              disabled={submitting}
            />
          </div>

          <div className="field">
            <div className="admin-login-label-row">
              <label htmlFor="admin-password">Password</label>
              <button
                type="button"
                className="admin-login-toggle"
                onClick={() => setShowPassword((v) => !v)}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            <input
              id="admin-password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              disabled={submitting}
            />
          </div>

          {error ? (
            <p className="admin-login-error" role="alert">
              {error}
            </p>
          ) : null}

          <Button type="submit" className="admin-login-submit" disabled={submitting}>
            {submitting ? 'Signing in…' : 'Sign in →'}
          </Button>
        </form>

        <Link to="/" className="admin-back-site admin-login-back">
          ← Back to public site
        </Link>
      </div>
    </div>
  )
}
