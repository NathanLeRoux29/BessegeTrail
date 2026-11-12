import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { afterAll, describe, expect, it } from 'vitest'
import { setup, url } from '@nuxt/test-utils/e2e'

// L'admin crée la base au démarrage : base temporaire, pas celle du développeur.
const dir = mkdtempSync(join(tmpdir(), 'bessege-admin-'))

describe('GET /api/health (admin)', async () => {
  await setup({ rootDir: fileURLToPath(new URL('..', import.meta.url)), env: { NUXT_DATABASE_PATH: join(dir, 'bessege.sqlite') } })

  afterAll(() => rmSync(dir, { recursive: true, force: true }))

  it('répond 200 avec le statut, le nom du service et la version « dev » hors image publiée', async () => {
    const response = await fetch(url('/api/health'))

    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ status: 'ok', service: 'admin', version: 'dev' })
  })
})
