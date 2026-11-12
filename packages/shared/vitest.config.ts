import { defineConfig } from 'vitest/config'
import { defineVitestProject } from '@nuxt/test-utils/config'

export default defineConfig({
  test: {
    projects: [
      // Fonctions pures : Vitest seul.
      { test: { name: 'unit', include: ['test/*.test.ts'], environment: 'node' } },
      // Composants : environnement Nuxt (auto-imports, NuxtLink, #components).
      await defineVitestProject({ test: { name: 'nuxt', include: ['test/nuxt/**/*.test.ts'], environment: 'nuxt' } }),
    ],
    // DEP-08 : la CI échoue sous 80 % de couverture. Les fichiers de route
    // (server/api, server/routes) et les plugins (server/plugins) restent minces
    // et sont couverts par les tests d'intégration des apps ; leur logique vit
    // dans server/utils. Le schéma de la base est déclaratif : drizzle-kit
    // l'évalue dans le test des migrations, un autre processus que la couverture
    // ne voit pas.
    coverage: {
      enabled: true,
      provider: 'v8',
      include: ['**/*.{ts,vue}'],
      exclude: ['test/**', '.nuxt/**', '**/*.config.ts', 'server/api/**', 'server/routes/**', 'server/plugins/**', 'server/database/**'],
      thresholds: { lines: 80, functions: 80, branches: 80, statements: 80 },
    },
  },
})
