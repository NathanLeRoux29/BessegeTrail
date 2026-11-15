import { createConfigForNuxt } from '@nuxt/eslint-config/flat'

// Une seule configuration pour tout le dépôt. Les règles de mise en forme
// (stylistic) remplacent Prettier.
export default createConfigForNuxt({
  features: {
    stylistic: true,
  },
  // Dossiers des apps Nuxt : les pages et layouts gardent leurs noms de fichier
  // (index.vue, default.vue), imposés par Nuxt.
  dirs: {
    src: ['apps/site/app', 'apps/admin/app', 'packages/shared/app'],
  },
}).append({
  ignores: ['docs/maquettes/**', '**/.nuxt/**', '**/.output/**', '**/coverage/**'],
})
