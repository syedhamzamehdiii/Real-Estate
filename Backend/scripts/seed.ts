import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import admin from 'firebase-admin'
import {
  FEATURED_LISTING_LIMIT,
  FEATURED_RESOURCE_LIMIT,
} from '../src/types/models'
import { COLLECTIONS, META_DOCS } from '../src/config/constants'
import { SEED_LISTINGS, SEED_MAIN_AREAS, SEED_RESOURCES } from '../src/data/seed'

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
      `Missing service account key at ${credPath}.\n` +
        'Download one from Firebase Console → Project settings → Service accounts,\n' +
        'save as Backend/serviceAccountKey.json, then re-run.',
    )
  }

  const projectId = process.env.FIREBASE_PROJECT_ID
  return admin.initializeApp({
    credential: admin.credential.cert(credPath),
    ...(projectId ? { projectId } : {}),
  })
}

function stripUndefined<T extends Record<string, unknown>>(obj: T): T {
  const out: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined) continue
    if (v !== null && typeof v === 'object' && !Array.isArray(v)) {
      out[k] = stripUndefined(v as Record<string, unknown>)
    } else {
      out[k] = v
    }
  }
  return out as T
}

async function seed() {
  initAdmin()
  const db = admin.firestore()
  const now = admin.firestore.FieldValue.serverTimestamp()
  const systemOwner = 'seed-script'

  console.log('Seeding listings…')
  for (const listing of SEED_LISTINGS) {
    await db
      .collection(COLLECTIONS.listings)
      .doc(listing.id)
      .set(
        stripUndefined({
          ...listing,
          ownerId: systemOwner,
          createdBy: systemOwner,
          updatedBy: systemOwner,
          createdAt: now,
          updatedAt: now,
        }),
        { merge: true },
      )
    console.log(`  ✓ listings/${listing.id}`)
  }

  console.log('Seeding resources…')
  for (const post of SEED_RESOURCES) {
    await db
      .collection(COLLECTIONS.resources)
      .doc(post.id)
      .set(
        stripUndefined({
          ...post,
          ownerId: systemOwner,
          createdBy: systemOwner,
          updatedBy: systemOwner,
          createdAt: now,
          updatedAt: now,
        }),
        { merge: true },
      )
    console.log(`  ✓ resources/${post.id}`)
  }

  const listingFeatured = SEED_LISTINGS.filter((l) => l.featured)
    .map((l) => l.id)
    .slice(0, FEATURED_LISTING_LIMIT)

  const resourceFeatured = SEED_RESOURCES.filter((r) => r.featured)
    .map((r) => r.id)
    .slice(0, FEATURED_RESOURCE_LIMIT)

  const maxResourceId = Math.max(
    ...SEED_RESOURCES.map((r) => Number(r.id)).filter((n) => Number.isFinite(n)),
    0,
  )

  await db.collection(COLLECTIONS.meta).doc(META_DOCS.listings).set(
    {
      featuredOrder: listingFeatured,
      mainAreas: SEED_MAIN_AREAS,
      updatedAt: now,
    },
    { merge: true },
  )
  console.log('  ✓ meta/listings')

  await db.collection(COLLECTIONS.meta).doc(META_DOCS.resources).set(
    {
      featuredOrder: resourceFeatured,
      nextNumericId: maxResourceId + 1,
      updatedAt: now,
    },
    { merge: true },
  )
  console.log('  ✓ meta/resources')

  console.log('\nSeed complete.')
}

seed().catch((err) => {
  console.error(err)
  process.exit(1)
})
