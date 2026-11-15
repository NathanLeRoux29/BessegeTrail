import { readdirSync, readFileSync } from 'node:fs'
import { join, relative } from 'node:path'
import { describe, expect, it } from 'vitest'

const root = new URL('..', import.meta.url).pathname
const ignored = new Set(['node_modules', '.nuxt', '.output', 'coverage', 'test'])

function vueFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name)
    if (entry.isDirectory()) return ignored.has(entry.name) ? [] : vueFiles(path)
    return entry.name.endsWith('.vue') ? [path] : []
  })
}

describe('affichage du texte mis en forme', () => {
  it('CNT-06 : seul RichText utilise v-html (il assainit au rendu)', () => {
    const files = ['apps/site', 'apps/admin', 'packages/shared'].flatMap(dir => vueFiles(join(root, dir)))
    const withVHtml = files.filter(file => /\bv-html\b/.test(readFileSync(file, 'utf8'))).map(file => relative(root, file))

    expect(withVHtml).toEqual(['packages/shared/app/components/RichText.vue'])
  })
})
