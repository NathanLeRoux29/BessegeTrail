import migrations from '#bessege/migrations'

// CNT-26 : seul l'admin crée la base et applique les migrations, à son démarrage.
// En cas d'échec, le serveur ne démarre pas.
export default defineNitroPlugin(() => {
  prepareDatabase(useRuntimeConfig().databasePath, migrations)
})
