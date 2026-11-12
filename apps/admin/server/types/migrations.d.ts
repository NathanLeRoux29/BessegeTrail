// Module virtuel défini dans nuxt.config.ts (nitro.virtual).
declare module '#bessege/migrations' {
  import type { MigrationMeta } from 'drizzle-orm/migrator'

  const migrations: MigrationMeta[]
  export default migrations
}
