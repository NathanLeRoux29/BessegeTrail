import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { readMigrationFiles } from 'drizzle-orm/migrator'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { blockKeys } from '../shared/content/blocks'
import { demoContent } from '../shared/content/demo'
import { blocks } from '../server/database/schema'
import { openReadOnlyDatabase, openWritableDatabase, prepareDatabase } from '../server/utils/database'
import { loadDemoContent } from '../server/utils/demo'

const migrations = readMigrationFiles({ migrationsFolder: fileURLToPath(new URL('../server/database/migrations', import.meta.url)) })

let dir: string
let path: string

beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), 'bessege-demo-'))
  path = join(dir, 'bessege.sqlite')
  prepareDatabase(path, migrations)
})

afterEach(() => rmSync(dir, { recursive: true, force: true }))

function storedBlocks() {
  const db = openReadOnlyDatabase(path)
  const rows = db.select().from(blocks).all()
  db.$client.close()
  return new Map(rows.map(row => [row.key, row]))
}

function insertBlock(key: string, published: unknown) {
  const db = openWritableDatabase(path)
  db.insert(blocks).values({ key, published, revision: 3 }).run()
  db.$client.close()
}

describe('loadDemoContent (démarrage de l’admin)', () => {
  it('CNT-16 : sur une base vide, chaque bloc reçoit son contenu de démo publié, sans brouillon', () => {
    const loaded = loadDemoContent(path, demoContent)

    const stored = storedBlocks()
    expect(loaded).toEqual(blockKeys)
    expect([...stored.keys()].sort()).toEqual([...blockKeys].sort())
    for (const row of stored.values()) {
      expect(row).toMatchObject({ draft: null, publishedBy: null, revision: 0 })
      expect(row.publishedAt).toBeInstanceOf(Date)
    }
    expect(stored.get('home.galerie')?.published).toMatchObject({ visible: true, title: 'Galerie' })
  })

  it('CNT-16 : le contenu enregistré est celui validé par le schéma (valeurs par défaut comprises)', () => {
    loadDemoContent(path, { ...demoContent, footer: { association: 'Horizon Cévennes' } })

    expect(storedBlocks().get('footer')?.published).toEqual({ association: 'Horizon Cévennes', text: '' })
  })

  it('CNT-18 : un bloc déjà en base n’est jamais écrasé', () => {
    insertBlock('home.presentation', { visible: true, title: 'Titre modifié' })

    loadDemoContent(path, demoContent)

    expect(storedBlocks().get('home.presentation')).toMatchObject({ published: { visible: true, title: 'Titre modifié' }, revision: 3 })
  })

  it('CNT-18 : un second démarrage ne charge plus rien', () => {
    loadDemoContent(path, demoContent)

    expect(loadDemoContent(path, demoContent)).toEqual([])
  })

  it('CNT-30 : sur une base qui a du contenu, une section absente arrive avec sa démo, masquée', () => {
    insertBlock('settings', { eventName: 'Trail de Bessèges' })

    const loaded = loadDemoContent(path, demoContent)

    const stored = storedBlocks()
    expect(loaded).toHaveLength(blockKeys.length - 1)
    expect(stored.get('home.galerie')?.published).toMatchObject({ visible: false, title: 'Galerie' })
    // Section non masquable : publiée telle quelle.
    expect(stored.get('home.epreuves')?.published).toMatchObject({ title: 'Les épreuves' })
  })

  it('CNT-17 : une démo invalide est refusée et aucun bloc n’est écrit', () => {
    const invalid = { ...demoContent, 'home.contact': { visible: true, title: '' } }

    expect(() => loadDemoContent(path, invalid)).toThrow(/Contenu de démo invalide pour le bloc home\.contact/)
    expect(storedBlocks().size).toBe(0)
  })
})
