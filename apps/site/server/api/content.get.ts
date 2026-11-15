// Contenu publié de tous les blocs (CNT-08), lu par les pages du site. Lecture
// seule : le site n'a aucune route d'écriture.
export default defineEventHandler(() => {
  try {
    return readPublishedContent(useRuntimeConfig().databasePath)
  }
  catch (error) {
    // Base absente ou illisible (l'admin ne l'a pas encore créée).
    console.error(error)
    throw createError({ statusCode: 503, message: 'Contenu indisponible' })
  }
})
