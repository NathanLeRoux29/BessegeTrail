import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { DatabaseSync } from 'node:sqlite'
import { fileURLToPath } from 'node:url'
import { afterAll, describe, expect, it } from 'vitest'
import { setup } from '@nuxt/test-utils/e2e'
import { blockKeys } from '../../../packages/shared/shared/content/blocks'

// Base vide, dans un dossier qui n'existe pas encore.
const dir = mkdtempSync(join(tmpdir(), 'bessege-admin-'))
const path = join(dir, 'data', 'bessege.sqlite')

describe('base de données (admin)', async () => {
  await setup({ rootDir: fileURLToPath(new URL('..', import.meta.url)), env: { NUXT_DATABASE_PATH: path } })

  afterAll(() => rmSync(dir, { recursive: true, force: true }))

  it('CNT-26 : l’admin démarré sur une base vide crée les tables', () => {
    const db = new DatabaseSync(path, { readOnly: true })
    const tables = db.prepare(`SELECT name FROM sqlite_master WHERE type = 'table' AND name IN ('blocks', 'users', 'page_versions') ORDER BY name`).all()
    db.close()

    expect(tables.map(table => table.name)).toEqual(['blocks', 'page_versions', 'users'])
  })

  it('CNT-16 : l’admin démarré sur une base vide publie le contenu de démo de chaque bloc', () => {
    const db = new DatabaseSync(path, { readOnly: true })
    const rows = db.prepare('SELECT key, published, draft FROM blocks ORDER BY key').all()
    db.close()

    expect(rows.map(row => row.key)).toEqual([...blockKeys].sort())
    expect(rows.every(row => row.draft === null)).toBe(true)
    expect(JSON.parse(rows.find(row => row.key === 'settings')!.published as string)).toMatchObject({ eventName: 'Trail de Bessèges' })
  })
})
