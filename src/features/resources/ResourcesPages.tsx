import { Link, Navigate, useParams } from 'react-router-dom'
import { Reveal, SectionHead } from '../../components/ui'
import { blogs } from '../../data/blogs'
import { BlogCard } from './BlogCard'
import { ResourcesSection } from './ResourcesSection'
import './ResourcesPages.css'

export function ResourcesPage() {
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
          {blogs.map((post) => (
            <BlogCard key={post.id} post={post} />
          ))}
        </div>
      </section>
    </div>
  )
}

export function BlogDetailPage() {
  const { slug } = useParams()
  const post = blogs.find((b) => b.slug === slug)

  if (!post) {
    return <Navigate to="/resources" replace />
  }

  return (
    <article className="blog-detail">
      <div className="blog-detail-hero">
        <img src={post.image} alt="" />
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
