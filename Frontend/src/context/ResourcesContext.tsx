import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { BlogPost } from '../types'
import { SEED_BLOGS } from '../data/blogs'
import {
  applyFeaturedPlacement,
  collectCategories,
  ensureUniqueSlug,
  FEATURED_RESOURCE_LIMIT,
  finalizeSlug,
  loadResourcesStore,
  mergeResources,
  nextResourceId,
  removeFromFeaturedOrder,
  resolveFeaturedPosts,
  saveResourcesStore,
  type ResourcesStoreState,
} from '../lib/resourcesStorage'

type ResourceWriteOptions = {
  replaceFeaturedId?: string
}

type ResourcesContextValue = {
  posts: BlogPost[]
  featuredPosts: BlogPost[]
  categories: string[]
  getById: (id: string) => BlogPost | undefined
  getBySlug: (slug: string) => BlogPost | undefined
  addPost: (
    input: Omit<BlogPost, 'id'> & { id?: string },
    options?: ResourceWriteOptions,
  ) => BlogPost
  updatePost: (id: string, post: BlogPost, options?: ResourceWriteOptions) => void
  removePost: (id: string) => void
  resetToSeed: () => void
}

const ResourcesContext = createContext<ResourcesContextValue | null>(null)

const SEED_FEATURED_ORDER = SEED_BLOGS.filter((b) => b.featured)
  .map((b) => b.id)
  .slice(0, FEATURED_RESOURCE_LIMIT)

function commitPost(
  state: ResourcesStoreState,
  post: BlogPost,
  options?: ResourceWriteOptions,
): ResourcesStoreState {
  const isCustom = state.added.some((p) => p.id === post.id)
  let next: ResourcesStoreState = {
    ...state,
    added: isCustom
      ? state.added.map((p) => (p.id === post.id ? post : p))
      : state.added,
    updated: { ...state.updated, [post.id]: post },
    removed: state.removed.filter((r) => r !== post.id),
  }

  if (post.featured) {
    next = applyFeaturedPlacement(next, post.id, options?.replaceFeaturedId)
  } else {
    next = removeFromFeaturedOrder(next, post.id)
  }

  return next
}

export function ResourcesProvider({ children }: { children: ReactNode }) {
  const [store, setStore] = useState<ResourcesStoreState>(() => loadResourcesStore())

  const persist = useCallback((next: ResourcesStoreState) => {
    setStore(next)
    saveResourcesStore(next)
  }, [])

  const posts = useMemo(() => mergeResources(store), [store])

  const featuredPosts = useMemo(
    () => resolveFeaturedPosts(posts, store.featuredOrder),
    [posts, store.featuredOrder],
  )

  const categories = useMemo(() => collectCategories(posts), [posts])

  const getById = useCallback(
    (id: string) => posts.find((p) => p.id === id),
    [posts],
  )

  const getBySlug = useCallback(
    (slug: string) => posts.find((p) => p.slug === slug),
    [posts],
  )

  const addPost = useCallback(
    (input: Omit<BlogPost, 'id'> & { id?: string }, options?: ResourceWriteOptions) => {
      const id = input.id?.trim() || nextResourceId(posts.map((p) => p.id))
      const slug = ensureUniqueSlug(
        finalizeSlug(input.slug, input.title),
        posts.map((p) => p.slug),
      )
      const post: BlogPost = { ...input, id, slug }
      const withAdded: ResourcesStoreState = {
        ...store,
        added: [...store.added, post],
        removed: store.removed.filter((r) => r !== id),
      }
      persist(commitPost(withAdded, post, options))
      return post
    },
    [persist, posts, store],
  )

  const updatePost = useCallback(
    (id: string, post: BlogPost, options?: ResourceWriteOptions) => {
      const others = posts.filter((p) => p.id !== id)
      const slug = ensureUniqueSlug(
        finalizeSlug(post.slug, post.title),
        others.map((p) => p.slug),
      )
      persist(commitPost(store, { ...post, id, slug }, options))
    },
    [persist, posts, store],
  )

  const removePost = useCallback(
    (id: string) => {
      const withoutFeatured = removeFromFeaturedOrder(store, id)
      persist({
        ...withoutFeatured,
        added: withoutFeatured.added.filter((p) => p.id !== id),
        updated: Object.fromEntries(
          Object.entries(withoutFeatured.updated).filter(([key]) => key !== id),
        ),
        removed: withoutFeatured.removed.includes(id)
          ? withoutFeatured.removed
          : [...withoutFeatured.removed, id],
      })
    },
    [persist, store],
  )

  const resetToSeed = useCallback(() => {
    persist({
      added: [],
      updated: {},
      removed: [],
      featuredOrder: [...SEED_FEATURED_ORDER],
    })
  }, [persist])

  const value = useMemo(
    () => ({
      posts,
      featuredPosts,
      categories,
      getById,
      getBySlug,
      addPost,
      updatePost,
      removePost,
      resetToSeed,
    }),
    [
      posts,
      featuredPosts,
      categories,
      getById,
      getBySlug,
      addPost,
      updatePost,
      removePost,
      resetToSeed,
    ],
  )

  return (
    <ResourcesContext.Provider value={value}>{children}</ResourcesContext.Provider>
  )
}

export function useResources() {
  const ctx = useContext(ResourcesContext)
  if (!ctx) {
    throw new Error('useResources must be used within ResourcesProvider')
  }
  return ctx
}
