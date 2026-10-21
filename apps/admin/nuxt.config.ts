export default defineNuxtConfig({
  extends: ['../../packages/shared'],
  devtools: { enabled: false },
  runtimeConfig: {
    appName: 'admin',
  },
  compatibilityDate: '2026-10-01',
})
