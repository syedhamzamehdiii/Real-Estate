/**
 * Admin auth — frontend gate until Firebase Auth is wired.
 * Swap `loginWithEmailPassword` / `logout` / `getSession` for Firebase
 * in `src/firebase/config.ts` without changing page UI.
 */

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
  return (import.meta.env.VITE_ADMIN_EMAIL as string | undefined)?.trim().toLowerCase()
    || 'admin@estatelineproperties.com'
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

/**
 * Local credential check. Replace body with Firebase Auth when ready:
 * `await signInWithEmailAndPassword(getAuth(), email, password)`
 */
export async function loginWithEmailPassword(
  email: string,
  password: string,
): Promise<AdminSession> {
  const lockMs = getLoginLockRemainingMs()
  if (lockMs > 0) {
    throw new Error(`Too many attempts. Try again in ${Math.ceil(lockMs / 1000)}s.`)
  }

  // Simulate network latency (matches future Firebase call)
  await new Promise((r) => setTimeout(r, 350))

  const normalized = email.trim().toLowerCase()
  const ok =
    normalized === expectedEmail() &&
    password === expectedPassword()

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

/** Replace with Firebase `signOut(getAuth())` when wired. */
export function logout(): void {
  sessionStorage.removeItem(SESSION_KEY)
}
