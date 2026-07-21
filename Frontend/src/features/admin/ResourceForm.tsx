import { useRef, useState, type ChangeEvent, type FormEvent } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { Button } from '../../components/ui'
import { useResources } from '../../context/ResourcesContext'
import { fileToDataUrl } from '../../lib/imageUpload'
import { finalizeSlug, sanitizeSlugInput, slugifyResource } from '../../lib/resourcesStorage'
import type { BlogPost } from '../../types'
import './Admin.css'

type FormState = {
  title: string
  slug: string
  category: string
  excerpt: string
  content: string
  image: string
  author: string
  readMinutes: string
  publishedAt: string
  featured: boolean
  replaceFeaturedId: string
  slugTouched: boolean
}

function todayIsoDate() {
  return new Date().toISOString().slice(0, 10)
}

const emptyForm = (): FormState => ({
  title: '',
  slug: '',
  category: '',
  excerpt: '',
  content: '',
  image: '',
  author: 'Estate Line Research',
  readMinutes: '5',
  publishedAt: todayIsoDate(),
  featured: false,
  replaceFeaturedId: '',
  slugTouched: false,
})

function postToForm(post: BlogPost): FormState {
  return {
    title: post.title,
    slug: post.slug,
    category: post.category,
    excerpt: post.excerpt,
    content: post.content,
    image: post.image,
    author: post.author,
    readMinutes: String(post.readMinutes),
    publishedAt: post.publishedAt,
    featured: Boolean(post.featured),
    replaceFeaturedId: '',
    slugTouched: true,
  }
}

function buildPayload(form: FormState): Omit<BlogPost, 'id'> {
  return {
    title: form.title.trim(),
    slug: finalizeSlug(form.slug, form.title),
    category: form.category.trim(),
    excerpt: form.excerpt.trim(),
    content: form.content.trim(),
    image: form.image.trim(),
    author: form.author.trim(),
    readMinutes: Math.max(1, Math.round(Number(form.readMinutes)) || 1),
    publishedAt: form.publishedAt || todayIsoDate(),
    featured: form.featured,
  }
}

type Errors = Partial<Record<keyof FormState | 'upload', string>>

function validate(
  form: FormState,
  opts: { needsFeaturedReplace: boolean },
): Errors {
  const errors: Errors = {}
  if (!form.title.trim()) errors.title = 'Title is required'
  if (!form.category.trim()) errors.category = 'Category is required'
  if (!form.excerpt.trim()) errors.excerpt = 'Excerpt is required'
  if (!form.content.trim()) errors.content = 'Content is required'
  if (!form.image.trim()) errors.image = 'Cover photo is required'
  if (!form.author.trim()) errors.author = 'Author is required'
  if (!form.readMinutes.trim() || !Number.isFinite(Number(form.readMinutes))) {
    errors.readMinutes = 'Enter read time in minutes'
  }
  if (!form.publishedAt.trim()) errors.publishedAt = 'Publish date is required'
  if (opts.needsFeaturedReplace && !form.replaceFeaturedId) {
    errors.replaceFeaturedId = 'Choose which homepage resource to replace'
  }
  return errors
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return <span className="field-error">{message}</span>
}

export function AdminResourceCreatePage() {
  return <ResourceEditor mode="create" />
}

export function AdminResourceEditPage() {
  const { id } = useParams()
  const { getById } = useResources()
  const post = id ? getById(id) : undefined
  if (!post) {
    return <Navigate to="/admin/resources" replace />
  }
  return <ResourceEditor key={post.id} mode="edit" post={post} />
}

function ResourceEditor({
  mode,
  post,
}: {
  mode: 'create' | 'edit'
  post?: BlogPost
}) {
  const navigate = useNavigate()
  const { addPost, updatePost, categories, featuredPosts } = useResources()
  const [form, setForm] = useState<FormState>(() =>
    post ? postToForm(post) : emptyForm(),
  )
  const [errors, setErrors] = useState<Errors>({})
  const [savedFlash, setSavedFlash] = useState(false)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const coverInputRef = useRef<HTMLInputElement>(null)

  const wasAlreadyFeatured = Boolean(post?.featured)
  const replaceCandidates = featuredPosts.filter((p) => p.id !== post?.id)
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

  const onTitleChange = (title: string) => {
    setForm((prev) => ({
      ...prev,
      title,
      slug: prev.slugTouched ? prev.slug : slugifyResource(title),
    }))
  }

  const onSlugChange = (value: string) => {
    setForm((prev) => ({
      ...prev,
      slug: sanitizeSlugInput(value),
      slugTouched: true,
    }))
  }

  const onSlugBlur = () => {
    setForm((prev) => ({
      ...prev,
      slug: slugifyResource(prev.slug),
    }))
  }

  const onCoverChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setUploading(true)
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
      setUploading(false)
    }
  }

  const clearCover = () => setForm((prev) => ({ ...prev, image: '' }))

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const nextErrors = validate(form, { needsFeaturedReplace })
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) return

    const payload = buildPayload(form)
    const writeOptions = {
      replaceFeaturedId: needsFeaturedReplace ? form.replaceFeaturedId : undefined,
    }

    setSaving(true)
    try {
      if (mode === 'edit' && post) {
        await updatePost(post.id, { ...payload, id: post.id }, writeOptions)
        setSavedFlash(true)
        window.setTimeout(() => {
          navigate('/admin/resources', { state: { notice: 'Changes saved' } })
        }, 700)
      } else {
        await addPost(payload, writeOptions)
        navigate('/admin/resources', { state: { notice: 'Resource created' } })
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Could not save resource'
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
            <Link to="/admin/resources">Resources</Link> / {mode === 'create' ? 'New' : 'Edit'}
          </p>
          <h1>{mode === 'create' ? 'Add resource' : 'Edit resource'}</h1>
          <p className="admin-lede">
            Fields match the public article template — title, category, excerpt, and full content.
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
                onChange={(e) => onTitleChange(e.target.value)}
                placeholder="DHA Lahore Price Trends: Mid‑2026 Outlook"
              />
              <FieldError message={errors.title} />
            </div>

            <div className="field">
              <label htmlFor="slug">URL slug</label>
              <input
                id="slug"
                value={form.slug}
                onChange={(e) => onSlugChange(e.target.value)}
                onBlur={onSlugBlur}
                placeholder="dha-lahore-price-trends"
              />
              <p className="admin-hint" style={{ marginTop: '0.45rem', marginBottom: 0 }}>
                Public URL: /resources/{form.slug || '…'}
              </p>
            </div>

            <div className="field">
              <label htmlFor="category">Category</label>
              <input
                id="category"
                list="resource-categories"
                value={form.category}
                onChange={(e) => set('category')(e.target.value)}
                placeholder="Market Update"
              />
              <datalist id="resource-categories">
                {categories.map((cat) => (
                  <option key={cat} value={cat} />
                ))}
              </datalist>
              <FieldError message={errors.category} />
            </div>

            <div className="field">
              <label htmlFor="author">Author</label>
              <input
                id="author"
                value={form.author}
                onChange={(e) => set('author')(e.target.value)}
                placeholder="Estate Line Research"
              />
              <FieldError message={errors.author} />
            </div>

            <div className="field">
              <label htmlFor="readMinutes">Read time (minutes)</label>
              <input
                id="readMinutes"
                inputMode="numeric"
                value={form.readMinutes}
                onChange={(e) => set('readMinutes')(e.target.value)}
                placeholder="6"
              />
              <FieldError message={errors.readMinutes} />
            </div>

            <div className="field">
              <label htmlFor="publishedAt">Published date</label>
              <input
                id="publishedAt"
                type="date"
                value={form.publishedAt}
                onChange={(e) => set('publishedAt')(e.target.value)}
              />
              <FieldError message={errors.publishedAt} />
            </div>
          </div>
        </section>

        <section className="admin-panel">
          <h2>Cover photo</h2>
          <p className="admin-hint">Upload from your device. Shown on cards and the article hero.</p>

          <input
            ref={coverInputRef}
            id="resource-cover"
            className="sr-only"
            type="file"
            accept="image/*"
            onChange={onCoverChange}
          />

          {form.image ? (
            <div className="admin-cover-preview">
              <img src={form.image} alt="Cover preview" />
              <div className="admin-cover-actions">
                <button
                  type="button"
                  className="btn-outline admin-upload-replace"
                  onClick={() => coverInputRef.current?.click()}
                  disabled={uploading}
                >
                  {uploading ? 'Uploading…' : 'Replace photo'}
                </button>
                <button type="button" className="admin-upload-text-btn admin-cover-remove" onClick={clearCover}>
                  Remove
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              className="admin-dropzone"
              onClick={() => coverInputRef.current?.click()}
              disabled={uploading}
            >
              <strong>{uploading ? 'Uploading…' : 'Upload cover photo'}</strong>
              <span>JPG, PNG, or WebP from your device</span>
            </button>
          )}
          <FieldError message={errors.image || errors.upload} />
        </section>

        <section className="admin-panel">
          <h2>Article copy</h2>
          <div className="admin-fields">
            <div className="field admin-span-2">
              <label htmlFor="excerpt">Excerpt</label>
              <textarea
                id="excerpt"
                value={form.excerpt}
                onChange={(e) => set('excerpt')(e.target.value)}
                rows={3}
                placeholder="Short summary shown on cards…"
              />
              <FieldError message={errors.excerpt} />
            </div>
            <div className="field admin-span-2">
              <label htmlFor="content">Full content</label>
              <textarea
                id="content"
                value={form.content}
                onChange={(e) => set('content')(e.target.value)}
                rows={10}
                placeholder="Full article body…"
              />
              <FieldError message={errors.content} />
            </div>
          </div>
        </section>

        <section className="admin-panel">
          <h2>Homepage</h2>
          <div className="admin-fields">
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
                <label htmlFor="replaceFeatured">Replace which homepage resource?</label>
                <select
                  id="replaceFeatured"
                  value={form.replaceFeaturedId}
                  onChange={(e) => set('replaceFeaturedId')(e.target.value)}
                >
                  <option value="">Select an article to replace…</option>
                  {replaceCandidates.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.title}
                    </option>
                  ))}
                </select>
                <FieldError message={errors.replaceFeaturedId} />
                <p className="admin-hint" style={{ marginTop: '0.45rem', marginBottom: 0 }}>
                  This article will take that slot in the homepage slider. The previous one stays in
                  Resources but is no longer featured.
                </p>
              </div>
            ) : null}

            {form.featured && wasAlreadyFeatured ? (
              <p className="admin-hint admin-span-2" style={{ marginTop: 0 }}>
                This article is already in a homepage featured slot.
              </p>
            ) : null}
          </div>
        </section>

        <div className="admin-form-actions">
          <Button variant="outline" to="/admin/resources">
            Cancel
          </Button>
          <Button type="submit" disabled={saving || uploading}>
            {saving
              ? 'Saving…'
              : mode === 'create'
                ? 'Create resource'
                : 'Save changes'}
          </Button>
        </div>
      </form>
    </div>
  )
}
