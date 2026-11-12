import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'

// Schéma de la base (CNT-26). Toute modification se termine par `pnpm db:generate`,
// qui écrit la migration à versionner dans ./migrations.

// Éditeurs du back-office (spec 08). Comptes créés en ligne de commande (AUT-01).
export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  passwordHash: text('password_hash').notNull(),
  // Mot de passe temporaire : à changer à la prochaine connexion (AUT-03).
  mustChangePassword: integer('must_change_password', { mode: 'boolean' }).notNull().default(true),
  active: integer('active', { mode: 'boolean' }).notNull().default(true),
  // Incrémenté pour invalider les sessions en cours (AUT-09).
  sessionVersion: integer('session_version').notNull().default(0),
})

// Un bloc de contenu par clé (spec 05) : version publiée et brouillon, au format
// JSON validé par le schéma Zod du bloc.
export const blocks = sqliteTable('blocks', {
  key: text('key').primaryKey(),
  published: text('published', { mode: 'json' }).notNull(),
  // Auteur et date (CNT-12) : vides pour le contenu de démonstration.
  publishedAt: integer('published_at', { mode: 'timestamp' }),
  publishedBy: integer('published_by').references(() => users.id),
  draft: text('draft', { mode: 'json' }),
  draftAt: integer('draft_at', { mode: 'timestamp' }),
  draftBy: integer('draft_by').references(() => users.id),
  // Incrémenté à chaque enregistrement : verrouillage optimiste (CNT-13).
  revision: integer('revision').notNull().default(0),
})

// Versions publiées d'une page, pour l'historique (CNT-14, CNT-15).
export const pageVersions = sqliteTable('page_versions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  page: text('page').notNull(),
  // Copie des blocs de la page au moment de la publication, par clé.
  blocks: text('blocks', { mode: 'json' }).$type<Record<string, unknown>>().notNull(),
  publishedAt: integer('published_at', { mode: 'timestamp' }).notNull(),
  publishedBy: integer('published_by').references(() => users.id),
}, table => [index('page_versions_page_idx').on(table.page, table.publishedAt)])
