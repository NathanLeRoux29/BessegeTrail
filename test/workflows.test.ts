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

  it('DEP-06 : s’exécute à chaque PR vers preprod ou main', () => {
    expect(load<Workflow>(workflowFile).on.pull_request?.branches).toEqual(['preprod', 'main'])
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
