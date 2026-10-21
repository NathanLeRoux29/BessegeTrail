import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

const root = fileURLToPath(new URL('../..', import.meta.url))

function docker(...args: string[]): string {
  return execFileSync('docker', args, { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim()
}

async function waitForHealth(container: string, expected: string, timeoutMs: number): Promise<string> {
  const deadline = Date.now() + timeoutMs
  let status = ''
  while (Date.now() < deadline) {
    status = docker('inspect', '--format', '{{.State.Health.Status}}', container)
    if (status === expected) return status
    await new Promise(resolve => setTimeout(resolve, 1000))
  }
  return status
}

describe.each(['site', 'admin'])('image Docker %s', (app) => {
  const image = `bessege-test/${app}:test`
  const containers: string[] = []

  beforeAll(() => {
    docker('build', '--file', 'docker/app.Dockerfile', '--build-arg', `APP=${app}`, '--tag', image, '.')
  })

  afterAll(() => {
    for (const container of containers) docker('rm', '--force', container)
    docker('rmi', '--force', image)
  })

  it('DEP-01 : part de Node 24 sur Alpine', () => {
    const output = docker('run', '--rm', '--entrypoint', 'sh', image, '-c', 'node --version && cat /etc/alpine-release')
    const [nodeVersion, alpineRelease] = output.split('\n')

    expect(nodeVersion).toMatch(/^v24\./)
    expect(alpineRelease).toMatch(/^\d+\.\d+/)
  })

  it('DEP-01 : ne contient que l’app compilée, sans code source ni pnpm', () => {
    const files = docker('run', '--rm', '--entrypoint', 'ls', image, '-A', '/app')
    const pnpm = docker('run', '--rm', '--entrypoint', 'sh', image, '-c', 'command -v pnpm || echo absent')

    expect(files).toBe('.output')
    expect(pnpm).toBe('absent')
  })

  it('AUT-19 : s’exécute avec l’utilisateur node, sans les droits root', () => {
    expect(docker('inspect', '--format', '{{.Config.User}}', image)).toBe('node')
    expect(docker('run', '--rm', '--entrypoint', 'id', image, '-u')).not.toBe('0')
  })

  it('DEP-01 : devient healthy et /api/health répond avec le nom du service', async () => {
    expect(docker('inspect', '--format', '{{json .Config.Healthcheck.Test}}', image)).toContain('/api/health')

    const container = docker('run', '--detach', '--publish', '127.0.0.1::3000', image)
    containers.push(container)

    expect(await waitForHealth(container, 'healthy', 60_000)).toBe('healthy')
    const port = docker('port', container, '3000').split(':').at(-1)
    const response = await fetch(`http://127.0.0.1:${port}/api/health`)
    expect(await response.json()).toEqual({ status: 'ok', service: app })
  })

  it('DEP-01 : passe à unhealthy quand le serveur ne répond pas', async () => {
    const container = docker('run', '--detach', '--entrypoint', 'sleep',
      '--health-interval=1s', '--health-timeout=1s', '--health-retries=2', '--health-start-period=0s',
      image, '600')
    containers.push(container)

    expect(await waitForHealth(container, 'unhealthy', 30_000)).toBe('unhealthy')
  })
})
