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

Backend integration is intentionally stubbed in `src/firebase/config.ts`. Replace mock data in `src/data/` with Firestore reads when ready.
