import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    // DEP-08 : la CI échoue sous 80 % de couverture. Les fichiers de route
    // (server/api, server/routes) restent minces et sont couverts par les tests
    // d'intégration des apps ; leur logique vit dans server/utils.
    coverage: {
      enabled: true,
      provider: 'v8',
      include: ['**/*.{ts,vue}'],
      exclude: ['test/**', '**/*.config.ts', 'server/api/**', 'server/routes/**'],
      thresholds: { lines: 80, functions: 80, branches: 80, statements: 80 },
    },
  },
})
