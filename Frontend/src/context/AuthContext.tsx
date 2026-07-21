import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { firebaseReady } from '../firebase/config'
import {
  getSession,
  isAuthenticated,
  loginWithEmailPassword,
  logout as clearSession,
  sessionFromFirebaseUser,
  type AdminSession,
} from '../lib/adminAuth'
import { subscribeAuth } from '@estate-line/backend/client'

type AuthContextValue = {
  user: AdminSession | null
  ready: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminSession | null>(() =>
    firebaseReady ? null : getSession(),
  )
  const [ready, setReady] = useState(!firebaseReady)

  useEffect(() => {
    if (!firebaseReady) return

    const unsub = subscribeAuth(async (fbUser) => {
      if (!fbUser) {
        setUser(null)
        setReady(true)
        return
      }
      const session = await sessionFromFirebaseUser()
      setUser(session)
      setReady(true)
    })
    return unsub
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const session = await loginWithEmailPassword(email, password)
    setUser(session)
  }, [])

  const logout = useCallback(() => {
    void clearSession().then(() => setUser(null))
  }, [])

  const value = useMemo(
    () => ({
      user: user && (firebaseReady || isAuthenticated()) ? user : null,
      ready,
      login,
      logout,
    }),
    [user, ready, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return ctx
}
