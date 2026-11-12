import { fileURLToPath } from 'node:url'

// Layer partagé : étendu par apps/site et apps/admin.
export default defineNuxtConfig({
  app: {
    head: {
      // Site en français uniquement (lu par les lecteurs d'écran).
      htmlAttrs: { lang: 'fr' },
    },
  },
  // Thème (spec 04) : jetons, polices et styles de base, identiques dans les deux
  // apps (THM-05). Chemin absolu : « ~ » désignerait le dossier de l'app.
  css: [fileURLToPath(new URL('./app/assets/css/main.css', import.meta.url))],
  runtimeConfig: {
    // Nom du service, défini par chaque app (« site » ou « admin »).
    appName: '',
    // Version publiée (DEP-13), fournie par l'image Docker via NUXT_APP_VERSION.
    appVersion: 'dev',
  },
})
