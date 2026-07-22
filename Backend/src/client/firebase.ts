import { initializeApp, getApp, getApps, type FirebaseApp, type FirebaseOptions } from 'firebase/app'
import { getAuth, type Auth } from 'firebase/auth'
import { getFirestore, type Firestore } from 'firebase/firestore'
import { getStorage, type FirebaseStorage } from 'firebase/storage'

export type EstateFirebaseConfig = FirebaseOptions & {
  projectId: string
  apiKey: string
  authDomain: string
  storageBucket: string
  messagingSenderId: string
  appId: string
}

let configuredBucket: string | null = null

export function isFirebaseConfigComplete(
  config: Partial<EstateFirebaseConfig> | null | undefined,
): config is EstateFirebaseConfig {
  if (!config) return false
  return Boolean(
    config.apiKey &&
      config.authDomain &&
      config.projectId &&
      config.storageBucket &&
      config.messagingSenderId &&
      config.appId,
  )
}

/** Initialize (or reuse) the Firebase client SDK. Safe to call multiple times. */
export function initFirebase(config: EstateFirebaseConfig): {
  app: FirebaseApp
  auth: Auth
  db: Firestore
  storage: FirebaseStorage
} {
  configuredBucket = config.storageBucket
  const app = getApps().length ? getApp() : initializeApp(config)
  return {
    app,
    auth: getAuth(app),
    db: getFirestore(app),
    storage: getStorage(app, `gs://${config.storageBucket}`),
  }
}

function requireApp(): FirebaseApp {
  if (!getApps().length) {
    throw new Error('Firebase not initialized. Call initFirebase() first.')
  }
  return getApp()
}

export function getFirebaseApp(): FirebaseApp {
  return requireApp()
}

/** Always resolve from the shared app — avoids stale module singletons under Vite HMR. */
export function getFirebaseAuth(): Auth {
  return getAuth(requireApp())
}

export function getDb(): Firestore {
  return getFirestore(requireApp())
}

export function getFirebaseStorage(): FirebaseStorage {
  const app = requireApp()
  const bucket = configuredBucket || (app.options.storageBucket as string | undefined)
  if (!bucket) {
    throw new Error('Firebase Storage bucket is not configured.')
  }
  return getStorage(app, `gs://${bucket}`)
}

export function isFirebaseInitialized(): boolean {
  return getApps().length > 0
}
