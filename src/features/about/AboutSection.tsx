import { Button, Reveal, SectionHead } from '../../components/ui'
import './AboutSection.css'

const POINTS = [
  'Verified ownership documents on every listing, checked before publishing.',
  'One dedicated agent from first visit through to final transfer.',
  'Transparent, all-inclusive pricing — no hidden commission surprises.',
  'Free investment consultation for first-time buyers.',
]

export function AboutSection() {
  return (
    <section className="section" id="about">
      <div className="about-wrap">
        <Reveal className="about-imgs">
          <div className="gold-ring" aria-hidden="true" />
          <img
            className="img-a"
            src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=800&auto=format&fit=crop"
            alt="Agent showing a property at dusk"
            loading="lazy"
          />
          <img
            className="img-b"
            src="https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?q=80&w=800&auto=format&fit=crop"
            alt="Bright living room interior"
            loading="lazy"
          />
        </Reveal>

        <Reveal className="about-copy">
          <SectionHead
            tag="About Estate Line Properties"
            title={
              <>
                Local knowledge.
                <br />
                Honest guidance.
              </>
            }
            description="For over a decade, we've helped families and investors navigate one of the city's most competitive markets — without the pressure tactics. Every listing on this site is personally verified by our team before it ever reaches you."
          />
          <ul className="about-list">
            {POINTS.map((point) => (
              <li key={point}>
                <span className="dot" aria-hidden="true">
                  ✓
                </span>
                {point}
              </li>
            ))}
          </ul>
          <Button to="/contact" className="about-cta">
            Meet the Team →
          </Button>
        </Reveal>
      </div>
    </section>
  )
}

export function AboutPage() {
  return (
    <div className="about-page">
      <AboutSection />
    </div>
  )
}
