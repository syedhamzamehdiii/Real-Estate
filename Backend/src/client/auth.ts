import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  type User,
  type Unsubscribe,
} from 'firebase/auth'
import { getFirebaseAuth } from './firebase'

export type AuthSession = {
  uid: string
  email: string
  token: string
  expiresAt: number
}

/** Email/password admin login. Throws with a user-facing message on failure. */
export async function loginWithEmailPassword(
  email: string,
  password: string,
): Promise<AuthSession> {
  const auth = getFirebaseAuth()
  const credential = await signInWithEmailAndPassword(auth, email.trim(), password)
  const tokenResult = await credential.user.getIdTokenResult()
  const expiresAt = new Date(tokenResult.expirationTime).getTime()
  return {
    uid: credential.user.uid,
    email: credential.user.email ?? email.trim().toLowerCase(),
    token: tokenResult.token,
    expiresAt,
  }
}

export async function logout(): Promise<void> {
  await signOut(getFirebaseAuth())
}

export function getCurrentUser(): User | null {
  return getFirebaseAuth().currentUser
}

export async function getIdToken(forceRefresh = false): Promise<string | null> {
  const user = getCurrentUser()
  if (!user) return null
  return user.getIdToken(forceRefresh)
}

/** Subscribe to auth state — use for SPA AuthProvider readiness. */
export function subscribeAuth(callback: (user: User | null) => void): Unsubscribe {
  return onAuthStateChanged(getFirebaseAuth(), callback)
}

export async function toAuthSession(user: User): Promise<AuthSession> {
  const tokenResult = await user.getIdTokenResult()
  return {
    uid: user.uid,
    email: user.email ?? '',
    token: tokenResult.token,
    expiresAt: new Date(tokenResult.expirationTime).getTime(),
  }
}
