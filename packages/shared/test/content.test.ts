import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { readMigrationFiles } from 'drizzle-orm/migrator'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { blockKeys } from '../shared/content/blocks'
import { blocks } from '../server/database/schema'
import { readPublishedContent } from '../server/utils/content'
import { openWritableDatabase, prepareDatabase } from '../server/utils/database'

const migrations = readMigrationFiles({ migrationsFolder: fileURLToPath(new URL('../server/database/migrations', import.meta.url)) })

let dir: string
let path: string

beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), 'bessege-content-'))
  path = join(dir, 'bessege.sqlite')
  prepareDatabase(path, migrations)
})

afterEach(() => {
  vi.restoreAllMocks()
  rmSync(dir, { recursive: true, force: true })
})

function insertBlock(key: string, published: unknown, draft: unknown = null) {
  const db = openWritableDatabase(path)
  db.insert(blocks).values({ key, published, draft }).run()
  db.$client.close()
}

describe('readPublishedContent (site public)', () => {
  it('CNT-08 : renvoie la version publiée d’un bloc, jamais son brouillon', () => {
    insertBlock('home.contact', { visible: true, title: 'Écrivez-nous' }, { visible: true, title: 'Brouillon non publié' })

    const content = readPublishedContent(path)

    expect(content['home.contact']).toEqual({ visible: true, title: 'Écrivez-nous', text: '' })
  })

  it('CNT-08 : renvoie chaque bloc, indexé par sa clé', () => {
    expect(Object.keys(readPublishedContent(path)).sort()).toEqual([...blockKeys].sort())
  })

  it('CNT-30 : un contenu publié avant l’ajout d’un champ reçoit la valeur par défaut de ce champ', () => {
    insertBlock('footer', { association: 'Horizon Cévennes' })

    expect(readPublishedContent(path).footer).toEqual({ association: 'Horizon Cévennes', text: '' })
  })

  it('CNT-08 : un bloc absent de la base prend les valeurs par défaut, section masquée', () => {
    const content = readPublishedContent(path)

    expect(content['home.galerie']).toEqual({ visible: false, title: 'Galerie', photos: [] })
    expect(content['race.trail-40']).toMatchObject({ visible: false, name: 'Trail 40 km' })
  })

  it('CNT-30 : un bloc invalide en base prend les valeurs par défaut, et l’erreur est journalisée', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {})
    insertBlock('home.presentation', { visible: true, title: 42 })
    insertBlock('home.contact', { visible: true, title: 'Écrivez-nous' })

    const content = readPublishedContent(path)

    expect(content['home.presentation']).toMatchObject({ visible: false, title: 'Présentation' })
    expect(content['home.contact']).toMatchObject({ visible: true, title: 'Écrivez-nous' })
    expect(error).toHaveBeenCalledOnce()
    expect(error.mock.calls[0]?.[0]).toMatch(/Contenu publié invalide pour le bloc home\.presentation/)
  })

  it('CNT-27 : une base absente provoque une erreur claire, sans la créer', () => {
    expect(() => readPublishedContent(join(dir, 'absente.sqlite'))).toThrow(/Base de données introuvable/)
  })
})
