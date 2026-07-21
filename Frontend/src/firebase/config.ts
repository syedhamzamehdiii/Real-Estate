/**
 * Firebase integration stub.
 * Backend wiring is owned separately — keep this module as the single entry
 * point for Auth, Firestore, and Storage once credentials are available.
 *
 * Admin login currently uses `src/lib/adminAuth.ts` (frontend session).
 * When ready, replace that module’s login/logout with:
 *   signInWithEmailAndPassword / signOut from firebase/auth
 * via helpers exported from this file.
 */

export const firebaseReady = false

export function getFirebaseApp(): null {
  // TODO: initializeApp(firebaseConfig) when env vars are provided
  return null
}
