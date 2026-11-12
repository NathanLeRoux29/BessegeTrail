import { spawnSync } from 'node:child_process'
import { cpSync, mkdtempSync, readdirSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { afterEach, describe, expect, it } from 'vitest'

const root = fileURLToPath(new URL('..', import.meta.url))
const migrationsFolder = join(root, 'server/database/migrations')

function listFiles(dir: string): string[] {
  return readdirSync(dir, { recursive: true, encoding: 'utf8' }).sort()
}

describe('migrations Drizzle versionnées', () => {
  let copy: string

  afterEach(() => rmSync(copy, { recursive: true, force: true }))

  it('CNT-26 : correspondent au schéma (sinon lancer `pnpm db:generate`)', () => {
    copy = mkdtempSync(join(tmpdir(), 'bessege-migrations-'))
    cpSync(migrationsFolder, copy, { recursive: true })

    const result = spawnSync(join(root, 'node_modules/.bin/drizzle-kit'), [
      'generate', '--dialect', 'sqlite', '--schema', 'server/database/schema.ts', '--out', copy,
    ], { cwd: root, encoding: 'utf8' })

    expect(result.status, result.stderr).toBe(0)
    expect(listFiles(copy)).toEqual(listFiles(migrationsFolder))
  }, 60_000)
})
