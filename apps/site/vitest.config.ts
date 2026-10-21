import { defineConfig } from 'vitest/config'

// Les tests d'intégration construisent et démarrent l'app : délais allongés.
export default defineConfig({
  test: {
    environment: 'node',
    testTimeout: 60_000,
    hookTimeout: 300_000,
  },
})
