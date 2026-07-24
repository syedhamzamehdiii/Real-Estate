import { useMemo } from 'react'
import { Button } from '../../components/ui'
import { SITE } from '../../data/site'
import { SearchPanel } from './SearchPanel'
import './Hero.css'

export function Hero() {
  const stars = useMemo(
    () =>
      Array.from({ length: 48 }, (_, i) => ({
        id: i,
        left: `${(i * 37) % 100}%`,
        top: `${(i * 53) % 70}%`,
        delay: `${(i % 8) * 0.4}s`,
        size: `${(i % 3) + 1}px`,
      })),
    [],
  )

  return (
    <section className="hero" id="home">
      <div className="hero-photo">
        <img
          src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=1600&auto=format&fit=crop"
          alt=""
          fetchPriority="high"
        />
      </div>
      <div className="hero-overlay" />
      <div className="stars" aria-hidden="true">
        {stars.map((s) => (
          <div
            key={s.id}
            className="star"
            style={{
              left: s.left,
              top: s.top,
              animationDelay: s.delay,
              width: s.size,
              height: s.size,
            }}
          />
        ))}
      </div>

      <svg className="hero-silhouette" viewBox="0 0 1440 260" preserveAspectRatio="none" aria-hidden="true">
        <path
          fill="#0d2230"
          opacity="0.9"
          d="M0,140 L100,90 L180,150 L260,60 L340,160 L420,100 L520,180 L600,80 L700,170 L800,110 L900,190 L1000,120 L1100,200 L1200,130 L1300,190 L1440,150 L1440,260 L0,260 Z"
        />
        <path
          fill="#061826"
          d="M0,190 L120,150 L220,200 L320,140 L420,210 L540,160 L640,220 L760,170 L880,225 L1000,175 L1120,230 L1240,180 L1440,220 L1440,260 L0,260 Z"
        />
      </svg>

      <div className="hero-content">
        <p className="brand-mark">{SITE.name}</p>
        <div className="eyebrow">{SITE.eyebrow}</div>
        <h1 className="hero-title">
          Find your home
          <br />
          in the last light of <em>dusk.</em>
        </h1>
        <p className="hero-sub">{SITE.heroSub}</p>
        <div className="hero-actions">
          <Button to="/listings">Explore Listings →</Button>
          <Button variant="outline" to="/contact">
            Talk to an Agent
          </Button>
        </div>
        <SearchPanel />
      </div>

      <div className="scroll-cue" aria-hidden="true">
        <div className="line" />
        Scroll to explore
      </div>
    </section>
  )
}
