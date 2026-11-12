import { readdirSync, readFileSync } from 'node:fs'
import { join, relative } from 'node:path'
import { describe, expect, it } from 'vitest'

const root = new URL('..', import.meta.url).pathname
const tokensFile = 'packages/shared/app/assets/css/tokens.css'

// Couleurs de la spec 04 : définies une seule fois, dans le fichier de jetons.
const palette = {
  '--color-primary': '#F5700F',
  '--color-secondary': '#052D1F',
  '--color-background': '#FAF7F0',
  '--color-neutral': '#E9E2D3',
  '--color-text': '#1F2421',
}

// Couleur écrite en dur : hexadécimal, ou fonction rgb(), rgba(), hsl(), hsla().
const hardCodedColor = /#[0-9a-f]{3,8}\b|\b(?:rgba?|hsla?)\(/i

// Parties d'un fichier qui portent du style : le fichier entier pour un .css,
// les blocs <style> et les attributs style d'un .vue.
function styles(path: string, source: string): string[] {
  if (path.endsWith('.css')) return [source]
  return [
    ...source.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g),
    ...source.matchAll(/\sstyle="([^"]*)"/g),
  ].map(match => match[1] ?? '')
}

function findHardCodedColors(path: string, source: string): string[] {
  return styles(path, source).flatMap(style => style.match(new RegExp(hardCodedColor, 'gi')) ?? [])
}

const ignored = new Set(['node_modules', '.nuxt', '.output', 'coverage', 'test'])

function sourceFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name)
    if (entry.isDirectory()) return ignored.has(entry.name) ? [] : sourceFiles(path)
    return /\.(css|vue)$/.test(entry.name) ? [relative(root, path)] : []
  })
}

describe('jetons de couleur', () => {
  it('THM-01 : les 5 jetons sont définis une seule fois, avec les valeurs de la spec', () => {
    const tokens = readFileSync(join(root, tokensFile), 'utf8')

    for (const [name, value] of Object.entries(palette)) {
      const definitions = [...tokens.matchAll(new RegExp(`${name}\\s*:\\s*([^;]+);`, 'g'))]
      expect(definitions.map(match => match[1]?.trim().toUpperCase()), name).toEqual([value])
    }
  })

  it('THM-01 : le détecteur repère une couleur hexadécimale, rgba() ou hsl() dans un style', () => {
    expect(findHardCodedColors('a.css', '.a { color: #F5700F; }')).toEqual(['#F5700F'])
    expect(findHardCodedColors('a.vue', '<style scoped>.a { box-shadow: 0 0 4px rgba(0, 0, 0, .3); }</style>')).toEqual(['rgba('])
    expect(findHardCodedColors('a.vue', '<template><p style="color: hsl(20 90% 50%)">x</p></template>')).toEqual(['hsl('])
    expect(findHardCodedColors('a.vue', '<template><p>Issue #123</p></template>')).toEqual([])
  })

  it('THM-01 : aucune couleur en dur dans les styles hors du fichier de jetons', () => {
    const files = ['apps/site', 'apps/admin', 'packages/shared'].flatMap(dir => sourceFiles(join(root, dir)))
    const offenders = files
      .filter(file => file !== tokensFile)
      .flatMap(file => findHardCodedColors(file, readFileSync(join(root, file), 'utf8')).map(color => `${file} : ${color}`))

    expect(files).toContain(tokensFile)
    expect(offenders).toEqual([])
  })
})
