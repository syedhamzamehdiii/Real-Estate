import { useState, type FormEvent } from 'react'
import { Button, Reveal, SectionHead } from '../../components/ui'
import { SITE } from '../../data/site'
import type { ContactFormData } from '../../types'
import { firebaseReady } from '../../firebase/config'
import { createInquiry } from '@estate-line/backend/client'
import { onCallLeadClick, onWhatsAppLeadClick } from '../../lib/leadTracking'
import './ContactPage.css'

const empty: ContactFormData = {
  name: '',
  email: '',
  phone: '',
  message: '',
  interest: 'Buying a home',
}

export function CtaBanner() {
  return (
    <Reveal className="cta-banner">
      <h2>Ready to see a property in person?</h2>
      <Button to="/contact">Schedule a Visit →</Button>
    </Reveal>
  )
}

export function ContactPage() {
  const [form, setForm] = useState<ContactFormData>(empty)
  const [errors, setErrors] = useState<Partial<Record<keyof ContactFormData, string>>>({})
  const [submitted, setSubmitted] = useState(false)

  const setField = (key: keyof ContactFormData, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => ({ ...prev, [key]: undefined }))
  }

  const validate = () => {
    const next: typeof errors = {}
    if (!form.name.trim()) next.name = 'Please enter your name'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) next.email = 'Enter a valid email'
    if (form.phone.replace(/\D/g, '').length < 10) next.phone = 'Enter a valid phone number'
    if (form.message.trim().length < 10) next.message = 'Tell us a bit more (10+ characters)'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    if (!firebaseReady) {
      setErrors((prev) => ({
        ...prev,
        message: 'Could not send your message. Please try again or call us.',
      }))
      return
    }
    try {
      await createInquiry(form)
      setSubmitted(true)
      setForm(empty)
    } catch {
      setErrors((prev) => ({
        ...prev,
        message: 'Could not send your message. Please try again or call us.',
      }))
    }
  }

  return (
    <div className="contact-page">
      <section className="section">
        <Reveal>
          <SectionHead
            tag="Contact"
            title="Book a visit or ask anything."
            description="Share a few details and an Estate Line agent will follow up within one business day — or reach us instantly by call or WhatsApp."
          />
        </Reveal>

        <div className="contact-grid">
          <Reveal className="contact-form-wrap">
            {submitted ? (
              <div className="contact-success" role="status">
                <h3>Thank you — we received your message.</h3>
                <p>
                  An agent will contact you shortly. Prefer to talk now? Call{' '}
                  <a href={`tel:${SITE.phone}`} onClick={onCallLeadClick}>
                    {SITE.phoneDisplay}
                  </a>{' '}
                  or message us on WhatsApp.
                </p>
                <Button type="button" onClick={() => setSubmitted(false)}>
                  Send another message
                </Button>
              </div>
            ) : (
              <form className="contact-form" onSubmit={onSubmit} noValidate>
                <div className="field">
                  <label htmlFor="name">Full name</label>
                  <input
                    id="name"
                    value={form.name}
                    onChange={(e) => setField('name', e.target.value)}
                    autoComplete="name"
                    required
                  />
                  {errors.name ? <span className="field-error">{errors.name}</span> : null}
                </div>

                <div className="field-row">
                  <div className="field">
                    <label htmlFor="email">Email</label>
                    <input
                      id="email"
                      type="email"
                      value={form.email}
                      onChange={(e) => setField('email', e.target.value)}
                      autoComplete="email"
                      required
                    />
                    {errors.email ? <span className="field-error">{errors.email}</span> : null}
                  </div>
                  <div className="field">
                    <label htmlFor="phone">Phone</label>
                    <input
                      id="phone"
                      type="tel"
                      value={form.phone}
                      onChange={(e) => setField('phone', e.target.value)}
                      autoComplete="tel"
                      required
                    />
                    {errors.phone ? <span className="field-error">{errors.phone}</span> : null}
                  </div>
                </div>

                <div className="field">
                  <label htmlFor="interest">I am interested in</label>
                  <select
                    id="interest"
                    value={form.interest}
                    onChange={(e) => setField('interest', e.target.value)}
                  >
                    <option>Buying a home</option>
                    <option>Renting</option>
                    <option>Selling / listing</option>
                    <option>Investment advice</option>
                    <option>Something else</option>
                  </select>
                </div>

                <div className="field">
                  <label htmlFor="message">Message</label>
                  <textarea
                    id="message"
                    value={form.message}
                    onChange={(e) => setField('message', e.target.value)}
                    placeholder="Which area or listing are you looking at?"
                    required
                  />
                  {errors.message ? <span className="field-error">{errors.message}</span> : null}
                </div>

                <Button type="submit">Send message →</Button>
              </form>
            )}
          </Reveal>

          <Reveal className="contact-aside">
            <h3>Visit or call</h3>
            <ul>
              <li>
                <span>Office</span>
                <strong>{SITE.address}</strong>
              </li>
              <li>
                <span>Phone</span>
                <strong>
                  <a href={`tel:${SITE.phone}`} onClick={onCallLeadClick}>
                    {SITE.phoneDisplay}
                  </a>
                </strong>
              </li>
              <li>
                <span>Email</span>
                <strong>
                  <a href={`mailto:${SITE.email}`}>{SITE.email}</a>
                </strong>
              </li>
            </ul>
            <Button
              variant="outline"
              href={`https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent('Hi Estate Line — I would like to book a visit.')}`}
              onClick={onWhatsAppLeadClick}
            >
              Chat on WhatsApp
            </Button>
          </Reveal>
        </div>
      </section>
    </div>
  )
}
