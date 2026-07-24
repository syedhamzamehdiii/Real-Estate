import { Fragment, useEffect, useMemo, useState } from 'react'
import {
  deleteInquiry,
  subscribeInquiries,
  updateInquiryStatus,
  type InquiryDocument,
  type InquiryStatus,
} from '@estate-line/backend/client'
import { firebaseReady } from '../../firebase/config'
import { Button } from '../../components/ui'
import { useLeadClickStats } from './useLeadClickStats'
import './Admin.css'

type StatusFilter = 'all' | InquiryStatus

function formatInquiryDate(value: unknown): string {
  if (!value) return '—'
  let date: Date | null = null
  if (value instanceof Date) date = value
  else if (typeof value === 'object' && value !== null && 'toDate' in value) {
    const withToDate = value as { toDate: () => Date }
    try {
      date = withToDate.toDate()
    } catch {
      date = null
    }
  } else if (typeof value === 'object' && value !== null && 'seconds' in value) {
    const seconds = (value as { seconds: number }).seconds
    if (typeof seconds === 'number') date = new Date(seconds * 1000)
  }
  if (!date || Number.isNaN(date.getTime())) return '—'
  return date.toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function AdminResponses() {
  const [items, setItems] = useState<InquiryDocument[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState<StatusFilter>('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)
  const leadStats = useLeadClickStats()

  useEffect(() => {
    if (!firebaseReady) {
      setLoading(false)
      setError('Firebase is not configured, so contact responses cannot be loaded.')
      return
    }

    setLoading(true)
    const unsub = subscribeInquiries(
      (next) => {
        setItems(next)
        setLoading(false)
        setError('')
      },
      (err) => {
        setError(err.message || 'Could not load responses.')
        setLoading(false)
      },
    )
    return () => unsub()
  }, [])

  const counts = useMemo(() => {
    return {
      all: items.length,
      new: items.filter((i) => i.status === 'new').length,
      read: items.filter((i) => i.status === 'read').length,
      archived: items.filter((i) => i.status === 'archived').length,
    }
  }, [items])

  const visible = useMemo(() => {
    if (filter === 'all') return items
    return items.filter((i) => i.status === filter)
  }, [items, filter])

  const setStatus = async (id: string, status: InquiryStatus) => {
    setBusyId(id)
    try {
      await updateInquiryStatus(id, status)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not update response status.')
    } finally {
      setBusyId(null)
    }
  }

  const removeResponse = async (item: InquiryDocument) => {
    if (!window.confirm(`Delete response from “${item.name}”? This cannot be undone.`)) return
    setBusyId(item.id)
    try {
      await deleteInquiry(item.id)
      setExpandedId((prev) => (prev === item.id ? null : prev))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not delete response.')
    } finally {
      setBusyId(null)
    }
  }

  const openMessage = (item: InquiryDocument) => {
    setExpandedId((prev) => (prev === item.id ? null : item.id))
    if (item.status === 'new') {
      void setStatus(item.id, 'read')
    }
  }

  return (
    <div className="admin-page">
      <header className="admin-page-head">
        <div>
          <p className="admin-eyebrow">Inbox</p>
          <h1>Responses</h1>
          <p className="admin-lede">
            Every message submitted from the public Contact page appears here for follow-up.
          </p>
        </div>
      </header>

      <div className="admin-stats admin-lead-stat-row">
        <div className="admin-stat">
          <span>Total call leads</span>
          <strong>{leadStats.callLeads}</strong>
        </div>
        <div className="admin-stat">
          <span>Total WhatsApp leads</span>
          <strong>{leadStats.whatsappLeads}</strong>
        </div>
      </div>

      <div className="admin-stats">
        <div className="admin-stat">
          <span>Total</span>
          <strong>{counts.all}</strong>
        </div>
        <div className="admin-stat">
          <span>New</span>
          <strong>{counts.new}</strong>
        </div>
        <div className="admin-stat">
          <span>Read</span>
          <strong>{counts.read}</strong>
        </div>
        <div className="admin-stat">
          <span>Archived</span>
          <strong>{counts.archived}</strong>
        </div>
      </div>

      <div className="admin-response-filters" role="tablist" aria-label="Filter responses">
        {(
          [
            ['all', 'All'],
            ['new', 'New'],
            ['read', 'Read'],
            ['archived', 'Archived'],
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            type="button"
            role="tab"
            aria-selected={filter === value}
            className={`admin-response-filter${filter === value ? ' is-active' : ''}`}
            onClick={() => setFilter(value)}
          >
            {label}
            <span>{counts[value]}</span>
          </button>
        ))}
      </div>

      {error ? (
        <p className="field-error admin-form-banner" role="alert">
          {error}
        </p>
      ) : null}

      {loading ? (
        <div className="admin-empty">
          <h2>Loading responses…</h2>
          <p>Fetching messages from the contact form.</p>
        </div>
      ) : visible.length === 0 ? (
        <div className="admin-empty">
          <h2>No responses yet</h2>
          <p>
            {filter === 'all'
              ? 'When someone submits the Contact page form, their message will show up here.'
              : `No ${filter} responses right now.`}
          </p>
          {filter !== 'all' ? (
            <Button type="button" variant="outline" onClick={() => setFilter('all')}>
              Show all
            </Button>
          ) : null}
        </div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table admin-responses-table">
            <thead>
              <tr>
                <th>From</th>
                <th>Interest</th>
                <th>Received</th>
                <th>Status</th>
                <th aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              {visible.map((item) => {
                const open = expandedId === item.id
                return (
                  <Fragment key={item.id}>
                    <tr
                      className={`admin-response-row${item.status === 'new' ? ' is-new' : ''}${open ? ' is-open' : ''}`}
                    >
                      <td>
                        <div className="admin-listing-cell admin-response-from">
                          <strong>{item.name}</strong>
                          <span>
                            <a href={`mailto:${item.email}`}>{item.email}</a>
                            {' · '}
                            <a href={`tel:${item.phone}`}>{item.phone}</a>
                          </span>
                        </div>
                      </td>
                      <td>{item.interest}</td>
                      <td>{formatInquiryDate(item.createdAt)}</td>
                      <td>
                        <span className={`admin-pill admin-pill-status ${item.status}`}>
                          {item.status}
                        </span>
                      </td>
                      <td>
                        <div className="admin-row-actions">
                          <button type="button" onClick={() => openMessage(item)}>
                            {open ? 'Hide' : 'View'}
                          </button>
                          {item.status !== 'read' && item.status !== 'archived' ? (
                            <button
                              type="button"
                              disabled={busyId === item.id}
                              onClick={() => void setStatus(item.id, 'read')}
                            >
                              Mark read
                            </button>
                          ) : null}
                          {item.status !== 'archived' ? (
                            <button
                              type="button"
                              disabled={busyId === item.id}
                              onClick={() => void setStatus(item.id, 'archived')}
                            >
                              Archive
                            </button>
                          ) : (
                            <button
                              type="button"
                              disabled={busyId === item.id}
                              onClick={() => void setStatus(item.id, 'read')}
                            >
                              Unarchive
                            </button>
                          )}
                          <button
                            type="button"
                            className="admin-danger"
                            disabled={busyId === item.id}
                            onClick={() => void removeResponse(item)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                    {open ? (
                      <tr className="admin-response-detail-row">
                        <td colSpan={5}>
                          <div className="admin-response-detail">
                            <p className="admin-response-label">Message</p>
                            <p className="admin-response-message">{item.message}</p>
                            <div className="admin-response-detail-actions">
                              <Button href={`mailto:${item.email}?subject=Re: Estate Line inquiry`}>
                                Reply by email →
                              </Button>
                              <Button
                                variant="outline"
                                href={`https://wa.me/${item.phone.replace(/\D/g, '')}?text=${encodeURIComponent(`Hi ${item.name}, thanks for contacting Estate Line.`)}`}
                              >
                                WhatsApp
                              </Button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ) : null}
                  </Fragment>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
