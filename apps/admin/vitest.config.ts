import { defineConfig } from 'vitest/config'

// Les tests d'intégration construisent et démarrent l'app : délais allongés.
export default defineConfig({
  test: {
    environment: 'node',
    testTimeout: 60_000,
    hookTimeout: 300_000,
    // DEP-08 : la CI échoue sous 80 % de couverture du code serveur. Les fichiers
    // de route (server/api, server/routes) restent minces et sont couverts par
    // les tests d'intégration ; leur logique vit dans server/utils.
    coverage: {
      enabled: true,
      provider: 'v8',
      include: ['server/**/*.ts'],
      exclude: ['server/api/**', 'server/routes/**'],
      thresholds: { lines: 80, functions: 80, branches: 80, statements: 80 },
    },
  },
})
