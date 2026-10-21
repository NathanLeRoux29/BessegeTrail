import { defineConfig } from 'vitest/config'

// Tests des images Docker : lents (construction des images), lancés à part
// avec `pnpm test:docker`.
export default defineConfig({
  test: {
    root: import.meta.dirname,
    environment: 'node',
    testTimeout: 90_000,
    hookTimeout: 600_000,
    fileParallelism: false,
  },
})
