import { defineConfig } from 'vite'

// Built as an embeddable widget inside the main portfolio site (see /product.html).
// Production build is scoped under its own path so hashed asset URLs
// (/interactive-map/dist/assets/...) never collide with the portfolio's own /assets/.
// Dev server (`npm run dev`) keeps base '/' so localhost:5173/ still works standalone.
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/interactive-map/dist/' : '/'
}))
