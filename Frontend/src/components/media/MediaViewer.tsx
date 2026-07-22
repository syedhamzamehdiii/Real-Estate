import { useEffect, useState, type ReactNode } from 'react'
import { useBodyScrollLock } from '../../hooks/useBodyScrollLock'
import './MediaViewer.css'

export type MediaViewerImage = {
  src: string
  alt?: string
}

export type MediaViewerProps = {
  open: boolean
  images: MediaViewerImage[]
  index?: number
  onIndexChange?: (index: number) => void
  onClose: () => void
  /** Shown in “with details” mode (default). */
  details?: ReactNode
  title?: string
}

type ViewMode = 'details' | 'image'

/**
 * Full-screen media viewer.
 * Default: image + accompanying details. Toggle to image-only fullscreen.
 */
export function MediaViewer({
  open,
  images,
  index = 0,
  onIndexChange,
  onClose,
  details,
  title = 'Photo viewer',
}: MediaViewerProps) {
  const [mode, setMode] = useState<ViewMode>('details')
  const safeIndex = images.length ? Math.min(Math.max(index, 0), images.length - 1) : 0
  const current = images[safeIndex]
  const hasMany = images.length > 1

  useBodyScrollLock(open)

  useEffect(() => {
    if (!open) setMode('details')
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (!hasMany) return
      if (e.key === 'ArrowLeft') {
        const next = safeIndex === 0 ? images.length - 1 : safeIndex - 1
        onIndexChange?.(next)
      }
      if (e.key === 'ArrowRight') {
        const next = safeIndex === images.length - 1 ? 0 : safeIndex + 1
        onIndexChange?.(next)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, hasMany, safeIndex, images.length, onClose, onIndexChange])

  if (!open || !current) return null

  const goPrev = () => {
    if (!hasMany) return
    onIndexChange?.(safeIndex === 0 ? images.length - 1 : safeIndex - 1)
  }

  const goNext = () => {
    if (!hasMany) return
    onIndexChange?.(safeIndex === images.length - 1 ? 0 : safeIndex + 1)
  }

  return (
    <div
      className={`media-viewer ${mode === 'image' ? 'is-image-only' : 'is-with-details'}`}
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onClick={onClose}
    >
      <div className="media-viewer-toolbar" onClick={(e) => e.stopPropagation()}>
        <label className="media-viewer-mode">
          <span className="sr-only">View mode</span>
          <select
            value={mode}
            onChange={(e) => setMode(e.target.value as ViewMode)}
            aria-label="View mode"
          >
            <option value="details">Image with details</option>
            <option value="image">Image only</option>
          </select>
        </label>
        <button type="button" className="media-viewer-close" aria-label="Close" onClick={onClose}>
          ×
        </button>
      </div>

      <div className="media-viewer-layout" onClick={(e) => e.stopPropagation()}>
        <div className="media-viewer-stage">
          {hasMany ? (
            <button
              type="button"
              className="media-viewer-nav is-prev"
              aria-label="Previous photo"
              onClick={goPrev}
            >
              ‹
            </button>
          ) : null}

          <img
            src={current.src}
            alt={current.alt ?? ''}
            className="media-viewer-image"
          />

          {hasMany ? (
            <button
              type="button"
              className="media-viewer-nav is-next"
              aria-label="Next photo"
              onClick={goNext}
            >
              ›
            </button>
          ) : null}

          {hasMany ? (
            <p className="media-viewer-count">
              {safeIndex + 1} / {images.length}
            </p>
          ) : null}
        </div>

        {mode === 'details' && details ? (
          <aside className="media-viewer-details">{details}</aside>
        ) : null}
      </div>
    </div>
  )
}
