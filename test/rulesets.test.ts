import { existsSync, readFileSync } from 'node:fs'
import { parse } from 'yaml'
import { describe, expect, it } from 'vitest'

// Rulesets au format de l'API GitHub (POST /repos/{owner}/{repo}/rulesets),
// appliqués avec `gh api` (voir le README).
interface Rule { type: string, parameters?: Record<string, unknown> }
interface Ruleset {
  name: string
  target: string
  enforcement: string
  bypass_actors: unknown[]
  conditions: { ref_name: { include: string[], exclude: string[] } }
  rules: Rule[]
}

// Identifiant de l'application GitHub Actions : seuls ses checks comptent.
const GITHUB_ACTIONS = 15368

function file(name: string): URL {
  return new URL(`../.github/rulesets/${name}.json`, import.meta.url)
}

function ruleset(name: string): Ruleset {
  const path = file(name)
  if (!existsSync(path)) throw new Error(`ruleset absent : .github/rulesets/${name}.json`)
  return JSON.parse(readFileSync(path, 'utf8')) as Ruleset
}

function rule(set: Ruleset, type: string): Rule | undefined {
  return set.rules.find(entry => entry.type === type)
}

function workflowJobs(name: string): string[] {
  const workflow = parse(readFileSync(new URL(`../.github/workflows/${name}.yml`, import.meta.url), 'utf8')) as { jobs: Record<string, unknown> }
  return Object.keys(workflow.jobs)
}

describe('ruleset de preprod et main', () => {
  it('DEP-18 : s’applique à preprod et main, sans exception', () => {
    const set = ruleset('preprod-main')

    expect(set.target).toBe('branch')
    expect(set.enforcement).toBe('active')
    expect(set.conditions.ref_name.include.sort()).toEqual(['refs/heads/main', 'refs/heads/preprod'])
    expect(set.bypass_actors).toEqual([])
  })

  it('DEP-18 : exige une PR, sans approbation obligatoire, fusionnée en merge commit', () => {
    const parameters = rule(ruleset('preprod-main'), 'pull_request')?.parameters

    expect(parameters?.required_approving_review_count).toBe(0)
    expect(parameters?.allowed_merge_methods).toEqual(['merge'])
  })

  it('DEP-18 / DEP-19 : exige les checks de la CI et la provenance, publiés par GitHub Actions', () => {
    const checks = rule(ruleset('preprod-main'), 'required_status_checks')?.parameters?.required_status_checks as { context: string, integration_id?: number }[] | undefined
    const expected = [...workflowJobs('ci'), ...workflowJobs('provenance')].sort()

    expect(checks?.map(check => check.context).sort()).toEqual(expected)
    for (const check of checks ?? []) expect(check.integration_id).toBe(GITHUB_ACTIONS)
  })

  it('DEP-18 : n’exige pas que la branche soit à jour avec la cible', () => {
    const parameters = rule(ruleset('preprod-main'), 'required_status_checks')?.parameters

    expect(parameters?.strict_required_status_checks_policy).toBe(false)
  })

  it('DEP-18 : interdit le force-push et la suppression', () => {
    const set = ruleset('preprod-main')

    expect(rule(set, 'non_fast_forward')).toBeDefined()
    expect(rule(set, 'deletion')).toBeDefined()
  })
})

describe('ruleset de dev', () => {
  it('DEP-20 : s’applique à dev seule, sans exception', () => {
    const set = ruleset('dev')

    expect(set.target).toBe('branch')
    expect(set.enforcement).toBe('active')
    expect(set.conditions.ref_name.include).toEqual(['refs/heads/dev'])
    expect(set.bypass_actors).toEqual([])
  })

  it('DEP-20 : interdit le force-push et la suppression, mais pas le push direct', () => {
    expect(ruleset('dev').rules.map(entry => entry.type).sort()).toEqual(['deletion', 'non_fast_forward'])
  })
})
