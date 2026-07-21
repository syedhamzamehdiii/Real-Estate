import type { BlogPost } from '../types'
import { SEED_BLOGS } from '../data/blogs'

const STORAGE_KEY = 'estate-line-admin-resources-v1'
export const FEATURED_RESOURCE_LIMIT = 5

export type ResourcesStoreState = {
  added: BlogPost[]
  updated: Record<string, BlogPost>
  removed: string[]
  /** Homepage resources slider order (max FEATURED_RESOURCE_LIMIT). */
  featuredOrder: string[]
}

const seedFeaturedOrder = () =>
  SEED_BLOGS.filter((b) => b.featured)
    .map((b) => b.id)
    .slice(0, FEATURED_RESOURCE_LIMIT)

const emptyState = (): ResourcesStoreState => ({
  added: [],
  updated: {},
  removed: [],
  featuredOrder: seedFeaturedOrder(),
})

export function loadResourcesStore(): ResourcesStoreState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return emptyState()
    const parsed = JSON.parse(raw) as Partial<ResourcesStoreState>
    const base = emptyState()
    return {
      added: Array.isArray(parsed.added) ? parsed.added : [],
      updated: parsed.updated && typeof parsed.updated === 'object' ? parsed.updated : {},
      removed: Array.isArray(parsed.removed) ? parsed.removed : [],
      featuredOrder: Array.isArray(parsed.featuredOrder)
        ? parsed.featuredOrder.slice(0, FEATURED_RESOURCE_LIMIT)
        : base.featuredOrder,
    }
  } catch {
    return emptyState()
  }
}

export function saveResourcesStore(state: ResourcesStoreState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

export function mergeResources(state: ResourcesStoreState): BlogPost[] {
  const seedIds = new Set(SEED_BLOGS.map((b) => b.id))
  const fromSeed = SEED_BLOGS.filter((b) => !state.removed.includes(b.id)).map(
    (b) => state.updated[b.id] ?? b,
  )
  const fromAdded = state.added
    .filter((b) => !state.removed.includes(b.id) && !seedIds.has(b.id))
    .map((b) => state.updated[b.id] ?? b)
  return [...fromSeed, ...fromAdded].sort((a, b) =>
    b.publishedAt.localeCompare(a.publishedAt),
  )
}

function writePost(state: ResourcesStoreState, post: BlogPost): ResourcesStoreState {
  const isAdded = state.added.some((p) => p.id === post.id)
  return {
    ...state,
    added: isAdded
      ? state.added.map((p) => (p.id === post.id ? post : p))
      : state.added,
    updated: { ...state.updated, [post.id]: post },
  }
}

export function syncFeaturedFlags(state: ResourcesStoreState): ResourcesStoreState {
  const order = state.featuredOrder.slice(0, FEATURED_RESOURCE_LIMIT)
  const featuredSet = new Set(order)
  let next = { ...state, featuredOrder: order }

  for (const post of mergeResources(next)) {
    const shouldFeature = featuredSet.has(post.id)
    if (Boolean(post.featured) !== shouldFeature) {
      next = writePost(next, { ...post, featured: shouldFeature })
    }
  }
  return next
}

export function applyFeaturedPlacement(
  state: ResourcesStoreState,
  newId: string,
  replaceId?: string,
): ResourcesStoreState {
  let order = [...state.featuredOrder].filter((id) => id !== newId)

  if (replaceId) {
    const idx = order.indexOf(replaceId)
    if (idx >= 0) {
      order[idx] = newId
    } else if (order.length < FEATURED_RESOURCE_LIMIT) {
      order.push(newId)
    } else {
      order[FEATURED_RESOURCE_LIMIT - 1] = newId
    }
  } else if (order.length < FEATURED_RESOURCE_LIMIT) {
    order.push(newId)
  } else {
    return syncFeaturedFlags({ ...state, featuredOrder: order })
  }

  order = order.slice(0, FEATURED_RESOURCE_LIMIT)
  return syncFeaturedFlags({ ...state, featuredOrder: order })
}

export function removeFromFeaturedOrder(
  state: ResourcesStoreState,
  id: string,
): ResourcesStoreState {
  if (!state.featuredOrder.includes(id)) return state
  return syncFeaturedFlags({
    ...state,
    featuredOrder: state.featuredOrder.filter((fid) => fid !== id),
  })
}

export function resolveFeaturedPosts(
  posts: BlogPost[],
  featuredOrder: string[],
): BlogPost[] {
  const byId = new Map(posts.map((p) => [p.id, p]))
  const ordered: BlogPost[] = []
  for (const id of featuredOrder) {
    const post = byId.get(id)
    if (post) ordered.push(post)
  }
  if (ordered.length) return ordered.slice(0, FEATURED_RESOURCE_LIMIT)
  return posts.filter((p) => p.featured).slice(0, FEATURED_RESOURCE_LIMIT)
}

/** Clean a title/slug into a URL-safe path segment (may be empty). */
export function slugifyResource(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 72)
}

/** Softer sanitize while typing — keeps a trailing hyphen so the user can continue. */
export function sanitizeSlugInput(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-+/, '')
    .slice(0, 72)
}

export function finalizeSlug(slug: string, title: string): string {
  return slugifyResource(slug) || slugifyResource(title) || 'resource'
}

export function ensureUniqueSlug(desired: string, existingSlugs: string[]): string {
  if (!existingSlugs.includes(desired)) return desired
  let n = 2
  while (existingSlugs.includes(`${desired}-${n}`)) n += 1
  return `${desired}-${n}`
}

export function nextResourceId(existingIds: string[]): string {
  const nums = existingIds
    .map((id) => Number(id))
    .filter((n) => Number.isFinite(n) && n > 0)
  const max = nums.length ? Math.max(...nums) : 0
  return String(max + 1)
}

/** Categories already used — shown as suggestions in the admin form. */
export function collectCategories(posts: BlogPost[]): string[] {
  const set = new Set<string>()
  for (const post of posts) {
    if (post.category.trim()) set.add(post.category.trim())
  }
  return Array.from(set).sort((a, b) => a.localeCompare(b))
}
