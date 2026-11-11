import { execFileSync } from 'node:child_process'
import { mkdtempSync, rmSync, symlinkSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { Writable } from 'node:stream'
import semanticRelease, { type Options, type PluginSpec } from 'semantic-release'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import config from '../release.config.mjs'

// Joue la chaîne dev → preprod → main sur un dépôt git temporaire, avec un dépôt
// distant local : semantic-release crée de vrais tags, sans toucher à GitHub.
const root = new URL('..', import.meta.url).pathname
const dir = mkdtempSync(join(tmpdir(), 'bessege-release-'))
const remote = join(dir, 'remote.git')
const work = join(dir, 'work')

// Environnement minimal : sans les variables de GitHub Actions, semantic-release
// lirait la branche de la CI au lieu de celle du dépôt de test.
const env = {
  PATH: process.env.PATH,
  HOME: dir,
  GIT_AUTHOR_NAME: 'Test',
  GIT_AUTHOR_EMAIL: 'test@example.com',
  GIT_COMMITTER_NAME: 'Test',
  GIT_COMMITTER_EMAIL: 'test@example.com',
}

function git(...args: string[]): string {
  return execFileSync('git', args, { cwd: work, env, encoding: 'utf8' }).trim()
}

function commit(branch: string, message: string) {
  git('checkout', '--quiet', branch)
  writeFileSync(join(work, 'file.txt'), `${message}\n`, { flag: 'a' })
  git('add', 'file.txt')
  git('commit', '--quiet', '--message', message)
  git('push', '--quiet', 'origin', branch)
}

function merge(from: string, into: string) {
  git('checkout', '--quiet', into)
  git('merge', '--quiet', '--no-ff', '--no-edit', from)
  git('push', '--quiet', 'origin', into)
}

// Publie une version comme en CI, mais sans le plugin GitHub (pas de réseau).
async function release(branch: string): Promise<string | false> {
  git('checkout', '--quiet', branch)
  const plugins = (config.plugins as PluginSpec[]).filter(plugin => [plugin].flat()[0] !== '@semantic-release/github')
  const silent = new Writable({ write: (_chunk, _encoding, done) => done() })
  const result = await semanticRelease(
    { ...config, plugins, repositoryUrl: `file://${remote}`, ci: false } as Options,
    { cwd: work, env, stdout: silent as NodeJS.WriteStream, stderr: silent as NodeJS.WriteStream },
  )
  return result ? result.nextRelease.version : false
}

describe('versions calculées par semantic-release', () => {
  beforeAll(() => {
    execFileSync('git', ['init', '--quiet', '--bare', '--initial-branch', 'main', remote])
    execFileSync('git', ['clone', '--quiet', remote, work], { env })
    // Les plugins et le preset sont cherchés dans les node_modules du dossier courant.
    symlinkSync(join(root, 'node_modules'), join(work, 'node_modules'))
    writeFileSync(join(work, '.gitignore'), 'node_modules\n')
    git('add', '.gitignore')
    git('commit', '--quiet', '--message', 'chore: initialisation')
    // Tag de départ : la première version sera 0.1.0, et non 1.0.0.
    git('tag', 'v0.0.0')
    git('push', '--quiet', 'origin', 'main', 'v0.0.0')
    for (const branch of ['preprod', 'dev']) {
      git('branch', branch)
      git('push', '--quiet', 'origin', branch)
    }
  })

  afterAll(() => {
    rmSync(dir, { recursive: true, force: true })
  })

  it('DEP-11 : un feat poussé sur dev crée la version 0.1.0-dev.1', async () => {
    commit('dev', 'feat(site): accueil')

    expect(await release('dev')).toBe('0.1.0-dev.1')
    expect(git('tag', '--list', 'v0.1.0-dev.1')).toBe('v0.1.0-dev.1')
  })

  it('DEP-11 : un fix poussé ensuite sur dev crée 0.1.0-dev.2', async () => {
    commit('dev', 'fix(site): coquille')

    expect(await release('dev')).toBe('0.1.0-dev.2')
  })

  it('DEP-11 : des commits docs ou chore seuls ne créent pas de version', async () => {
    commit('dev', 'docs: précision')
    commit('dev', 'chore(deps): mise à jour')

    expect(await release('dev')).toBe(false)
  })

  it('DEP-11 : un merge de dev vers preprod crée 0.1.0-rc.1', async () => {
    merge('dev', 'preprod')

    expect(await release('preprod')).toBe('0.1.0-rc.1')
  })

  it('DEP-11 : un merge de preprod vers main crée la version stable 0.1.0', async () => {
    merge('preprod', 'main')

    expect(await release('main')).toBe('0.1.0')
  })

  it('DEP-11 : après la fusion de main dans dev, un feat crée 0.2.0-dev.1', async () => {
    merge('main', 'dev')
    commit('dev', 'feat(site): galerie')

    expect(await release('dev')).toBe('0.2.0-dev.1')
  })

  it('DEP-11 : la version suivante de préproduction part de la dernière version stable', async () => {
    merge('dev', 'preprod')

    expect(await release('preprod')).toBe('0.2.0-rc.1')
  })
})
