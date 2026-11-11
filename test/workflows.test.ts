import { readFileSync } from 'node:fs'
import { parse } from 'yaml'
import { describe, expect, it } from 'vitest'

interface Step { uses?: string, run?: string, with?: Record<string, unknown>, env?: Record<string, string> }
interface Job {
  'needs'?: string | string[]
  'if'?: string
  'steps'?: Step[]
  'runs-on'?: string
  'permissions'?: Record<string, string>
  'outputs'?: Record<string, string>
}
interface Workflow {
  name: string
  on: {
    push?: { branches?: string[] }
    pull_request?: { branches?: string[] }
  }
  concurrency?: { 'group': string, 'cancel-in-progress': boolean }
  jobs: Record<string, Job>
}

const workflowFile = new URL('../.github/workflows/ci.yml', import.meta.url)
const releaseFile = new URL('../.github/workflows/release.yml', import.meta.url)
const dependabotFile = new URL('../.github/dependabot.yml', import.meta.url)
const dockerfile = new URL('../docker/app.Dockerfile', import.meta.url)

interface Update {
  'package-ecosystem': string
  'directory'?: string
  'directories'?: string[]
  'target-branch': string
  'schedule': { interval: string }
  'groups'?: Record<string, { 'update-types'?: string[] }>
  'ignore'?: { 'dependency-name': string, 'update-types'?: string[] }[]
  'commit-message'?: { 'prefix'?: string, 'prefix-development'?: string, 'include'?: string }
}

function updates(): Update[] {
  return load<{ updates: Update[] }>(dependabotFile).updates
}

function update(ecosystem: string): Update | undefined {
  return updates().find(entry => entry['package-ecosystem'] === ecosystem)
}

function ignoresMajor(entry: Update | undefined, dependency: string): boolean {
  return !!entry?.ignore?.some(rule => rule['dependency-name'] === dependency && rule['update-types']?.includes('version-update:semver-major'))
}
const setupAction = new URL('../.github/actions/setup/action.yml', import.meta.url)

function load<T>(file: URL): T {
  return parse(readFileSync(file, 'utf8')) as T
}

describe('workflow de CI', () => {
  it('DEP-06 : s’appelle « ci »', () => {
    expect(load<Workflow>(workflowFile).name).toBe('ci')
  })

  it('DEP-06 : s’exécute à chaque push sur dev, et seulement sur dev', () => {
    expect(load<Workflow>(workflowFile).on.push?.branches).toEqual(['dev'])
  })

  it('DEP-06 : s’exécute à chaque PR vers dev (Dependabot), preprod ou main', () => {
    expect(load<Workflow>(workflowFile).on.pull_request?.branches).toEqual(['dev', 'preprod', 'main'])
  })

  it('DEP-07 : a exactement les checks lint, typecheck, test, build et e2e', () => {
    expect(Object.keys(load<Workflow>(workflowFile).jobs).sort()).toEqual(['build', 'e2e', 'lint', 'test', 'typecheck'])
  })

  it('DEP-06 : les tests de bout en bout tournent sur les images construites par build', () => {
    expect([load<Workflow>(workflowFile).jobs.e2e?.needs].flat()).toContain('build')
  })

  it('DEP-06 : l’installation utilise le cache pnpm', () => {
    const steps = load<{ runs: { steps: Step[] } }>(setupAction).runs.steps
    const setupNode = steps.find(step => step.uses?.startsWith('actions/setup-node@'))

    expect(setupNode?.with?.cache).toBe('pnpm')
    expect(steps.some(step => step.run?.includes('pnpm install --frozen-lockfile'))).toBe(true)
  })

  it('DEP-10 : le job lint vérifie les messages des commits poussés, avec tout l’historique', () => {
    const steps = load<Workflow>(workflowFile).jobs.lint?.steps ?? []
    const checkout = steps.find(step => step.uses?.startsWith('actions/checkout@'))

    expect(checkout?.with?.['fetch-depth']).toBe(0)
    expect(steps.some(step => step.run?.includes('commitlint --from'))).toBe(true)
  })
})

describe('workflow de release', () => {
  it('DEP-11 : s’exécute à chaque push sur dev, preprod et main, jamais sur une PR', () => {
    const { on } = load<Workflow>(releaseFile)

    expect(on.push?.branches).toEqual(['dev', 'preprod', 'main'])
    expect(on.pull_request).toBeUndefined()
  })

  it('DEP-11 : deux releases ne tournent jamais en même temps, et aucune n’est annulée', () => {
    expect(load<Workflow>(releaseFile).concurrency).toEqual({ 'group': 'release', 'cancel-in-progress': false })
  })

  it('DEP-11 : lance semantic-release avec le jeton fourni par GitHub, qui peut créer tags et releases', () => {
    const job = load<Workflow>(releaseFile).jobs.release
    const step = job?.steps?.find(step => step.run?.includes('semantic-release'))

    expect(job?.permissions?.contents).toBe('write')
    expect(step?.env?.GITHUB_TOKEN).toBe('${{ secrets.GITHUB_TOKEN }}')
    expect(job?.outputs?.version).toBeDefined()
  })

  it('DEP-13 : publie les images sur GHCR, avec la version comme tag, seulement si une version est créée', () => {
    const job = load<Workflow>(releaseFile).jobs.images
    const build = job?.steps?.find(step => step.uses?.startsWith('docker/build-push-action@'))

    expect([job?.needs].flat()).toContain('release')
    expect(job?.if).toContain('needs.release.outputs.version')
    expect(job?.permissions?.packages).toBe('write')
    expect(build?.with?.push).toBe(true)
    expect(build?.with?.tags).toBe('ghcr.io/nathanleroux29/bessege-${{ matrix.app }}:${{ needs.release.outputs.version }}')
    expect(build?.with?.['build-args']).toContain('VERSION=${{ needs.release.outputs.version }}')
  })
})

describe('Dependabot', () => {
  it('DEP-21 : surveille npm, Docker, Docker Compose et GitHub Actions', () => {
    expect(updates().map(entry => entry['package-ecosystem']).sort()).toEqual(['docker', 'docker-compose', 'github-actions', 'npm'])
  })

  it('DEP-21 : vérifie chaque semaine et ouvre ses PR vers dev', () => {
    for (const entry of updates()) {
      expect(entry.schedule.interval).toBe('weekly')
      expect(entry['target-branch']).toBe('dev')
    }
  })

  it('DEP-21 : regroupe les mises à jour mineures et correctives dans une seule PR', () => {
    for (const entry of updates()) {
      const groups = Object.values(entry.groups ?? {})
      expect(groups.some(group => group['update-types']?.sort().join() === 'minor,patch')).toBe(true)
    }
  })

  it('DEP-21 : surveille aussi l’action d’installation locale', () => {
    expect(update('github-actions')?.directories).toEqual(expect.arrayContaining(['/', '/.github/actions/setup']))
  })

  it('DEP-21 : ne propose pas de changer de version majeure de Node, PostgreSQL ni TypeScript', () => {
    expect(ignoresMajor(update('docker'), 'node')).toBe(true)
    expect(ignoresMajor(update('docker-compose'), 'node')).toBe(true)
    expect(ignoresMajor(update('docker-compose'), 'postgres')).toBe(true)
    expect(ignoresMajor(update('npm'), 'typescript')).toBe(true)
  })

  it('DEP-10 : écrit des messages de commit chore(deps) acceptés par commitlint', () => {
    for (const entry of updates()) {
      expect(entry['commit-message']).toMatchObject({ prefix: 'chore', include: 'scope' })
    }
    expect(update('npm')?.['commit-message']?.['prefix-development']).toBe('chore')
  })

  it('DEP-21 : les images de base du Dockerfile sont écrites en clair, lisibles par Dependabot', () => {
    const froms = readFileSync(dockerfile, 'utf8').split('\n').filter(line => line.startsWith('FROM '))

    expect(froms.length).toBeGreaterThan(0)
    for (const from of froms) expect(from).toMatch(/^FROM node:24-alpine /)
  })
})

describe('actions GitHub', () => {
  it('DEP-24 : les actions tierces sont épinglées par SHA de commit', () => {
    const steps = [
      ...[workflowFile, releaseFile].flatMap(file => Object.values(load<Workflow>(file).jobs).flatMap(job => job.steps ?? [])),
      ...load<{ runs: { steps: Step[] } }>(setupAction).runs.steps,
    ]
    const external = steps.map(step => step.uses).filter((uses): uses is string => !!uses && !uses.startsWith('./'))

    expect(external.length).toBeGreaterThan(0)
    for (const uses of external) expect(uses).toMatch(/@[0-9a-f]{40}$/)
  })
})
