import { readFileSync } from 'node:fs'
import { parse } from 'yaml'
import { describe, expect, it } from 'vitest'

interface Step { uses?: string, run?: string, with?: Record<string, unknown> }
interface Job { 'needs'?: string | string[], 'steps'?: Step[], 'runs-on'?: string }
interface Workflow {
  name: string
  on: {
    push?: { branches?: string[] }
    pull_request?: { branches?: string[] }
  }
  jobs: Record<string, Job>
}

const workflowFile = new URL('../.github/workflows/ci.yml', import.meta.url)
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

  it('DEP-24 : les actions tierces sont épinglées par SHA de commit', () => {
    const steps = [
      ...Object.values(load<Workflow>(workflowFile).jobs).flatMap(job => job.steps ?? []),
      ...load<{ runs: { steps: Step[] } }>(setupAction).runs.steps,
    ]
    const external = steps.map(step => step.uses).filter((uses): uses is string => !!uses && !uses.startsWith('./'))

    expect(external.length).toBeGreaterThan(0)
    for (const uses of external) expect(uses).toMatch(/@[0-9a-f]{40}$/)
  })
})
