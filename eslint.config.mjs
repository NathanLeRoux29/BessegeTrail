import { createConfigForNuxt } from '@nuxt/eslint-config/flat'

// Une seule configuration pour tout le dépôt. Les règles de mise en forme
// (stylistic) remplacent Prettier.
export default createConfigForNuxt({
  features: {
    stylistic: true,
  },
}).append({
  ignores: ['docs/maquettes/**', '**/.nuxt/**', '**/.output/**', '**/coverage/**'],
})
