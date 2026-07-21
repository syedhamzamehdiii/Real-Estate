import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  getSession,
  isAuthenticated,
  loginWithEmailPassword,
  logout as clearSession,
  type AdminSession,
} from '../lib/adminAuth'

type AuthContextValue = {
  user: AdminSession | null
  ready: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminSession | null>(() => getSession())
  const [ready] = useState(true)

  const login = useCallback(async (email: string, password: string) => {
    const session = await loginWithEmailPassword(email, password)
    setUser(session)
  }, [])

  const logout = useCallback(() => {
    clearSession()
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({
      user: user && isAuthenticated() ? user : null,
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
