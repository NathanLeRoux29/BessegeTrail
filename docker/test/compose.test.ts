import { spawnSync } from 'node:child_process'
import { rmSync, statSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

// Environnement de développement (compose.yaml), lancé dans un projet Compose
// dédié et sur d'autres ports pour ne pas gêner un environnement déjà démarré.
const root = fileURLToPath(new URL('../..', import.meta.url))
const project = 'bessege-test'
const ports = { site: 13000, admin: 13001, umami: 13002 }
const env = { ...process.env, SITE_PORT: `${ports.site}`, ADMIN_PORT: `${ports.admin}`, UMAMI_PORT: `${ports.umami}` }

function compose(...args: string[]) {
  return spawnSync('docker', ['compose', '--project-name', project, ...args], { cwd: root, env, encoding: 'utf8' })
}

function composeOrThrow(...args: string[]): string {
  const result = compose(...args)
  if (result.status !== 0) throw new Error(`docker compose ${args.join(' ')} : ${result.stderr}`)
  return result.stdout.trim()
}

async function waitForJson(url: string, timeoutMs: number): Promise<unknown> {
  const deadline = Date.now() + timeoutMs
  while (Date.now() < deadline) {
    try {
      // Délai par requête : pendant une reconstruction, une requête peut rester bloquée.
      const response = await fetch(url, { signal: AbortSignal.timeout(5000) })
      if (response.ok && response.headers.get('content-type')?.includes('json')) return await response.json()
    }
    catch {
      // Serveur pas encore prêt
    }
    await new Promise(resolve => setTimeout(resolve, 1000))
  }
  throw new Error(`${url} ne répond pas en JSON après ${timeoutMs / 1000} s`)
}

function runningServices(): string[] {
  return composeOrThrow('--profile', 'stats', 'ps', '--services', '--status', 'running').split('\n').filter(Boolean)
}

describe('environnement de développement Docker Compose', () => {
  const tempFiles: string[] = []

  beforeAll(() => {
    composeOrThrow('up', '--detach')
  })

  afterAll(() => {
    for (const file of tempFiles) rmSync(file, { force: true })
    compose('--profile', 'stats', 'down', '--volumes', '--remove-orphans')
  })

  it('DEP-02 : `docker compose up` démarre le site et l’admin', async () => {
    expect(await waitForJson(`http://127.0.0.1:${ports.site}/api/health`, 180_000)).toEqual({ status: 'ok', service: 'site', version: 'dev' })
    expect(await waitForJson(`http://127.0.0.1:${ports.admin}/api/health`, 180_000)).toEqual({ status: 'ok', service: 'admin', version: 'dev' })
  }, 400_000)

  it('DEP-02 : sans le profil stats, Umami et PostgreSQL ne sont pas lancés', () => {
    const services = runningServices()

    expect(services).toEqual(expect.arrayContaining(['site', 'admin']))
    expect(services).not.toContain('umami')
    expect(services).not.toContain('umami-db')
  })

  it('DEP-02 : une modification du code est prise en compte sans redémarrage', async () => {
    const route = `${root}packages/shared/server/api/dev-reload-check.get.ts`
    tempFiles.push(route)
    writeFileSync(route, 'export default defineEventHandler(() => ({ reloaded: true }))\n')

    expect(await waitForJson(`http://127.0.0.1:${ports.site}/api/dev-reload-check`, 60_000)).toEqual({ reloaded: true })
  }, 90_000)

  it('l’admin peut écrire dans les volumes de la base et des fichiers envoyés', () => {
    expect(compose('exec', '-T', 'admin', 'sh', '-c', 'touch /data/write-check && touch /uploads/write-check').status).toBe(0)
  })

  it('CNT-26 : l’admin crée la base dans le volume data, que le site voit', () => {
    expect(compose('exec', '-T', 'admin', 'test', '-s', '/data/bessege.sqlite').status).toBe(0)
    expect(compose('exec', '-T', 'site', 'test', '-s', '/data/bessege.sqlite').status).toBe(0)
  })

  it('le site ne peut pas écrire dans la base ni dans les fichiers envoyés', () => {
    // Vérifie la cause du refus : un conteneur arrêté ferait aussi échouer la commande.
    for (const dir of ['/data', '/uploads']) {
      const result = compose('exec', '-T', 'site', 'touch', `${dir}/write-check`)
      expect(result.status).not.toBe(0)
      expect(result.stderr).toContain('Read-only file system')
    }
  })

  it('les fichiers créés par les conteneurs appartiennent à l’utilisateur de la machine', () => {
    const file = `${root}apps/site/.nuxt/owner-check`
    tempFiles.push(file)
    composeOrThrow('exec', '-T', 'site', 'touch', '/repo/apps/site/.nuxt/owner-check')

    expect(statSync(file).uid).toBe(process.getuid?.())
  })

  it('DEP-02 : avec le profil stats, Umami démarre', async () => {
    composeOrThrow('--profile', 'stats', 'up', '--detach')
    const deadline = Date.now() + 240_000
    let ok = false
    while (!ok && Date.now() < deadline) {
      ok = await fetch(`http://127.0.0.1:${ports.umami}/api/heartbeat`).then(r => r.ok, () => false)
      if (!ok) await new Promise(resolve => setTimeout(resolve, 2000))
    }

    expect(ok).toBe(true)
    expect(runningServices()).toEqual(expect.arrayContaining(['umami', 'umami-db']))
  }, 400_000)
})
