# Estate Line Properties — Frontend

React + TypeScript + Vite frontend for Estate Line Properties.

## Folder structure

```
src/
  app/           # App shell + router
  components/
    layout/      # Header, Footer, FABs, scroll river
    ui/          # Shared Button, Reveal, TiltCard
  features/      # Page modules (home, listings, about, resources, contact)
  data/          # Mock content (swap for Firebase later)
  firebase/      # Backend stub — wire credentials here
  hooks/         # Scroll, reveal, count-up, media query
  lib/           # Helpers (listing filters)
  styles/        # Design tokens + global CSS
  types/         # Shared TypeScript types
```

## Run locally

```bash
npm install
npm run dev
```

## Scripts

- `npm run dev` — development server
- `npm run build` — production build
- `npm run preview` — preview production build

## Firebase

Backend lives in `../Backend`. When `VITE_FIREBASE_*` vars are set in `.env`, the SPA uses Firestore, Storage, and Auth via `@estate-line/backend/client`. Without them, listings/resources keep the existing localStorage behavior.

See `../Backend/README.md` for rules, seeding, and admin setup. Copy `.env.example` → `.env` and fill Firebase web config from the console.
