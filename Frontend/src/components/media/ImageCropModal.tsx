import { useCallback, useEffect, useState } from 'react'
import Cropper, { type Area } from 'react-easy-crop'
import { Button } from '../ui'
import { useBodyScrollLock } from '../../hooks/useBodyScrollLock'
import { cropImageToDataUrl, fileToOriginalDataUrl, type PreparedImage } from '../../lib/imageUpload'
import './ImageCropModal.css'

export type ImageCropModalProps = {
  open: boolean
  file: File | null
  /** Object URL for the selected file (owned by parent until close). */
  src: string | null
  title?: string
  aspect: number
  aspectLabel?: string
  onCancel: () => void
  onConfirm: (prepared: PreparedImage) => void
}

export function ImageCropModal({
  open,
  file,
  src,
  title = 'Adjust photo',
  aspect,
  aspectLabel = 'Card frame',
  onCancel,
  onConfirm,
}: ImageCropModalProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  useBodyScrollLock(open)

  useEffect(() => {
    if (!open) return
    setCrop({ x: 0, y: 0 })
    setZoom(1)
    setCroppedAreaPixels(null)
    setError('')
    setBusy(false)
  }, [open, src])

  const onCropComplete = useCallback((_area: Area, pixels: Area) => {
    setCroppedAreaPixels(pixels)
  }, [])

  if (!open || !file || !src) return null

  const handleConfirm = async () => {
    if (!croppedAreaPixels) return
    setBusy(true)
    setError('')
    try {
      const [original, thumbnail] = await Promise.all([
        fileToOriginalDataUrl(file),
        cropImageToDataUrl(src, croppedAreaPixels),
      ])
      onConfirm({ original, thumbnail })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not prepare image')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="image-crop-modal" role="dialog" aria-modal="true" aria-label={title}>
      <div className="image-crop-panel" onClick={(e) => e.stopPropagation()}>
        <header className="image-crop-head">
          <div>
            <h2>{title}</h2>
            <p>
              Drag to reposition and zoom for the {aspectLabel}. The full original is kept for the
              detail page.
            </p>
          </div>
          <button type="button" className="image-crop-close" aria-label="Cancel" onClick={onCancel}>
            ×
          </button>
        </header>

        <div className="image-crop-stage">
          <Cropper
            image={src}
            crop={crop}
            zoom={zoom}
            aspect={aspect}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
            showGrid
            objectFit="contain"
          />
        </div>

        <div className="image-crop-controls">
          <label className="image-crop-zoom">
            <span>Zoom</span>
            <input
              type="range"
              min={1}
              max={3}
              step={0.01}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
            />
          </label>
          {error ? <p className="image-crop-error">{error}</p> : null}
          <div className="image-crop-actions">
            <Button type="button" variant="outline" onClick={onCancel} disabled={busy}>
              Cancel
            </Button>
            <Button type="button" onClick={() => void handleConfirm()} disabled={busy}>
              {busy ? 'Preparing…' : 'Use photo'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
