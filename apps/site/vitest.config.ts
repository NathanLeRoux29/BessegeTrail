import { defineConfig } from 'vitest/config'
import { defineVitestProject } from '@nuxt/test-utils/config'

export default defineConfig({
  test: {
    projects: [
      // Tests d'intégration : ils construisent et démarrent l'app, délais allongés.
      { test: { name: 'integration', include: ['test/*.test.ts'], environment: 'node', testTimeout: 60_000, hookTimeout: 300_000 } },
      // Composables et composants du site : environnement Nuxt.
      await defineVitestProject({ test: { name: 'nuxt', include: ['test/nuxt/**/*.test.ts'], environment: 'nuxt' } }),
    ],
  },
})
