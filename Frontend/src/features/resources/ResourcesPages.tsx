import { Link, Navigate, useParams } from 'react-router-dom'
import { useState } from 'react'
import { Reveal, SectionHead } from '../../components/ui'
import { MediaViewer } from '../../components/media/MediaViewer'
import { useResources } from '../../context/ResourcesContext'
import { BlogCard } from './BlogCard'
import { ResourcesSection } from './ResourcesSection'
import './ResourcesPages.css'

export function ResourcesPage() {
  const { posts } = useResources()

  return (
    <div className="resources-page">
      <section className="section resources-page-head">
        <Reveal>
          <SectionHead
            tag="Resources & Blogs"
            title="Guides for buyers, sellers & investors."
            description="Browse every note from our research desk. Tap any card to read the full article."
          />
        </Reveal>
        <div className="resources-grid">
          {posts.map((post) => (
            <BlogCard key={post.id} post={post} />
          ))}
        </div>
      </section>
    </div>
  )
}

export function BlogDetailPage() {
  const { slug } = useParams()
  const { getBySlug } = useResources()
  const post = getBySlug(slug ?? '')
  const [viewerOpen, setViewerOpen] = useState(false)

  if (!post) {
    return <Navigate to="/resources" replace />
  }

  return (
    <article className="blog-detail">
      <div className="blog-detail-hero">
        <img src={post.image} alt="" />
        <button
          type="button"
          className="blog-detail-open"
          aria-label="View full photo"
          onClick={() => setViewerOpen(true)}
        />
        <div className="blog-detail-overlay" />
        <div className="blog-detail-content">
          <Link to="/resources" className="back-link">
            ← All resources
          </Link>
          <div className="blog-cat">{post.category}</div>
          <h1>{post.title}</h1>
          <p className="blog-detail-meta">
            {post.author} · {post.readMinutes} min read ·{' '}
            {new Date(post.publishedAt).toLocaleDateString('en-GB', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })}
          </p>
        </div>
      </div>

      <MediaViewer
        open={viewerOpen}
        images={[{ src: post.image, alt: post.title }]}
        onClose={() => setViewerOpen(false)}
        title={post.title}
        details={
          <>
            <div className="blog-cat">{post.category}</div>
            <h2>{post.title}</h2>
            <p className="media-meta">
              {post.author} · {post.readMinutes} min read ·{' '}
              {new Date(post.publishedAt).toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </p>
            <p className="media-copy">{post.excerpt}</p>
          </>
        }
      />

      <section className="section blog-detail-body">
        <Reveal>
          <p className="lead">{post.excerpt}</p>
          <p>{post.content}</p>
        </Reveal>
      </section>
    </article>
  )
}

export { ResourcesSection }
