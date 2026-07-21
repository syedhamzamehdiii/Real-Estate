import {
  type DocumentData,
  type Query,
  type QueryConstraint,
  type QueryDocumentSnapshot,
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  startAfter,
  where,
  type Firestore,
  type WhereFilterOp,
} from 'firebase/firestore'
import { DEFAULT_PAGE_SIZE, type PaginatedResult } from '../types/models'
import { docToData } from './firestore'

export type OrderSpec = { field: string; direction?: 'asc' | 'desc' }

export type WhereSpec = {
  field: string
  op: WhereFilterOp
  value: unknown
}

/**
 * Cursor-based pagination helper.
 * Pass `afterSnap` from the previous page's last document for efficient reads.
 */
export async function fetchPage<T extends DocumentData>(
  db: Firestore,
  collectionPath: string,
  options: {
    filters?: WhereSpec[]
    order?: OrderSpec[]
    pageSize?: number
    afterSnap?: QueryDocumentSnapshot<DocumentData> | null
  } = {},
): Promise<PaginatedResult<T & { id: string }> & { lastSnap: QueryDocumentSnapshot<DocumentData> | null }> {
  const pageSize = options.pageSize ?? DEFAULT_PAGE_SIZE
  const constraints: QueryConstraint[] = []

  for (const filter of options.filters ?? []) {
    constraints.push(where(filter.field, filter.op, filter.value))
  }

  const orders = options.order?.length
    ? options.order
    : [{ field: 'updatedAt', direction: 'desc' as const }]

  for (const ord of orders) {
    constraints.push(orderBy(ord.field, ord.direction ?? 'asc'))
  }

  constraints.push(limit(pageSize + 1))

  if (options.afterSnap) {
    constraints.push(startAfter(options.afterSnap))
  }

  const q: Query<DocumentData> = query(collection(db, collectionPath), ...constraints)
  const snap = await getDocs(q)
  const docs = snap.docs
  const hasMore = docs.length > pageSize
  const pageDocs = hasMore ? docs.slice(0, pageSize) : docs
  const items = pageDocs.map((d) => docToData<T>(d))
  const last = pageDocs[pageDocs.length - 1] ?? null

  return {
    items,
    hasMore,
    nextCursor: hasMore && last ? last.id : null,
    lastSnap: last,
  }
}
