import { Link } from 'react-router-dom'
import { TiltCard } from '../../components/ui/TiltCard'
import { Reveal } from '../../components/ui'
import type { BlogPost } from '../../types'
import './BlogCard.css'

export function BlogCard({ post }: { post: BlogPost }) {
  return (
    <Reveal as="article" className="blog-card-wrap">
      <TiltCard className="blog-card">
        <Link to={`/resources/${post.slug}`} className="blog-card-link">
          <div className="blog-img">
            <img src={post.image} alt="" loading="lazy" />
          </div>
          <div className="blog-body">
            <div className="blog-cat">{post.category}</div>
            <h3>{post.title}</h3>
            <p>{post.excerpt}</p>
            <div className="blog-meta">
              <span>{post.author}</span>
              <span>{post.readMinutes} min read</span>
            </div>
          </div>
        </Link>
      </TiltCard>
    </Reveal>
  )
}
