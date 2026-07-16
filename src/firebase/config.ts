/**
 * Firebase integration stub.
 * Backend wiring is owned separately — keep this module as the single entry
 * point for auth, Firestore, and Storage once credentials are available.
 */

export const firebaseReady = false

export function getFirebaseApp(): null {
  // TODO: initializeApp(firebaseConfig) when env vars are provided
  return null
}
