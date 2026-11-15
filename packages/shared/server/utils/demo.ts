import { blockKeys, blockSchemas, type BlockKey } from '../../shared/content/blocks'
import { blocks } from '../database/schema'
import { openWritableDatabase } from './database'

// Contenu de démonstration (CNT-16 à CNT-18), chargé par l'admin à son démarrage,
// après les migrations. Seules les clés absentes de la base sont écrites : un
// bloc existant n'est jamais écrasé.
//
// - Base vide (première installation) : tout le contenu de démo, publié.
// - Base qui a déjà du contenu : seule une section ajoutée depuis reçoit sa démo,
//   masquée si elle est masquable (CNT-30), pour que l'éditeur la complète avant
//   de l'afficher.
//
// Renvoie les clés chargées.
export function loadDemoContent(path: string, demo: Record<BlockKey, unknown>): BlockKey[] {
  const db = openWritableDatabase(path)
  try {
    return db.transaction((tx) => {
      const existing = new Set(tx.select({ key: blocks.key }).from(blocks).all().map(row => row.key))
      const missing = blockKeys.filter(key => !existing.has(key))
      const publishedAt = new Date()

      for (const key of missing) {
        const result = blockSchemas[key].safeParse(demo[key])
        // Une erreur annule la transaction : aucun bloc n'est écrit.
        if (!result.success) throw new Error(`Contenu de démo invalide pour le bloc ${key}`, { cause: result.error })
        const published = existing.size > 0 && 'visible' in result.data ? { ...result.data, visible: false } : result.data
        tx.insert(blocks).values({ key, published, publishedAt }).run()
      }
      return missing
    })
  }
  finally {
    db.$client.close()
  }
}
