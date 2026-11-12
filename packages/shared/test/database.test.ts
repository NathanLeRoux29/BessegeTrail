import { chmodSync, existsSync, mkdirSync, mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { readMigrationFiles } from 'drizzle-orm/migrator'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { blocks, pageVersions } from '../server/database/schema'
import { openReadOnlyDatabase, openWritableDatabase, prepareDatabase } from '../server/utils/database'

const migrationsFolder = fileURLToPath(new URL('../server/database/migrations', import.meta.url))
const migrations = readMigrationFiles({ migrationsFolder })

let dir: string
let path: string

beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), 'bessege-db-'))
  path = join(dir, 'data', 'bessege.sqlite')
})

afterEach(() => {
  chmodSync(dir, 0o700)
  if (existsSync(join(dir, 'data'))) chmodSync(join(dir, 'data'), 0o700)
  rmSync(dir, { recursive: true, force: true })
})

function tableNames(file: string): string[] {
  const db = openReadOnlyDatabase(file)
  const rows = db.$client.prepare(`SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '__drizzle%' ORDER BY name`).all() as { name: string }[]
  db.$client.close()
  return rows.map(row => row.name)
}

function appliedMigrations(file: string): number {
  const db = openReadOnlyDatabase(file)
  const { count } = db.$client.prepare('SELECT count(*) AS count FROM __drizzle_migrations').get() as { count: number }
  db.$client.close()
  return count
}

describe('prepareDatabase (démarrage de l’admin)', () => {
  it('CNT-26 : les migrations créent les tables blocks, users et page_versions sur une base vide', () => {
    prepareDatabase(path, migrations)

    expect(tableNames(path)).toEqual(['blocks', 'page_versions', 'users'])
  })

  it('CNT-26 : relancer les migrations ne change rien', () => {
    prepareDatabase(path, migrations)
    const db = openWritableDatabase(path)
    db.insert(blocks).values({ key: 'footer', published: { text: 'Horizon Cévennes' } }).run()
    db.$client.close()

    prepareDatabase(path, migrations)

    expect(appliedMigrations(path)).toBe(migrations.length)
    const reader = openReadOnlyDatabase(path)
    expect(reader.select().from(blocks).all()).toHaveLength(1)
    reader.$client.close()
  })

  it('CNT-26 : garde le journal DELETE, jamais WAL (le site lit depuis un volume en lecture seule)', () => {
    prepareDatabase(path, migrations)

    const db = openReadOnlyDatabase(path)
    expect(db.$client.pragma('journal_mode', { simple: true })).toBe('delete')
    db.$client.close()
    expect(existsSync(`${path}-wal`)).toBe(false)
  })

  it('CNT-26 : un échec de migration est signalé et la base reste à sa version précédente', () => {
    prepareDatabase(path, migrations)
    const broken = [...migrations, { sql: ['CREATE TABLE blocks (key text)'], folderMillis: Date.now(), hash: 'cassee', bps: true }]

    expect(() => prepareDatabase(path, broken)).toThrow(/Failed to run the query 'CREATE TABLE blocks/)
    expect(appliedMigrations(path)).toBe(migrations.length)
  })
})

describe('openWritableDatabase (admin)', () => {
  it('vérifie les clés étrangères', () => {
    prepareDatabase(path, migrations)
    const db = openWritableDatabase(path)

    expect(() => db.insert(pageVersions).values({ page: 'home', blocks: {}, publishedAt: new Date(), publishedBy: 999 }).run())
      .toThrow(/FOREIGN KEY/)
    db.$client.close()
  })
})

describe('openReadOnlyDatabase (site)', () => {
  beforeEach(() => {
    prepareDatabase(path, migrations)
    const admin = openWritableDatabase(path)
    admin.insert(blocks).values({ key: 'footer', published: { text: 'Horizon Cévennes' } }).run()
    admin.$client.close()
  })

  it('CNT-27 : la connexion du site lit les données écrites par l’admin', () => {
    const site = openReadOnlyDatabase(path)

    expect(site.select().from(blocks).all()).toMatchObject([{ key: 'footer', published: { text: 'Horizon Cévennes' }, draft: null, revision: 0 }])
    site.$client.close()
  })

  it('CNT-27 : une écriture avec la connexion du site échoue', () => {
    const site = openReadOnlyDatabase(path)

    expect(() => site.insert(blocks).values({ key: 'header', published: {} }).run())
      .toThrow(expect.objectContaining({ code: 'SQLITE_READONLY' }))
    site.$client.close()
  })

  it.skipIf(process.getuid?.() === 0)('CNT-27 : la connexion du site lit une base dans un dossier en lecture seule', () => {
    chmodSync(join(dir, 'data'), 0o555)

    const site = openReadOnlyDatabase(path)

    expect(site.select().from(blocks).all()).toHaveLength(1)
    site.$client.close()
  })

  it('CNT-27 : la connexion du site ne crée jamais la base si elle est absente', () => {
    const missing = join(dir, 'absent', 'bessege.sqlite')

    expect(() => openReadOnlyDatabase(missing)).toThrow(`Base de données introuvable : ${missing}. L’admin la crée à son démarrage.`)
    expect(existsSync(join(dir, 'absent'))).toBe(false)
  })

  it('CNT-27 : la connexion du site ne crée pas non plus un fichier vide dans un dossier existant', () => {
    mkdirSync(join(dir, 'vide'))
    const missing = join(dir, 'vide', 'bessege.sqlite')

    expect(() => openReadOnlyDatabase(missing)).toThrow(/introuvable/)
    expect(existsSync(missing)).toBe(false)
  })
})
