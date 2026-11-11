import { defineConfig } from 'vitest/config'

// Tests rapides du dépôt lui-même (workflow de CI…). Les paquets ont leur propre
// configuration, les images Docker aussi (`pnpm test:docker`).
export default defineConfig({
  test: {
    include: ['test/**/*.test.ts'],
    environment: 'node',
  },
})
