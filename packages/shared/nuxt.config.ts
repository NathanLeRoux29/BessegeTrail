// Layer partagé : étendu par apps/site et apps/admin.
export default defineNuxtConfig({
  runtimeConfig: {
    // Nom du service, défini par chaque app (« site » ou « admin »).
    appName: '',
  },
})
