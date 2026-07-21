# Estate Line Properties — Firebase Backend

Production-ready Firebase backend for the Estate Line SPA. Owns Firestore data modeling, Storage layout, security rules, validation, CRUD services, seeding, and admin auth provisioning.

The Frontend keeps the same UX contracts. When Firebase env vars are present it uses this client layer; otherwise it falls back to localStorage.

## Folder structure

```
Backend/
  firebase.json              # Firestore + Storage + emulators
  .firebaserc                # Default project id
  firestore.rules            # Security rules
  firestore.indexes.json     # Composite query indexes
  storage.rules              # Upload size/type + path rules
  package.json
  scripts/
    seed.ts                  # Seed listings, resources, meta
    create-admin.ts          # Create Email/Password admin user
  src/
    config/constants.ts      # Collection + Storage path constants
    types/models.ts          # Domain + Firestore document types
    validation/              # Zod schemas (listing, resource, inquiry)
    utils/                   # IDs, featured slots, pagination
    data/seed.ts             # Canonical seed content
    client/                  # Browser/Node Firebase client SDK services
      firebase.ts
      auth.ts
      storage.ts
      meta.ts
      listings.ts
      resources.ts
      inquiries.ts
    index.ts                 # Package exports
```

## Data model

### `listings/{listingId}`

| Field | Notes |
|-------|--------|
| All SPA `Listing` fields | `id`, `title`, `location`, `locationKey`, `type`, `status`, `priceLabel`, `priceValue`, `image`, `images?`, `beds?`, `baths?`, `sizeLabel`, `description`, `featured?`, `details?` |
| `ownerId`, `createdBy`, `updatedBy` | Firebase Auth uid (or `seed-script`) |
| `createdAt`, `updatedAt` | Server timestamps |

Doc id = listing slug id (e.g. `willowmere-villa`).

### `resources/{resourceId}`

| Field | Notes |
|-------|--------|
| All SPA `BlogPost` fields | including unique `slug` |
| Ownership + timestamps | same as listings |

Doc id = numeric string (`"1"`, `"2"`, …) matching the SPA.

### `meta/listings`

```json
{
  "featuredOrder": ["id-a", "id-b", "id-c"],
  "mainAreas": [{ "value": "dha-phase-6", "label": "DHA Phase 6, Lahore" }],
  "updatedAt": "<timestamp>"
}
```

Featured cap: **3** (homepage).

### `meta/resources`

```json
{
  "featuredOrder": ["1", "2", "3", "4", "5"],
  "nextNumericId": 6,
  "updatedAt": "<timestamp>"
}
```

Featured cap: **5**.

### `inquiries/{autoId}`

Contact form submissions: `name`, `email`, `phone`, `message`, `interest`, `status` (`new`|`read`|`archived`), `createdAt`.

## Storage layout

```
listings/{listingId}/cover.jpg
listings/{listingId}/gallery/{uuid}.jpg
resources/{resourceId}/cover.jpg
```

- Public read (download URLs)
- Authenticated write, images only, max 8 MiB
- Client compresses before upload; data URLs from the admin forms are converted automatically on save

## Security model

| Path | Read | Write |
|------|------|-------|
| `listings`, `resources`, `meta` | Public | Authenticated admin |
| `inquiries` | Authenticated | Public **create** only (`status: new`) |
| Storage paths above | Public | Authenticated |

## Setup

### 1. Firebase project

1. Create a project in [Firebase Console](https://console.firebase.google.com/)
2. Enable **Authentication → Email/Password**
3. Create **Firestore** (production mode; rules come from this repo)
4. Enable **Storage**
5. Update `.firebaserc` with your project id

### 2. Install & configure

```bash
cd Backend
cp .env.example .env
npm install
```

Download a service account key (Project settings → Service accounts) to:

```
Backend/serviceAccountKey.json
```

### 3. Deploy rules & indexes

```bash
npx firebase login
npm run deploy
```

(`firebase-tools` is invoked via `npx` so it is not a permanent install.)

### 4. Create admin + seed

```bash
# Edit ADMIN_EMAIL / ADMIN_PASSWORD in .env first
npm run create-admin
npm run seed
```

### 5. Frontend env

In `Frontend/.env`:

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

(Copy from Firebase Console → Project settings → Your apps → Web.)

Without these vars the SPA keeps its localStorage behavior unchanged.

## Client API (used by Frontend)

```ts
import { client } from '@estate-line/backend'
// or: import { createListing, subscribeListings, ... } from '@estate-line/backend/client'

client.initFirebase(config)
client.subscribeListings((listings) => { ... })
await client.createListing(input, { mainAreaLabel, replaceFeaturedId })
await client.updateListing(id, listing, options)
await client.deleteListing(id)

client.subscribeResources((posts) => { ... })
await client.createResource(input, { replaceFeaturedId })
await client.getResourceBySlug(slug)

await client.createInquiry(contactFormData)
await client.loginWithEmailPassword(email, password)
```

Writes validate with Zod, upload data-URL images to Storage, update featured meta atomically with listing/resource docs, and stamp ownership + timestamps.

## Emulators

```bash
npm run emulators
```

Auth `9099`, Firestore `8080`, Storage `9199`, Emulator UI `4000`.

## Scripts

| Command | Purpose |
|---------|---------|
| `npm run seed` | Upsert seed listings/resources/meta |
| `npm run create-admin` | Create/update Email/Password admin |
| `npm run deploy` | Deploy Firestore rules/indexes + Storage rules |
| `npm run emulators` | Local Firebase emulators |
| `npm run typecheck` | TypeScript check |
