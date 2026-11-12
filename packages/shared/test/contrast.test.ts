import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

// Contraste WCAG 2 entre deux couleurs hexadécimales (#RRGGBB).
function luminance(hex: string): number {
  const channels = [1, 3, 5].map(start => Number.parseInt(hex.slice(start, start + 2), 16) / 255)
  const [r = 0, g = 0, b = 0] = channels.map(c => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4))
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

function contrast(foreground: string, background: string): number {
  const [light, dark] = [luminance(foreground), luminance(background)].sort((a, b) => b - a)
  return (light! + 0.05) / (dark! + 0.05)
}

// Valeurs lues dans le vrai fichier de jetons : changer une couleur relance le contrôle.
const tokens = readFileSync(new URL('../app/assets/css/tokens.css', import.meta.url), 'utf8')

function token(name: string): string {
  const value = tokens.match(new RegExp(`--color-${name}\\s*:\\s*(#[0-9a-fA-F]{6})\\s*;`))?.[1]
  if (!value) throw new Error(`jeton --color-${name} absent de tokens.css`)
  return value
}

// Associations autorisées de la spec 04 : [texte, fond].
const allowed: [string, string][] = [
  ['secondary', 'primary'],
  ['background', 'secondary'],
  ['text', 'background'],
  ['text', 'neutral'],
  ['secondary', 'neutral'],
  ['secondary', 'background'],
  ['primary', 'secondary'],
]

describe('contraste des couleurs', () => {
  it('THM-02 : le calcul donne 21:1 pour du noir sur du blanc', () => {
    expect(contrast('#000000', '#FFFFFF')).toBeCloseTo(21, 5)
  })

  it.each(allowed)('THM-02 : texte %s sur fond %s atteint 4,5:1', (text, background) => {
    expect(contrast(token(text), token(background))).toBeGreaterThanOrEqual(4.5)
  })

  it('THM-02 : texte blanc cassé sur orange reste interdit (sous 4,5:1)', () => {
    expect(contrast(token('background'), token('primary'))).toBeLessThan(4.5)
  })
})
