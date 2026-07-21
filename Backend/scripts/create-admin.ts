import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import admin from 'firebase-admin'

const __dirname = fileURLToPath(new URL('.', import.meta.url))
const root = resolve(__dirname, '..')

function loadEnvFile() {
  const envPath = resolve(root, '.env')
  if (!existsSync(envPath)) return
  for (const line of readFileSync(envPath, 'utf8').split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq < 0) continue
    const key = trimmed.slice(0, eq).trim()
    const value = trimmed.slice(eq + 1).trim()
    if (!process.env[key]) process.env[key] = value
  }
}

function initAdmin() {
  loadEnvFile()
  if (admin.apps.length) return admin.app()

  const credPath =
    process.env.GOOGLE_APPLICATION_CREDENTIALS ||
    resolve(root, 'serviceAccountKey.json')

  if (!existsSync(credPath)) {
    throw new Error(
      `Missing service account key at ${credPath}. See Backend/.env.example.`,
    )
  }

  return admin.initializeApp({
    credential: admin.credential.cert(credPath),
    ...(process.env.FIREBASE_PROJECT_ID
      ? { projectId: process.env.FIREBASE_PROJECT_ID }
      : {}),
  })
}

async function createAdmin() {
  initAdmin()
  const email =
    process.env.ADMIN_EMAIL?.trim() || 'admin@estatelineproperties.com'
  const password = process.env.ADMIN_PASSWORD || ''

  if (password.length < 8) {
    throw new Error('Set ADMIN_PASSWORD (min 8 chars) in Backend/.env')
  }

  const auth = admin.auth()
  let user
  try {
    user = await auth.getUserByEmail(email)
    await auth.updateUser(user.uid, { password, emailVerified: true })
    console.log(`Updated existing admin: ${email} (${user.uid})`)
  } catch {
    user = await auth.createUser({
      email,
      password,
      emailVerified: true,
      displayName: 'Estate Line Admin',
    })
    console.log(`Created admin: ${email} (${user.uid})`)
  }

  console.log('\nUse this account in the SPA admin login.')
  console.log('Enable Email/Password in Firebase Console → Authentication.')
}

createAdmin().catch((err) => {
  console.error(err)
  process.exit(1)
})
