/**
 * Admin auth — Firebase Auth when configured, local session gate otherwise.
 * Page UI stays the same either way.
 */

import { firebaseReady } from '../firebase/config'
import {
  loginWithEmailPassword as firebaseLogin,
  logout as firebaseLogout,
  getCurrentUser,
  toAuthSession,
} from '@estate-line/backend/client'

const SESSION_KEY = 'estate-line-admin-session'
const FAIL_KEY = 'estate-line-admin-login-fails'
const SESSION_HOURS = 8
const MAX_ATTEMPTS = 5
const LOCKOUT_MS = 60_000

export type AdminSession = {
  email: string
  token: string
  expiresAt: number
}

function expectedEmail() {
  return (
    (import.meta.env.VITE_ADMIN_EMAIL as string | undefined)?.trim().toLowerCase() ||
    'admin@estatelineproperties.com'
  )
}

function expectedPassword() {
  return (import.meta.env.VITE_ADMIN_PASSWORD as string | undefined) || 'EstateLine@2026'
}

function readFails(): { count: number; lockedUntil: number } {
  try {
    const raw = sessionStorage.getItem(FAIL_KEY)
    if (!raw) return { count: 0, lockedUntil: 0 }
    return JSON.parse(raw) as { count: number; lockedUntil: number }
  } catch {
    return { count: 0, lockedUntil: 0 }
  }
}

function writeFails(count: number, lockedUntil: number) {
  sessionStorage.setItem(FAIL_KEY, JSON.stringify({ count, lockedUntil }))
}

export function getLoginLockRemainingMs(): number {
  const { lockedUntil } = readFails()
  return Math.max(0, lockedUntil - Date.now())
}

export function getSession(): AdminSession | null {
  if (firebaseReady) {
    // AuthProvider drives session from onAuthStateChanged; sessionStorage not used.
    return null
  }
  try {
    const raw = sessionStorage.getItem(SESSION_KEY)
    if (!raw) return null
    const session = JSON.parse(raw) as AdminSession
    if (!session?.email || !session?.token || !session?.expiresAt) return null
    if (Date.now() > session.expiresAt) {
      sessionStorage.removeItem(SESSION_KEY)
      return null
    }
    return session
  } catch {
    return null
  }
}

export function isAuthenticated(): boolean {
  if (firebaseReady) return getCurrentUser() != null
  return getSession() != null
}

function createSession(email: string): AdminSession {
  const bytes = new Uint8Array(24)
  crypto.getRandomValues(bytes)
  const token = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')
  return {
    email,
    token,
    expiresAt: Date.now() + SESSION_HOURS * 60 * 60 * 1000,
  }
}

export async function loginWithEmailPassword(
  email: string,
  password: string,
): Promise<AdminSession> {
  const lockMs = getLoginLockRemainingMs()
  if (lockMs > 0) {
    throw new Error(`Too many attempts. Try again in ${Math.ceil(lockMs / 1000)}s.`)
  }

  if (firebaseReady) {
    try {
      const session = await firebaseLogin(email, password)
      sessionStorage.removeItem(FAIL_KEY)
      return {
        email: session.email,
        token: session.token,
        expiresAt: session.expiresAt,
      }
    } catch {
      const fails = readFails()
      const count = fails.count + 1
      const lockedUntil = count >= MAX_ATTEMPTS ? Date.now() + LOCKOUT_MS : 0
      writeFails(count >= MAX_ATTEMPTS ? 0 : count, lockedUntil)
      throw new Error('Invalid email or password.')
    }
  }

  await new Promise((r) => setTimeout(r, 350))

  const normalized = email.trim().toLowerCase()
  const ok = normalized === expectedEmail() && password === expectedPassword()

  if (!ok) {
    const fails = readFails()
    const count = fails.count + 1
    const lockedUntil = count >= MAX_ATTEMPTS ? Date.now() + LOCKOUT_MS : 0
    writeFails(count >= MAX_ATTEMPTS ? 0 : count, lockedUntil)
    throw new Error('Invalid email or password.')
  }

  sessionStorage.removeItem(FAIL_KEY)
  const session = createSession(normalized)
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(session))
  return session
}

export async function logout(): Promise<void> {
  if (firebaseReady) {
    await firebaseLogout()
  }
  sessionStorage.removeItem(SESSION_KEY)
}

/** Hydrate AdminSession from the current Firebase user (if any). */
export async function sessionFromFirebaseUser(): Promise<AdminSession | null> {
  if (!firebaseReady) return null
  const user = getCurrentUser()
  if (!user) return null
  const session = await toAuthSession(user)
  return {
    email: session.email,
    token: session.token,
    expiresAt: session.expiresAt,
  }
}
