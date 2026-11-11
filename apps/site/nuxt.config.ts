export default defineNuxtConfig({
  extends: ['../../packages/shared'],
  devtools: { enabled: false },
  app: {
    head: { title: 'Trail de Bessèges' },
  },
  runtimeConfig: {
    appName: 'site',
  },
  compatibilityDate: '2026-10-01',
})
