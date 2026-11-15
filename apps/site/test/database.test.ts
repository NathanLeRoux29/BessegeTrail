import { existsSync, mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { afterAll, describe, expect, it } from 'vitest'
import { $fetch, setup, url } from '@nuxt/test-utils/e2e'

const dir = mkdtempSync(join(tmpdir(), 'bessege-site-'))
const path = join(dir, 'data', 'bessege.sqlite')

describe('base de données (site)', async () => {
  await setup({ rootDir: fileURLToPath(new URL('..', import.meta.url)), env: { NUXT_DATABASE_PATH: path } })

  afterAll(() => rmSync(dir, { recursive: true, force: true }))

  it('CNT-26 : le site démarre sans créer ni migrer la base (seul l’admin le fait)', async () => {
    expect(await $fetch('/api/health')).toMatchObject({ status: 'ok', service: 'site' })
    expect(existsSync(join(dir, 'data'))).toBe(false)
  })

  it('CNT-16 : le site sert les fichiers du contenu de démo', async () => {
    const response = await fetch(url('/demo/images/banniere-960.webp'))

    expect(response.status).toBe(200)
    expect(response.headers.get('content-type')).toBe('image/webp')
  })
})
