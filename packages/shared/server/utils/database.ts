import { mkdirSync } from 'node:fs'
import { dirname } from 'node:path'
import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import type { MigrationMeta } from 'drizzle-orm/migrator'
import * as schema from '../database/schema'

// Base SQLite du contenu : l'admin l'écrit, le site la lit (CNT-26, CNT-27).
//
// Journal DELETE, jamais WAL : en WAL, même un lecteur doit écrire un fichier
// `-shm` à côté de la base, ce qui est impossible depuis le volume en lecture
// seule du site.

export function openWritableDatabase(path: string) {
  mkdirSync(dirname(path), { recursive: true })
  const client = new Database(path)
  client.pragma('journal_mode = DELETE')
  client.pragma('foreign_keys = ON')
  return drizzle(client, { schema })
}

// Connexion du site : toute écriture échoue (SQLITE_READONLY), et une base
// absente n'est jamais créée.
export function openReadOnlyDatabase(path: string) {
  try {
    return drizzle(new Database(path, { readonly: true, fileMustExist: true }), { schema })
  }
  catch (error) {
    throw new Error(`Base de données introuvable : ${path}. L’admin la crée à son démarrage.`, { cause: error })
  }
}

// Champs internes de Drizzle, absents de ses types : c'est ce qu'appelle son
// `migrate()`, qui lit lui-même les fichiers sur le disque. Ici, les migrations
// sont intégrées au code compilé de l'admin (aucun dossier à copier dans l'image).
interface DrizzleMigrator {
  dialect: { migrate: (migrations: MigrationMeta[], session: unknown) => void }
  session: unknown
}

// Démarrage de l'admin : crée la base si besoin et applique les migrations en
// attente, dans une transaction (un échec laisse la base à sa version précédente).
export function prepareDatabase(path: string, migrations: MigrationMeta[]): void {
  const db = openWritableDatabase(path)
  try {
    const { dialect, session } = db as unknown as DrizzleMigrator
    dialect.migrate(migrations, session)
  }
  finally {
    db.$client.close()
  }
}
