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

async function main() {
  loadEnvFile()
  const credPath =
    process.env.GOOGLE_APPLICATION_CREDENTIALS ||
    resolve(root, 'serviceAccountKey.json')

  admin.initializeApp({
    credential: admin.credential.cert(
      JSON.parse(readFileSync(credPath, 'utf8')) as admin.ServiceAccount,
    ),
    projectId: process.env.FIREBASE_PROJECT_ID || 'real-estate-project-d4cbe',
  })

  const db = admin.firestore()
  const metaRef = db.collection('meta').doc('listings')
  const metaSnap = await metaRef.get()
  const meta = metaSnap.exists ? metaSnap.data() : {}
  const featuredOrder = Array.isArray(meta?.featuredOrder)
    ? (meta.featuredOrder as string[]).slice(0, 3)
    : []
  const featuredSet = new Set(featuredOrder)

  console.log('featuredOrder:', featuredOrder)

  const listings = await db.collection('listings').get()
  let updated = 0
  const batch = db.batch()
  for (const docSnap of listings.docs) {
    const should = featuredSet.has(docSnap.id)
    const current = Boolean(docSnap.data().featured)
    if (current === should) continue
    batch.update(docSnap.ref, {
      featured: should,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    })
    updated += 1
    console.log(`  ${docSnap.id}: featured ${current} → ${should}`)
  }
  if (updated) await batch.commit()
  console.log(`Synced featured flags on ${updated} listing(s)`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
