import migrations from '#bessege/migrations'
import { demoContent } from '#bessege/content/demo'

// CNT-26 : seul l'admin crée la base et applique les migrations, à son démarrage.
// CNT-16 : il charge ensuite le contenu de démo des blocs absents de la base.
// En cas d'échec, le serveur ne démarre pas.
export default defineNitroPlugin(() => {
  const { databasePath } = useRuntimeConfig()
  prepareDatabase(databasePath, migrations)
  const loaded = loadDemoContent(databasePath, demoContent)
  if (loaded.length > 0) console.info(`Contenu de démo chargé : ${loaded.join(', ')}`)
})
