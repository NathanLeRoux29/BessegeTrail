import { fileURLToPath } from 'node:url'
import { readMigrationFiles } from 'drizzle-orm/migrator'

const migrationsFolder = fileURLToPath(new URL('../../packages/shared/server/database/migrations', import.meta.url))

export default defineNuxtConfig({
  extends: ['../../packages/shared'],
  devtools: { enabled: false },
  app: {
    head: { title: 'Back-office · Trail de Bessèges' },
  },
  runtimeConfig: {
    appName: 'admin',
  },
  compatibilityDate: '2026-10-01',
  nitro: {
    // Migrations lues au build et intégrées au code compilé : l'image n'a aucun
    // dossier de migrations à embarquer (CNT-26).
    virtual: {
      '#bessege/migrations': () => `export default ${JSON.stringify(readMigrationFiles({ migrationsFolder }))}`,
    },
  },
})
