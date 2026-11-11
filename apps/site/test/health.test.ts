import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { setup, url } from '@nuxt/test-utils/e2e'

describe('GET /api/health (site)', async () => {
  await setup({ rootDir: fileURLToPath(new URL('..', import.meta.url)) })

  it('répond 200 avec le statut, le nom du service et la version « dev » hors image publiée', async () => {
    const response = await fetch(url('/api/health'))

    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ status: 'ok', service: 'site', version: 'dev' })
  })
})
