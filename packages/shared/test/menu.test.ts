import { describe, expect, it } from 'vitest'
import { blockKeys, blockSchemas, type PublishedContent } from '../shared/content/blocks'
import { hiddenMenuTargets } from '../shared/content/menu'

// Contenu où toutes les sections masquables sont visibles, sauf `hidden`.
function contentWith(hidden: string[] = []): PublishedContent {
  return Object.fromEntries(blockKeys.map((key) => {
    const block = blockSchemas[key].parse({}) as Record<string, unknown>
    return [key, 'visible' in block ? { ...block, visible: !hidden.includes(key) } : block]
  })) as PublishedContent
}

describe('hiddenMenuTargets', () => {
  it('SOC-03 : quand tout est visible, aucune cible n’est masquée', () => {
    expect(hiddenMenuTargets(contentWith())).toEqual([])
  })

  it('SOC-03 : une section masquée de l’accueil masque son ancre', () => {
    expect(hiddenMenuTargets(contentWith(['home.galerie', 'home.contact']))).toEqual(['/#galerie', '/#contact'])
  })

  it('SOC-03 : une épreuve masquée masque sa page', () => {
    expect(hiddenMenuTargets(contentWith(['race.trail-13']))).toEqual(['/epreuves/trail-13'])
  })

  it('SOC-03 : une section masquée des Infos pratiques masque son ancre', () => {
    expect(hiddenMenuTargets(contentWith(['infos.faq']))).toEqual(['/infos-pratiques#faq'])
  })

  it('SOC-03 : les épreuves de l’accueil et la page Infos pratiques ne sont jamais masquées', () => {
    const allHidden = hiddenMenuTargets(contentWith([...blockKeys]))

    expect(allHidden).not.toContain('/#epreuves')
    expect(allHidden).not.toContain('/infos-pratiques')
    expect(allHidden).toHaveLength(12)
  })
})
