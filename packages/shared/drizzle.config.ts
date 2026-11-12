import { defineConfig } from 'drizzle-kit'

// `pnpm db:generate` : écrit la migration qui fait passer la base au schéma actuel.
// Les migrations sont appliquées par l'admin à son démarrage (CNT-26).
export default defineConfig({
  dialect: 'sqlite',
  schema: './server/database/schema.ts',
  out: './server/database/migrations',
})
