/**
 * Firebase client bootstrap.
 * When VITE_FIREBASE_* vars are set, the SPA uses Backend client services.
 * Otherwise contexts keep the existing localStorage behavior.
 */

import {
  initFirebase,
  isFirebaseConfigComplete,
  isFirebaseInitialized,
  getFirebaseApp as getApp,
  type EstateFirebaseConfig,
} from '@estate-line/backend/client'

function readConfig(): EstateFirebaseConfig | null {
  const config = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY as string | undefined,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string | undefined,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID as string | undefined,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET as string | undefined,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID as string | undefined,
    appId: import.meta.env.VITE_FIREBASE_APP_ID as string | undefined,
  }

  if (!isFirebaseConfigComplete(config)) return null
  return config
}

const config = readConfig()

export const firebaseReady = Boolean(config)
export const firebaseConfig = config

if (config && !isFirebaseInitialized()) {
  initFirebase(config)
}

export function getFirebaseApp() {
  if (!firebaseReady) return null
  return getApp()
}
