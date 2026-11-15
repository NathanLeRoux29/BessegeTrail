import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { DatabaseSync } from 'node:sqlite'
import { fileURLToPath } from 'node:url'
import { readMigrationFiles } from 'drizzle-orm/migrator'
import { afterAll, describe, expect, it } from 'vitest'
import { $fetch, setup } from '@nuxt/test-utils/e2e'
import type { PublishedContent } from '../../../packages/shared/shared/content/blocks'
import { prepareDatabase } from '../../../packages/shared/server/utils/database'

// Base créée comme le fait l'admin, avec un bloc publié qui a aussi un brouillon.
const dir = mkdtempSync(join(tmpdir(), 'bessege-site-'))
const path = join(dir, 'bessege.sqlite')
const migrationsFolder = fileURLToPath(new URL('../../../packages/shared/server/database/migrations', import.meta.url))
prepareDatabase(path, readMigrationFiles({ migrationsFolder }))

function write(sql: string, ...params: string[]) {
  const db = new DatabaseSync(path)
  db.prepare(sql).run(...params)
  db.close()
}

write('INSERT INTO blocks (key, published, draft) VALUES (?, ?, ?)', 'home.contact',
  JSON.stringify({ visible: true, title: 'Écrivez-nous' }),
  JSON.stringify({ visible: true, title: 'Brouillon non publié' }))

describe('site avec une base', async () => {
  await setup({ rootDir: fileURLToPath(new URL('..', import.meta.url)), env: { NUXT_DATABASE_PATH: path } })

  afterAll(() => rmSync(dir, { recursive: true, force: true }))

  it('CNT-08 : le site renvoie la version publiée, pas le brouillon', async () => {
    const content = await $fetch<PublishedContent>('/api/content')

    expect(content['home.contact'].title).toBe('Écrivez-nous')
  })

  it('CNT-11 : une publication est servie par le site en moins de 10 secondes', async () => {
    const publishedAt = Date.now()
    write('UPDATE blocks SET published = ?, draft = NULL WHERE key = ?', JSON.stringify({ visible: true, title: 'Nouveau titre' }), 'home.contact')

    let title = ''
    while (title !== 'Nouveau titre' && Date.now() - publishedAt < 10_000) {
      title = (await $fetch<PublishedContent>('/api/content'))['home.contact'].title
    }

    expect(title).toBe('Nouveau titre')
    expect(Date.now() - publishedAt).toBeLessThan(10_000)
  })

  it('SOC-25 : le document a lang="fr"', async () => {
    const html = await $fetch<string>('/')

    expect(html).toMatch(/<html[^>]* lang="fr"/)
  })
})
