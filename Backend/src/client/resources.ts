import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  updateDoc,
  where,
  serverTimestamp,
  type Unsubscribe,
} from 'firebase/firestore'
import { COLLECTIONS } from '../config/constants'
import type {
  BlogPost,
  PaginatedResult,
  ResourceDocument,
  ResourceWriteOptions,
} from '../types/models'
import { DEFAULT_PAGE_SIZE } from '../types/models'
import { validateResourceDraft, validateResourceInput } from '../validation/resource'
import { ensureUniqueSlug, finalizeSlug } from '../utils/ids'
import { stripUndefined } from '../utils/firestore'
import {
  FEATURED_RESOURCE_LIMIT,
  resolveFeaturedItems,
} from '../utils/featured'
import { getCurrentUser } from './auth'
import { getDb } from './firebase'
import { persistResourceImage } from './storage'
import {
  allocateResourceId,
  getResourcesMeta,
  placeResourceFeatured,
} from './meta'

function requireUid(): string {
  const user = getCurrentUser()
  if (!user) throw new Error('You must be signed in to modify resources.')
  return user.uid
}

function toPublicPost(data: ResourceDocument | (BlogPost & Record<string, unknown>)): BlogPost {
  const post: BlogPost = {
    id: String(data.id),
    slug: String(data.slug),
    category: String(data.category),
    title: String(data.title),
    excerpt: String(data.excerpt),
    content: String(data.content),
    image: String(data.image),
    author: String(data.author),
    readMinutes: Number(data.readMinutes),
    publishedAt: String(data.publishedAt),
  }
  if (data.featured != null) post.featured = Boolean(data.featured)
  return post
}

export async function listAllResources(): Promise<BlogPost[]> {
  const snap = await getDocs(
    query(collection(getDb(), COLLECTIONS.resources), orderBy('publishedAt', 'desc')),
  )
  return snap.docs.map((d) => toPublicPost({ id: d.id, ...d.data() } as ResourceDocument))
}

export function subscribeResources(
  onData: (posts: BlogPost[]) => void,
  onError?: (error: Error) => void,
): Unsubscribe {
  const q = query(
    collection(getDb(), COLLECTIONS.resources),
    orderBy('publishedAt', 'desc'),
  )
  return onSnapshot(
    q,
    (snap) => {
      onData(snap.docs.map((d) => toPublicPost({ id: d.id, ...d.data() } as ResourceDocument)))
    },
    (err) => onError?.(err),
  )
}

export async function getResourceById(id: string): Promise<BlogPost | null> {
  const snap = await getDoc(doc(getDb(), COLLECTIONS.resources, id))
  if (!snap.exists()) return null
  return toPublicPost({ id: snap.id, ...snap.data() } as ResourceDocument)
}

export async function getResourceBySlug(slug: string): Promise<BlogPost | null> {
  const snap = await getDocs(
    query(
      collection(getDb(), COLLECTIONS.resources),
      where('slug', '==', slug),
      limit(1),
    ),
  )
  const first = snap.docs[0]
  if (!first) return null
  return toPublicPost({ id: first.id, ...first.data() } as ResourceDocument)
}

export async function queryResources(options: {
  category?: string
  featured?: boolean
  pageSize?: number
} = {}): Promise<PaginatedResult<BlogPost>> {
  const pageSize = options.pageSize ?? DEFAULT_PAGE_SIZE
  const constraints = []

  if (options.category) {
    constraints.push(where('category', '==', options.category))
  }
  if (options.featured != null) {
    constraints.push(where('featured', '==', options.featured))
  }
  constraints.push(orderBy('publishedAt', 'desc'))
  constraints.push(limit(pageSize + 1))

  const snap = await getDocs(query(collection(getDb(), COLLECTIONS.resources), ...constraints))
  let items = snap.docs.map((d) =>
    toPublicPost({ id: d.id, ...d.data() } as ResourceDocument),
  )
  const hasMore = snap.docs.length > pageSize
  if (hasMore) items = items.slice(0, pageSize)

  return {
    items,
    hasMore,
    nextCursor: hasMore ? items[items.length - 1]?.id ?? null : null,
  }
}

export async function createResource(
  input: Omit<BlogPost, 'id'> & { id?: string },
  options?: ResourceWriteOptions,
): Promise<BlogPost> {
  const uid = requireUid()
  const existing = await listAllResources()
  const id = input.id?.trim() || (await allocateResourceId())
  const slug = ensureUniqueSlug(
    finalizeSlug(input.slug, input.title),
    existing.map((p) => p.slug),
  )
  const draft = validateResourceDraft({ ...input, id, slug })

  const image = await persistResourceImage(id, draft.image)
  const parsed = validateResourceInput({ ...draft, id, slug, image })

  const featuredOrder = await placeResourceFeatured(
    id,
    Boolean(parsed.featured),
    options?.replaceFeaturedId,
  )
  const featured = featuredOrder.includes(id)

  const docData = stripUndefined({
    ...parsed,
    id,
    slug,
    featured,
    ownerId: uid,
    createdBy: uid,
    updatedBy: uid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })

  await setDoc(doc(getDb(), COLLECTIONS.resources, id), docData)
  return toPublicPost(docData as ResourceDocument)
}

export async function updateResource(
  id: string,
  input: BlogPost,
  options?: ResourceWriteOptions,
): Promise<BlogPost> {
  const uid = requireUid()
  const existingSnap = await getDoc(doc(getDb(), COLLECTIONS.resources, id))
  if (!existingSnap.exists()) throw new Error(`Resource "${id}" not found.`)

  const others = (await listAllResources()).filter((p) => p.id !== id)
  const slug = ensureUniqueSlug(
    finalizeSlug(input.slug, input.title),
    others.map((p) => p.slug),
  )
  const draft = validateResourceDraft({ ...input, id, slug })
  const image = await persistResourceImage(id, draft.image)
  const parsed = validateResourceInput({ ...draft, id, slug, image })

  const featuredOrder = await placeResourceFeatured(
    id,
    Boolean(parsed.featured),
    options?.replaceFeaturedId,
  )
  const featured = featuredOrder.includes(id)

  const prev = existingSnap.data()
  const docData = stripUndefined({
    ...parsed,
    id,
    slug,
    featured,
    ownerId: prev.ownerId ?? uid,
    createdBy: prev.createdBy ?? uid,
    updatedBy: uid,
    createdAt: prev.createdAt ?? serverTimestamp(),
    updatedAt: serverTimestamp(),
  })

  await setDoc(doc(getDb(), COLLECTIONS.resources, id), docData)
  return toPublicPost(docData as ResourceDocument)
}

export async function deleteResource(id: string): Promise<void> {
  requireUid()
  await placeResourceFeatured(id, false)
  await deleteDoc(doc(getDb(), COLLECTIONS.resources, id))
}

export async function syncResourceFeaturedFlags(): Promise<void> {
  const uid = requireUid()
  const meta = await getResourcesMeta()
  const featuredSet = new Set(meta.featuredOrder)
  const posts = await listAllResources()
  await Promise.all(
    posts.map(async (post) => {
      const should = featuredSet.has(post.id)
      if (Boolean(post.featured) === should) return
      await updateDoc(doc(getDb(), COLLECTIONS.resources, post.id), {
        featured: should,
        updatedBy: uid,
        updatedAt: serverTimestamp(),
      })
    }),
  )
}

export async function getFeaturedResources(): Promise<BlogPost[]> {
  const [posts, meta] = await Promise.all([listAllResources(), getResourcesMeta()])
  return resolveFeaturedItems(posts, meta.featuredOrder, FEATURED_RESOURCE_LIMIT)
}

export function collectCategories(posts: BlogPost[]): string[] {
  const set = new Set<string>()
  for (const post of posts) {
    if (post.category.trim()) set.add(post.category.trim())
  }
  return Array.from(set).sort((a, b) => a.localeCompare(b))
}
