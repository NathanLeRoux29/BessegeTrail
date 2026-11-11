// Layer partagé : étendu par apps/site et apps/admin.
export default defineNuxtConfig({
  app: {
    head: {
      // Site en français uniquement (lu par les lecteurs d'écran).
      htmlAttrs: { lang: 'fr' },
    },
  },
  runtimeConfig: {
    // Nom du service, défini par chaque app (« site » ou « admin »).
    appName: '',
  },
})
