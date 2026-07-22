import { Link } from 'react-router-dom'
import { useState } from 'react'
import { TiltCard } from '../../components/ui/TiltCard'
import { Reveal } from '../../components/ui'
import { MediaViewer } from '../../components/media/MediaViewer'
import { cardImageSrc } from '../../lib/imageUpload'
import type { BlogPost } from '../../types'
import './BlogCard.css'

export function BlogCard({ post }: { post: BlogPost }) {
  const [viewerOpen, setViewerOpen] = useState(false)

  return (
    <Reveal as="article" className="blog-card-wrap">
      <TiltCard className="blog-card">
        <div className="blog-card-link">
          <button
            type="button"
            className="blog-img blog-img-button"
            onClick={() => setViewerOpen(true)}
            aria-label={`View image for ${post.title}`}
          >
            <img src={cardImageSrc(post)} alt="" loading="lazy" />
          </button>
          <Link to={`/resources/${post.slug}`} className="blog-body">
            <div className="blog-cat">{post.category}</div>
            <h3>{post.title}</h3>
            <p>{post.excerpt}</p>
            <div className="blog-meta">
              <span>{post.author}</span>
              <span>{post.readMinutes} min read</span>
            </div>
          </Link>
        </div>
      </TiltCard>

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
              {post.author} · {post.readMinutes} min read
            </p>
            <p className="media-copy">{post.excerpt}</p>
            <Link
              to={`/resources/${post.slug}`}
              className="media-viewer-article-link"
              onClick={() => setViewerOpen(false)}
            >
              Read article →
            </Link>
          </>
        }
      />
    </Reveal>
  )
}
