import { execFileSync } from 'node:child_process'

// Démarre le site et l'admin, attend qu'ils soient en bonne santé (healthcheck
// des images), et les arrête à la fin des tests.
const compose = ['compose', '--file', 'docker/compose.e2e.yaml']

export default function globalSetup() {
  execFileSync('docker', [...compose, 'up', '--wait', '--wait-timeout', '120'], { stdio: 'inherit' })

  return () => {
    execFileSync('docker', [...compose, 'down', '--volumes'], { stdio: 'inherit' })
  }
}
