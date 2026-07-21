import { useRef, useState, type ChangeEvent, type FormEvent } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { Button } from '../../components/ui'
import { useListings } from '../../context/ListingsContext'
import { PROPERTY_TYPES } from '../../data/site'
import { fileToDataUrl, filesToDataUrls } from '../../lib/imageUpload'
import { slugifyId } from '../../lib/listingsStorage'
import type { Listing, ListingDetails, PropertyStatus, PropertyType } from '../../types'
import './Admin.css'

const NEW_MAIN_AREA = '__new__'

type FormState = {
  title: string
  location: string
  locationKey: string
  newMainArea: string
  type: PropertyType
  status: PropertyStatus
  priceLabel: string
  priceValue: string
  image: string
  gallery: string[]
  beds: string
  baths: string
  sizeLabel: string
  description: string
  featured: boolean
  replaceFeaturedId: string
  includeDetails: boolean
  detailBeds: string
  detailBaths: string
  floors: string
  yearBuilt: string
  parking: string
  kitchen: string
  furnishing: string
  facing: string
  possession: string
  plotSize: string
  builtArea: string
  servantQuarters: string
  featuresText: string
  notes: string
}

const emptyForm = (defaultMainArea = ''): FormState => ({
  title: '',
  location: '',
  locationKey: defaultMainArea,
  newMainArea: '',
  type: 'House',
  status: 'For Sale',
  priceLabel: '',
  priceValue: '',
  image: '',
  gallery: [],
  beds: '',
  baths: '',
  sizeLabel: '',
  description: '',
  featured: false,
  replaceFeaturedId: '',
  includeDetails: false,
  detailBeds: '',
  detailBaths: '',
  floors: '',
  yearBuilt: '',
  parking: '',
  kitchen: '',
  furnishing: '',
  facing: '',
  possession: '',
  plotSize: '',
  builtArea: '',
  servantQuarters: '',
  featuresText: '',
  notes: '',
})

function listingToForm(listing: Listing): FormState {
  const d = listing.details
  return {
    title: listing.title,
    location: listing.location,
    locationKey: listing.locationKey,
    newMainArea: '',
    type: listing.type,
    status: listing.status,
    priceLabel: listing.priceLabel,
    priceValue: String(listing.priceValue),
    image: listing.image,
    gallery: [...(listing.images ?? [])],
    beds: listing.beds != null ? String(listing.beds) : '',
    baths: listing.baths != null ? String(listing.baths) : '',
    sizeLabel: listing.sizeLabel,
    description: listing.description,
    featured: Boolean(listing.featured),
    replaceFeaturedId: '',
    includeDetails: Boolean(listing.details),
    detailBeds: d?.beds != null ? String(d.beds) : '',
    detailBaths: d?.baths != null ? String(d.baths) : '',
    floors: d?.floors != null ? String(d.floors) : '',
    yearBuilt: d?.yearBuilt != null ? String(d.yearBuilt) : '',
    parking: d?.parking ?? '',
    kitchen: d?.kitchen ?? '',
    furnishing: d?.furnishing ?? '',
    facing: d?.facing ?? '',
    possession: d?.possession ?? '',
    plotSize: d?.plotSize ?? '',
    builtArea: d?.builtArea ?? '',
    servantQuarters: d?.servantQuarters ?? '',
    featuresText: (d?.features ?? []).join('\n'),
    notes: d?.notes ?? '',
  }
}

function parseOptionalNumber(value: string): number | undefined {
  const trimmed = value.trim()
  if (!trimmed) return undefined
  const n = Number(trimmed)
  return Number.isFinite(n) ? n : undefined
}

function linesToList(text: string): string[] | undefined {
  const items = text
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean)
  return items.length ? items : undefined
}

function buildDetails(form: FormState): ListingDetails | undefined {
  if (!form.includeDetails) return undefined

  const details: ListingDetails = {
    beds: parseOptionalNumber(form.detailBeds),
    baths: parseOptionalNumber(form.detailBaths),
    floors: parseOptionalNumber(form.floors),
    yearBuilt: parseOptionalNumber(form.yearBuilt),
    parking: form.parking.trim() || undefined,
    kitchen: form.kitchen.trim() || undefined,
    furnishing: form.furnishing.trim() || undefined,
    facing: form.facing.trim() || undefined,
    possession: form.possession.trim() || undefined,
    plotSize: form.plotSize.trim() || undefined,
    builtArea: form.builtArea.trim() || undefined,
    servantQuarters: form.servantQuarters.trim() || undefined,
    features: linesToList(form.featuresText),
    notes: form.notes.trim() || undefined,
  }

  const hasAny = Object.values(details).some((v) =>
    Array.isArray(v) ? v.length > 0 : v != null && v !== '',
  )
  return hasAny ? details : undefined
}

function resolveMainArea(form: FormState): { locationKey: string; mainAreaLabel: string } {
  if (form.locationKey === NEW_MAIN_AREA) {
    const label = form.newMainArea.trim()
    return { locationKey: slugifyId(label), mainAreaLabel: label }
  }
  return {
    locationKey: form.locationKey,
    mainAreaLabel: form.newMainArea.trim(),
  }
}

function buildListingPayload(form: FormState, locationKey: string): Omit<Listing, 'id'> {
  return {
    title: form.title.trim(),
    location: form.location.trim(),
    locationKey,
    type: form.type,
    status: form.status,
    priceLabel: form.priceLabel.trim(),
    priceValue: Number(form.priceValue),
    image: form.image.trim(),
    images: form.gallery.length ? form.gallery : undefined,
    beds: parseOptionalNumber(form.beds),
    baths: parseOptionalNumber(form.baths),
    sizeLabel: form.sizeLabel.trim(),
    description: form.description.trim(),
    featured: form.featured,
    details: buildDetails(form),
  }
}

type Errors = Partial<Record<keyof FormState | 'form' | 'upload', string>>

function validate(
  form: FormState,
  opts: { needsFeaturedReplace: boolean },
): Errors {
  const errors: Errors = {}
  if (!form.title.trim()) errors.title = 'Title is required'
  if (!form.location.trim()) errors.location = 'Location is required'
  if (form.locationKey === NEW_MAIN_AREA) {
    if (!form.newMainArea.trim()) errors.newMainArea = 'Enter a main area name'
  } else if (!form.locationKey) {
    errors.locationKey = 'Choose a main area'
  }
  if (!form.priceLabel.trim()) errors.priceLabel = 'Display price is required'
  if (!form.priceValue.trim() || !Number.isFinite(Number(form.priceValue))) {
    errors.priceValue = 'Enter a numeric price value'
  }
  if (!form.image.trim()) errors.image = 'Cover photo is required'
  if (!form.sizeLabel.trim()) errors.sizeLabel = 'Size label is required'
  if (!form.description.trim()) errors.description = 'Description is required'
  if (opts.needsFeaturedReplace && !form.replaceFeaturedId) {
    errors.replaceFeaturedId = 'Choose which featured listing to replace'
  }
  return errors
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return <span className="field-error">{message}</span>
}

export function AdminListingCreatePage() {
  return <ListingEditor mode="create" />
}

export function AdminListingEditPage() {
  const { id } = useParams()
  const { getById } = useListings()
  const listing = id ? getById(id) : undefined
  if (!listing) {
    return <Navigate to="/admin" replace />
  }
  return <ListingEditor key={listing.id} mode="edit" listing={listing} />
}

function ListingEditor({
  mode,
  listing,
}: {
  mode: 'create' | 'edit'
  listing?: Listing
}) {
  const navigate = useNavigate()
  const { addListing, updateListing, mainAreas, featuredListings } = useListings()
  const [form, setForm] = useState<FormState>(() =>
    listing ? listingToForm(listing) : emptyForm(mainAreas[0]?.value ?? ''),
  )
  const [errors, setErrors] = useState<Errors>({})
  const [savedFlash, setSavedFlash] = useState(false)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState<'cover' | 'gallery' | null>(null)
  const coverInputRef = useRef<HTMLInputElement>(null)
  const galleryInputRef = useRef<HTMLInputElement>(null)

  const wasAlreadyFeatured = Boolean(listing?.featured)
  const replaceCandidates = featuredListings.filter((l) => l.id !== listing?.id)
  const needsFeaturedReplace =
    form.featured && !wasAlreadyFeatured && replaceCandidates.length > 0

  const set =
    (key: keyof FormState) =>
    (value: string | boolean) => {
      setForm((prev) => ({ ...prev, [key]: value }))
    }

  const onFeaturedToggle = (checked: boolean) => {
    setForm((prev) => ({
      ...prev,
      featured: checked,
      replaceFeaturedId: checked ? prev.replaceFeaturedId : '',
    }))
  }

  const onMainAreaChange = (key: string) => {
    if (key === NEW_MAIN_AREA) {
      setForm((prev) => ({ ...prev, locationKey: NEW_MAIN_AREA }))
      return
    }
    const match = mainAreas.find((l) => l.value === key)
    setForm((prev) => ({
      ...prev,
      locationKey: key,
      newMainArea: '',
      location:
        match && !prev.location.trim() ? match.label : prev.location || match?.label || '',
    }))
  }

  const onCoverChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setUploading('cover')
    setErrors((prev) => ({ ...prev, image: undefined, upload: undefined }))
    try {
      const dataUrl = await fileToDataUrl(file)
      setForm((prev) => ({ ...prev, image: dataUrl }))
    } catch (err) {
      setErrors((prev) => ({
        ...prev,
        upload: err instanceof Error ? err.message : 'Could not upload cover photo',
      }))
    } finally {
      setUploading(null)
    }
  }

  const onGalleryChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    e.target.value = ''
    if (!files?.length) return
    setUploading('gallery')
    setErrors((prev) => ({ ...prev, upload: undefined }))
    try {
      const urls = await filesToDataUrls(files)
      setForm((prev) => ({ ...prev, gallery: [...prev.gallery, ...urls] }))
    } catch (err) {
      setErrors((prev) => ({
        ...prev,
        upload: err instanceof Error ? err.message : 'Could not upload photos',
      }))
    } finally {
      setUploading(null)
    }
  }

  const removeGalleryImage = (index: number) => {
    setForm((prev) => ({
      ...prev,
      gallery: prev.gallery.filter((_, i) => i !== index),
    }))
  }

  const clearCover = () => {
    setForm((prev) => ({ ...prev, image: '' }))
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const nextErrors = validate(form, { needsFeaturedReplace })
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) return

    const resolved = resolveMainArea(form)
    const mainAreaLabel =
      form.locationKey === NEW_MAIN_AREA
        ? resolved.mainAreaLabel
        : mainAreas.find((a) => a.value === resolved.locationKey)?.label ||
          form.location.trim()

    const payload = buildListingPayload(form, resolved.locationKey)
    const writeOptions = {
      mainAreaLabel,
      replaceFeaturedId: needsFeaturedReplace ? form.replaceFeaturedId : undefined,
    }

    setSaving(true)
    try {
      if (mode === 'edit' && listing) {
        await updateListing(listing.id, { ...payload, id: listing.id }, writeOptions)
        setSavedFlash(true)
        window.setTimeout(() => {
          navigate('/admin', { state: { notice: 'Changes saved' } })
        }, 700)
      } else {
        await addListing(payload, writeOptions)
        navigate('/admin', { state: { notice: 'Listing created' } })
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Could not save listing'
      setErrors((prev) => ({ ...prev, title: message }))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="admin-page admin-form-page">
      <header className="admin-page-head">
        <div>
          <p className="admin-eyebrow">
            <Link to="/admin">Listings</Link> / {mode === 'create' ? 'New' : 'Edit'}
          </p>
          <h1>{mode === 'create' ? 'Add listing' : 'Edit listing'}</h1>
          <p className="admin-lede">
            Choose a main area for filters. New main areas are added to the public search
            automatically when you save.
          </p>
        </div>
        {savedFlash ? <p className="admin-saved">Changes saved</p> : null}
      </header>

      <form className="admin-form" onSubmit={onSubmit} noValidate>
        <section className="admin-panel">
          <h2>Basics</h2>
          <div className="admin-fields">
            <div className="field admin-span-2">
              <label htmlFor="title">Title</label>
              <input
                id="title"
                value={form.title}
                onChange={(e) => set('title')(e.target.value)}
                placeholder="The Willowmere Villa"
              />
              <FieldError message={errors.title} />
            </div>

            <div className="field">
              <label htmlFor="mainArea">Main area</label>
              <select
                id="mainArea"
                value={form.locationKey}
                onChange={(e) => onMainAreaChange(e.target.value)}
              >
                {mainAreas.map((loc) => (
                  <option key={loc.value} value={loc.value}>
                    {loc.label}
                  </option>
                ))}
                <option value={NEW_MAIN_AREA}>+ Add new main area…</option>
              </select>
              <FieldError message={errors.locationKey} />
            </div>

            <div className="field">
              <label htmlFor="location">Location (shown on listing)</label>
              <input
                id="location"
                value={form.location}
                onChange={(e) => set('location')(e.target.value)}
                placeholder="DHA Phase 6, Block C"
              />
              <FieldError message={errors.location} />
            </div>

            {form.locationKey === NEW_MAIN_AREA ? (
              <div className="field admin-span-2">
                <label htmlFor="newMainArea">New main area name</label>
                <input
                  id="newMainArea"
                  value={form.newMainArea}
                  onChange={(e) => {
                    const value = e.target.value
                    setForm((prev) => ({
                      ...prev,
                      newMainArea: value,
                      location: prev.location.trim() ? prev.location : value,
                    }))
                  }}
                  placeholder="e.g. Johar Town"
                />
                <FieldError message={errors.newMainArea} />
                <p className="admin-hint" style={{ marginTop: '0.45rem', marginBottom: 0 }}>
                  This area will appear in public location filters after you save.
                </p>
              </div>
            ) : null}

            <div className="field">
              <label htmlFor="type">Type</label>
              <select
                id="type"
                value={form.type}
                onChange={(e) => set('type')(e.target.value as PropertyType)}
              >
                {PROPERTY_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="field">
              <label htmlFor="status">Status</label>
              <select
                id="status"
                value={form.status}
                onChange={(e) => set('status')(e.target.value as PropertyStatus)}
              >
                <option value="For Sale">For Sale</option>
                <option value="For Rent">For Rent</option>
              </select>
            </div>
          </div>
        </section>

        <section className="admin-panel">
          <h2>Pricing</h2>
          <div className="admin-fields">
            <div className="field">
              <label htmlFor="priceLabel">Price label (shown on site)</label>
              <input
                id="priceLabel"
                value={form.priceLabel}
                onChange={(e) => set('priceLabel')(e.target.value)}
                placeholder="PKR 185M"
              />
              <FieldError message={errors.priceLabel} />
            </div>
            <div className="field">
              <label htmlFor="priceValue">Price value (number for filters)</label>
              <input
                id="priceValue"
                inputMode="numeric"
                value={form.priceValue}
                onChange={(e) => set('priceValue')(e.target.value)}
                placeholder="185000000"
              />
              <FieldError message={errors.priceValue} />
            </div>
          </div>
        </section>

        <section className="admin-panel">
          <h2>Photos</h2>
          <p className="admin-hint">
            Upload from your device. Cover is required; additional photos are optional.
          </p>

          <div className="admin-upload-block">
            <div className="admin-upload-label-row">
              <span className="admin-upload-label">Cover image</span>
              {form.image ? (
                <button type="button" className="admin-upload-text-btn" onClick={clearCover}>
                  Remove
                </button>
              ) : null}
            </div>

            <input
              ref={coverInputRef}
              id="cover-upload"
              className="sr-only"
              type="file"
              accept="image/*"
              onChange={onCoverChange}
            />

            {form.image ? (
              <div className="admin-cover-preview">
                <img src={form.image} alt="Cover preview" />
                <button
                  type="button"
                  className="btn-outline admin-upload-replace"
                  onClick={() => coverInputRef.current?.click()}
                  disabled={uploading === 'cover'}
                >
                  {uploading === 'cover' ? 'Uploading…' : 'Replace photo'}
                </button>
              </div>
            ) : (
              <button
                type="button"
                className="admin-dropzone"
                onClick={() => coverInputRef.current?.click()}
                disabled={uploading === 'cover'}
              >
                <strong>{uploading === 'cover' ? 'Uploading…' : 'Upload cover photo'}</strong>
                <span>JPG, PNG, or WebP from your device</span>
              </button>
            )}
            <FieldError message={errors.image} />
          </div>

          <div className="admin-upload-block">
            <div className="admin-upload-label-row">
              <span className="admin-upload-label">Additional images</span>
              <span className="admin-upload-meta">
                {form.gallery.length
                  ? `${form.gallery.length} photo${form.gallery.length === 1 ? '' : 's'}`
                  : 'Optional'}
              </span>
            </div>

            <input
              ref={galleryInputRef}
              id="gallery-upload"
              className="sr-only"
              type="file"
              accept="image/*"
              multiple
              onChange={onGalleryChange}
            />

            {form.gallery.length > 0 ? (
              <div className="admin-photo-preview" aria-label="Gallery preview">
                {form.gallery.map((src, index) => (
                  <div key={`${index}-${src.slice(0, 48)}`} className="admin-photo-tile">
                    <img src={src} alt={`Gallery ${index + 1}`} />
                    <button
                      type="button"
                      className="admin-photo-remove"
                      aria-label={`Remove photo ${index + 1}`}
                      onClick={() => removeGalleryImage(index)}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            ) : null}

            <button
              type="button"
              className="admin-dropzone admin-dropzone-sm"
              onClick={() => galleryInputRef.current?.click()}
              disabled={uploading === 'gallery'}
            >
              <strong>
                {uploading === 'gallery'
                  ? 'Uploading…'
                  : form.gallery.length
                    ? 'Add more photos'
                    : 'Upload additional photos'}
              </strong>
              <span>You can select multiple files at once</span>
            </button>
          </div>

          <FieldError message={errors.upload} />
        </section>

        <section className="admin-panel">
          <h2>Card specs</h2>
          <p className="admin-hint">Shown on listing cards. Beds and baths are optional.</p>
          <div className="admin-fields">
            <div className="field">
              <label htmlFor="beds">Beds (optional)</label>
              <input
                id="beds"
                inputMode="numeric"
                value={form.beds}
                onChange={(e) => set('beds')(e.target.value)}
                placeholder="5"
              />
            </div>
            <div className="field">
              <label htmlFor="baths">Baths (optional)</label>
              <input
                id="baths"
                inputMode="numeric"
                value={form.baths}
                onChange={(e) => set('baths')(e.target.value)}
                placeholder="6"
              />
            </div>
            <div className="field">
              <label htmlFor="sizeLabel">Size label</label>
              <input
                id="sizeLabel"
                value={form.sizeLabel}
                onChange={(e) => set('sizeLabel')(e.target.value)}
                placeholder="1 Kanal"
              />
              <FieldError message={errors.sizeLabel} />
            </div>
            <div className="field admin-span-2">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                value={form.description}
                onChange={(e) => set('description')(e.target.value)}
                rows={5}
                placeholder="Short property story for the detail page…"
              />
              <FieldError message={errors.description} />
            </div>
            <label className="admin-check admin-span-2">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(e) => onFeaturedToggle(e.target.checked)}
              />
              <span>Featured on the home page</span>
            </label>

            {needsFeaturedReplace ? (
              <div className="field admin-span-2">
                <label htmlFor="replaceFeatured">Replace which featured listing?</label>
                <select
                  id="replaceFeatured"
                  value={form.replaceFeaturedId}
                  onChange={(e) => set('replaceFeaturedId')(e.target.value)}
                >
                  <option value="">Select a listing to replace…</option>
                  {replaceCandidates.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.title} — {item.location}
                    </option>
                  ))}
                </select>
                <FieldError message={errors.replaceFeaturedId} />
                <p className="admin-hint" style={{ marginTop: '0.45rem', marginBottom: 0 }}>
                  This listing will take that slot on the homepage. The previous one stays in All
                  Listings but is no longer featured.
                </p>
              </div>
            ) : null}

            {form.featured && wasAlreadyFeatured ? (
              <p className="admin-hint admin-span-2" style={{ marginTop: 0 }}>
                This listing is already in a homepage featured slot.
              </p>
            ) : null}
          </div>
        </section>

        <section className="admin-panel">
          <div className="admin-panel-head">
            <div>
              <h2>All details</h2>
              <p className="admin-hint">Optional. Leave off if this listing only needs the basics.</p>
            </div>
            <label className="admin-check">
              <input
                type="checkbox"
                checked={form.includeDetails}
                onChange={(e) => set('includeDetails')(e.target.checked)}
              />
              <span>Include on listing page</span>
            </label>
          </div>

          {form.includeDetails ? (
            <div className="admin-fields">
              <div className="field">
                <label htmlFor="detailBeds">Beds</label>
                <input
                  id="detailBeds"
                  value={form.detailBeds}
                  onChange={(e) => set('detailBeds')(e.target.value)}
                />
              </div>
              <div className="field">
                <label htmlFor="detailBaths">Baths</label>
                <input
                  id="detailBaths"
                  value={form.detailBaths}
                  onChange={(e) => set('detailBaths')(e.target.value)}
                />
              </div>
              <div className="field">
                <label htmlFor="floors">Floors</label>
                <input
                  id="floors"
                  value={form.floors}
                  onChange={(e) => set('floors')(e.target.value)}
                />
              </div>
              <div className="field">
                <label htmlFor="yearBuilt">Year built</label>
                <input
                  id="yearBuilt"
                  value={form.yearBuilt}
                  onChange={(e) => set('yearBuilt')(e.target.value)}
                />
              </div>
              <div className="field">
                <label htmlFor="plotSize">Plot size</label>
                <input
                  id="plotSize"
                  value={form.plotSize}
                  onChange={(e) => set('plotSize')(e.target.value)}
                />
              </div>
              <div className="field">
                <label htmlFor="builtArea">Built area</label>
                <input
                  id="builtArea"
                  value={form.builtArea}
                  onChange={(e) => set('builtArea')(e.target.value)}
                />
              </div>
              <div className="field">
                <label htmlFor="parking">Parking</label>
                <input
                  id="parking"
                  value={form.parking}
                  onChange={(e) => set('parking')(e.target.value)}
                />
              </div>
              <div className="field">
                <label htmlFor="kitchen">Kitchen</label>
                <input
                  id="kitchen"
                  value={form.kitchen}
                  onChange={(e) => set('kitchen')(e.target.value)}
                />
              </div>
              <div className="field">
                <label htmlFor="furnishing">Furnishing</label>
                <input
                  id="furnishing"
                  value={form.furnishing}
                  onChange={(e) => set('furnishing')(e.target.value)}
                />
              </div>
              <div className="field">
                <label htmlFor="facing">Facing</label>
                <input
                  id="facing"
                  value={form.facing}
                  onChange={(e) => set('facing')(e.target.value)}
                />
              </div>
              <div className="field">
                <label htmlFor="possession">Possession</label>
                <input
                  id="possession"
                  value={form.possession}
                  onChange={(e) => set('possession')(e.target.value)}
                />
              </div>
              <div className="field">
                <label htmlFor="servantQuarters">Servant quarters</label>
                <input
                  id="servantQuarters"
                  value={form.servantQuarters}
                  onChange={(e) => set('servantQuarters')(e.target.value)}
                />
              </div>
              <div className="field admin-span-2">
                <label htmlFor="features">Features (one per line)</label>
                <textarea
                  id="features"
                  value={form.featuresText}
                  onChange={(e) => set('featuresText')(e.target.value)}
                  rows={4}
                  placeholder={'Private pool\nSmart lighting'}
                />
              </div>
              <div className="field admin-span-2">
                <label htmlFor="notes">Notes</label>
                <textarea
                  id="notes"
                  value={form.notes}
                  onChange={(e) => set('notes')(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
          ) : null}
        </section>

        <div className="admin-form-actions">
          <Button variant="outline" to="/admin">
            Cancel
          </Button>
          <Button type="submit" disabled={saving || uploading != null}>
            {saving
              ? 'Saving…'
              : mode === 'create'
                ? 'Create listing'
                : 'Save changes'}
          </Button>
        </div>
      </form>
    </div>
  )
}
