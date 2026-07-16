import { useEffect, useRef, useState } from 'react'
import { Reveal, SectionHead } from '../../components/ui'
import { blogs } from '../../data/blogs'
import { BlogCard } from './BlogCard'
import './BlogSlider.css'

export function ResourcesSection() {
  const trackRef = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(0)
  const paused = useRef(false)

  const cardStep = () => {
    const track = trackRef.current
    if (!track?.firstElementChild) return 300
    const card = track.firstElementChild as HTMLElement
    const styles = getComputedStyle(track)
    const gap = parseFloat(styles.columnGap || styles.gap || '28') || 28
    return card.getBoundingClientRect().width + gap
  }

  const scrollByCards = (dir: number) => {
    trackRef.current?.scrollBy({ left: dir * cardStep(), behavior: 'smooth' })
  }

  const scrollToIndex = (i: number) => {
    const track = trackRef.current
    if (!track) return
    track.scrollTo({ left: i * cardStep(), behavior: 'smooth' })
  }

  useEffect(() => {
    const track = trackRef.current
    if (!track) return

    let timer: number
    const updateDot = () => {
      window.clearTimeout(timer)
      timer = window.setTimeout(() => {
        const idx = Math.round(track.scrollLeft / cardStep())
        setActive(Math.min(Math.max(idx, 0), blogs.length - 1))
      }, 80)
    }

    track.addEventListener('scroll', updateDot, { passive: true })
    return () => {
      track.removeEventListener('scroll', updateDot)
      window.clearTimeout(timer)
    }
  }, [])

  useEffect(() => {
    const id = window.setInterval(() => {
      if (paused.current) return
      const track = trackRef.current
      if (!track) return
      const maxScroll = track.scrollWidth - track.clientWidth
      if (track.scrollLeft >= maxScroll - 4) {
        track.scrollTo({ left: 0, behavior: 'smooth' })
      } else {
        track.scrollBy({ left: cardStep(), behavior: 'smooth' })
      }
    }, 4500)

    return () => window.clearInterval(id)
  }, [])

  return (
    <section className="section resources" id="resources">
      <Reveal>
        <SectionHead
          tag="Resources & Blogs"
          title="Read before you invest."
          description="Market notes, buying guides and investment insight from our in-house research desk — updated monthly."
        />
      </Reveal>

      <div
        className="slider"
        onMouseEnter={() => {
          paused.current = true
        }}
        onMouseLeave={() => {
          paused.current = false
        }}
        onTouchStart={() => {
          paused.current = true
        }}
        onTouchEnd={() => {
          paused.current = false
        }}
      >
        <div className="blog-grid" ref={trackRef} id="blogs">
          {blogs.map((post) => (
            <BlogCard key={post.id} post={post} />
          ))}
        </div>
        <button
          type="button"
          className="slider-arrow prev"
          aria-label="Previous articles"
          onClick={() => scrollByCards(-1)}
        >
          ‹
        </button>
        <button
          type="button"
          className="slider-arrow next"
          aria-label="Next articles"
          onClick={() => scrollByCards(1)}
        >
          ›
        </button>
      </div>

      <div className="slider-dots" role="tablist" aria-label="Blog slides">
        {blogs.map((post, i) => (
          <button
            key={post.id}
            type="button"
            role="tab"
            aria-selected={active === i}
            className={active === i ? 'active' : ''}
            aria-label={`Go to article ${i + 1}`}
            onClick={() => scrollToIndex(i)}
          />
        ))}
      </div>
    </section>
  )
}
