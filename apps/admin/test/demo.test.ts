import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { DatabaseSync } from 'node:sqlite'
import { fileURLToPath } from 'node:url'
import { readMigrationFiles } from 'drizzle-orm/migrator'
import { afterAll, describe, expect, it } from 'vitest'
import { setup } from '@nuxt/test-utils/e2e'
import { prepareDatabase } from '../../../packages/shared/server/utils/database'

// Base qui contient déjà un bloc modifié par un éditeur, avant le démarrage.
const dir = mkdtempSync(join(tmpdir(), 'bessege-admin-'))
const path = join(dir, 'bessege.sqlite')
const migrationsFolder = fileURLToPath(new URL('../../../packages/shared/server/database/migrations', import.meta.url))
prepareDatabase(path, readMigrationFiles({ migrationsFolder }))
const existing = new DatabaseSync(path)
existing.prepare('INSERT INTO blocks (key, published, revision) VALUES (?, ?, ?)').run('home.presentation', JSON.stringify({ visible: true, title: 'Titre modifié' }), 4)
existing.close()

describe('contenu de démo (admin, base déjà remplie)', async () => {
  await setup({ rootDir: fileURLToPath(new URL('..', import.meta.url)), env: { NUXT_DATABASE_PATH: path } })

  afterAll(() => rmSync(dir, { recursive: true, force: true }))

  it('CNT-18 : l’admin démarré sur une base qui a du contenu n’écrase pas un bloc modifié', () => {
    const db = new DatabaseSync(path, { readOnly: true })
    const row = db.prepare('SELECT published, revision FROM blocks WHERE key = ?').get('home.presentation')
    db.close()

    expect(row).toEqual({ published: JSON.stringify({ visible: true, title: 'Titre modifié' }), revision: 4 })
  })
})
