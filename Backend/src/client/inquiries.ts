import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
  type Unsubscribe,
} from 'firebase/firestore'
import { COLLECTIONS } from '../config/constants'
import type { ContactFormData, InquiryDocument, InquiryStatus } from '../types/models'
import { validateInquiryInput } from '../validation/inquiry'
import { getCurrentUser } from './auth'
import { getDb } from './firebase'

function requireUid(): string {
  const user = getCurrentUser()
  if (!user) throw new Error('You must be signed in to manage inquiries.')
  return user.uid
}

/** Public contact form submit — no auth required. */
export async function createInquiry(input: ContactFormData): Promise<string> {
  const parsed = validateInquiryInput(input)
  const ref = await addDoc(collection(getDb(), COLLECTIONS.inquiries), {
    ...parsed,
    status: 'new' as InquiryStatus,
    createdAt: serverTimestamp(),
  })
  return ref.id
}

export async function listInquiries(
  status?: InquiryStatus,
  pageSize = 50,
): Promise<InquiryDocument[]> {
  requireUid()
  const constraints = status
    ? [where('status', '==', status), orderBy('createdAt', 'desc'), limit(pageSize)]
    : [orderBy('createdAt', 'desc'), limit(pageSize)]

  const snap = await getDocs(query(collection(getDb(), COLLECTIONS.inquiries), ...constraints))
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as InquiryDocument)
}

export function subscribeInquiries(
  onData: (items: InquiryDocument[]) => void,
  onError?: (error: Error) => void,
): Unsubscribe {
  requireUid()
  const q = query(
    collection(getDb(), COLLECTIONS.inquiries),
    orderBy('createdAt', 'desc'),
    limit(100),
  )
  return onSnapshot(
    q,
    (snap) => {
      onData(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as InquiryDocument))
    },
    (err) => onError?.(err),
  )
}

export async function updateInquiryStatus(
  id: string,
  status: InquiryStatus,
): Promise<void> {
  requireUid()
  await updateDoc(doc(getDb(), COLLECTIONS.inquiries, id), { status })
}

export async function deleteInquiry(id: string): Promise<void> {
  requireUid()
  await deleteDoc(doc(getDb(), COLLECTIONS.inquiries, id))
}
