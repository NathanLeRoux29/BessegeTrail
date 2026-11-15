import { blockKeys, blockSchemas, type PublishedContent } from '../../shared/content/blocks'
import { blocks } from '../database/schema'
import { openReadOnlyDatabase } from './database'

// Lecture du contenu par le site public (CNT-08) : uniquement les versions
// publiées, jamais les brouillons.
//
// Pas de cache : lire et valider les 20 blocs prend moins d'une milliseconde.
// Une publication est donc visible dès la requête suivante (CNT-11), même si le
// fichier de la base a été remplacé (copie de la prod vers la préprod).
//
// Chaque bloc est revalidé par son schéma, qui complète les champs ajoutés
// depuis sa publication (CNT-30). Un bloc absent ou invalide prend les valeurs
// par défaut (section masquée) : le site reste en ligne, l'erreur est
// journalisée. L'admin refuse déjà de démarrer sur un contenu invalide (CNT-33).
export function readPublishedContent(path: string): PublishedContent {
  const db = openReadOnlyDatabase(path)
  let rows: { key: string, published: unknown }[]
  try {
    rows = db.select({ key: blocks.key, published: blocks.published }).from(blocks).all()
  }
  finally {
    db.$client.close()
  }

  const published = new Map(rows.map(row => [row.key, row.published]))
  return Object.fromEntries(blockKeys.map((key) => {
    const schema = blockSchemas[key]
    const result = schema.safeParse(published.get(key) ?? {})
    if (result.success) return [key, result.data]
    console.error(`Contenu publié invalide pour le bloc ${key}, valeurs par défaut affichées`, result.error.issues)
    return [key, schema.parse({})]
  })) as PublishedContent
}
