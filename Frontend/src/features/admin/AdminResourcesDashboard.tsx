import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Button } from '../../components/ui'
import { useResources } from '../../context/ResourcesContext'
import './Admin.css'

export function AdminResourcesDashboard() {
  const { posts, featuredPosts, removePost, resetToSeed, categories } = useResources()
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

  const handleDelete = (id: string, title: string) => {
    if (window.confirm(`Remove “${title}” from Resources?`)) {
      void removePost(id)
    }
  }

  const handleReset = () => {
    if (
      window.confirm(
        'Reset all resources to the built-in samples? Added and edited articles will be cleared.',
      )
    ) {
      void resetToSeed()
    }
  }

  return (
    <div className="admin-page">
      {notice ? <p className="admin-saved admin-saved-banner">{notice}</p> : null}
      <header className="admin-page-head">
        <div>
          <p className="admin-eyebrow">Dashboard</p>
          <h1>Resources</h1>
          <p className="admin-lede">
            Manage articles on the public Resources page. New posts are saved in this browser and
            appear immediately.
          </p>
        </div>
        <div className="admin-page-actions">
          <Button variant="outline" type="button" onClick={handleReset}>
            Reset samples
          </Button>
          <Button to="/admin/resources/new">Add resource →</Button>
        </div>
      </header>

      <div className="admin-stats">
        <div className="admin-stat">
          <span>Total</span>
          <strong>{posts.length}</strong>
        </div>
        <div className="admin-stat">
          <span>Featured</span>
          <strong>{featuredPosts.length}</strong>
        </div>
        <div className="admin-stat">
          <span>Categories</span>
          <strong>{categories.length}</strong>
        </div>
        <div className="admin-stat">
          <span>Avg. read</span>
          <strong>
            {posts.length
              ? Math.round(
                  posts.reduce((sum, p) => sum + p.readMinutes, 0) / posts.length,
                )
              : 0}
            m
          </strong>
        </div>
        <div className="admin-stat">
          <span>Latest</span>
          <strong>
            {posts[0]
              ? new Date(posts[0].publishedAt).toLocaleDateString('en-GB', {
                  day: 'numeric',
                  month: 'short',
                })
              : '—'}
          </strong>
        </div>
      </div>

      {posts.length === 0 ? (
        <div className="admin-empty">
          <h2>No resources yet</h2>
          <p>Add your first article to populate the Resources page.</p>
          <Button to="/admin/resources/new">Create resource</Button>
        </div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Article</th>
                <th>Category</th>
                <th>Featured</th>
                <th>Published</th>
                <th>Read</th>
                <th aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => (
                <tr key={post.id}>
                  <td>
                    <div className="admin-listing-cell">
                      <img src={post.image} alt="" />
                      <div>
                        <strong>{post.title}</strong>
                        <span>{post.excerpt.slice(0, 72)}{post.excerpt.length > 72 ? '…' : ''}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="admin-pill sale">{post.category}</span>
                  </td>
                  <td>{post.featured ? 'Yes' : '—'}</td>
                  <td>
                    {new Date(post.publishedAt).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </td>
                  <td>{post.readMinutes} min</td>
                  <td>
                    <div className="admin-row-actions">
                      <Link to={`/resources/${post.slug}`} target="_blank" rel="noreferrer">
                        View
                      </Link>
                      <Link to={`/admin/resources/${post.id}/edit`}>Edit</Link>
                      <button
                        type="button"
                        className="admin-danger"
                        onClick={() => handleDelete(post.id, post.title)}
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
