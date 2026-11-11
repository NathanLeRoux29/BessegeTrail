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
})
