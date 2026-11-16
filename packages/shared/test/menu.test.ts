import { describe, expect, it } from 'vitest'
import { blockKeys } from '../shared/content/blocks'
import { hiddenMenuTargets } from '../shared/content/menu'
import { contentWith } from './fixtures'

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

  it('SOC-03 / ACC-04 : une section de liste vide, qui n’est pas rendue, masque son ancre', () => {
    const content = contentWith([], { 'home.galerie': { photos: [] }, 'infos.faq': { items: [] } })

    expect(hiddenMenuTargets(content)).toEqual(['/#galerie', '/infos-pratiques#faq'])
  })
})
