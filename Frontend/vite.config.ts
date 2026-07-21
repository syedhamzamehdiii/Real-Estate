import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.dirname(fileURLToPath(import.meta.url))
const frontendModules = path.resolve(root, 'node_modules')

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    // Backend client code lives outside Frontend/; force its deps to Frontend/node_modules
    // so Vercel (Root Directory = Frontend) can bundle without Backend/node_modules.
    alias: [
      {
        find: '@estate-line/backend/client',
        replacement: path.resolve(root, '../Backend/src/client'),
      },
      {
        find: '@estate-line/backend',
        replacement: path.resolve(root, '../Backend/src'),
      },
      {
        find: /^firebase$/,
        replacement: path.resolve(frontendModules, 'firebase'),
      },
      {
        find: /^firebase\/(.+)$/,
        replacement: path.resolve(frontendModules, 'firebase/$1'),
      },
      {
        find: /^zod$/,
        replacement: path.resolve(frontendModules, 'zod'),
      },
    ],
    dedupe: ['firebase', 'zod'],
  },
  server: {
    fs: {
      allow: [root, path.resolve(root, '../Backend')],
    },
  },
  optimizeDeps: {
    include: ['firebase/app', 'firebase/auth', 'firebase/firestore', 'firebase/storage', 'zod'],
  },
})
