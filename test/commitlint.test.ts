import lint from '@commitlint/lint'
import load from '@commitlint/load'
import { describe, expect, it } from 'vitest'

const root = new URL('..', import.meta.url).pathname

async function check(message: string) {
  const config = await load({}, { cwd: root })
  return lint(message, config.rules, { parserOpts: config.parserPreset?.parserOpts as never, defaultIgnores: config.defaultIgnores })
}

describe('messages de commit', () => {
  it('DEP-10 : un message Conventional Commits avec une portée connue est accepté', async () => {
    expect((await check('feat(site): galerie avec visionneuse')).valid).toBe(true)
  })

  it('DEP-10 : les commits de Dependabot sont acceptés, même avec des lignes longues', async () => {
    const message = `chore(deps): bump the npm_and_yarn group across 1 directory with 3 updates\n\nBumps ${'x'.repeat(200)}`
    expect((await check(message)).valid).toBe(true)
  })

  it('DEP-10 : un message sans type est refusé', async () => {
    expect((await check('ajout truc')).valid).toBe(false)
  })

  it('DEP-10 : une portée inconnue est refusée', async () => {
    expect((await check('feat(inconnu): quelque chose')).valid).toBe(false)
  })

  it('DEP-10 : un titre de plus de 100 caractères est refusé', async () => {
    expect((await check(`fix(site): ${'a'.repeat(100)}`)).valid).toBe(false)
  })

  it('DEP-12 : les merge commits des PR et des fusions de main sont ignorés', async () => {
    expect((await check('Merge pull request #12 from NathanLeRoux29/dev')).valid).toBe(true)
    expect((await check('Merge remote-tracking branch \'origin/main\' into dev')).valid).toBe(true)
  })
})
