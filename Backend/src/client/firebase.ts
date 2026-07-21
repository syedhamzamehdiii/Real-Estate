import { initializeApp, getApps, type FirebaseApp, type FirebaseOptions } from 'firebase/app'
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

let app: FirebaseApp | null = null
let auth: Auth | null = null
let db: Firestore | null = null
let storage: FirebaseStorage | null = null

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
  if (!app) {
    app = getApps().length ? getApps()[0]! : initializeApp(config)
    auth = getAuth(app)
    db = getFirestore(app)
    storage = getStorage(app)
  }
  return { app, auth: auth!, db: db!, storage: storage! }
}

export function getFirebaseApp(): FirebaseApp {
  if (!app) throw new Error('Firebase not initialized. Call initFirebase() first.')
  return app
}

export function getFirebaseAuth(): Auth {
  if (!auth) throw new Error('Firebase Auth not initialized. Call initFirebase() first.')
  return auth
}

export function getDb(): Firestore {
  if (!db) throw new Error('Firestore not initialized. Call initFirebase() first.')
  return db
}

export function getFirebaseStorage(): FirebaseStorage {
  if (!storage) throw new Error('Storage not initialized. Call initFirebase() first.')
  return storage
}

export function isFirebaseInitialized(): boolean {
  return app != null
}
