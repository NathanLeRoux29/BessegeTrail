export default defineNuxtConfig({
  extends: ['../../packages/shared'],
  devtools: { enabled: false },
  runtimeConfig: {
    appName: 'site',
  },
  compatibilityDate: '2026-10-01',
})
