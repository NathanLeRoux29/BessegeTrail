import { describe, expect, it } from 'vitest'
import { homeSectionKeys, infosSectionKeys, shownSections } from '../shared/content/sections'
import { contentWith } from './fixtures'

describe('shownSections', () => {
  it('ACC-03 : les sections de l’accueil suivent l’ordre fixe, chacune avec son ancre', () => {
    const sections = shownSections(homeSectionKeys, contentWith())

    expect(sections.map(section => section.anchor)).toEqual(['presentation', 'epreuves', 'galerie', 'benevoles', 'partenaires', 'contact'])
    expect(sections[0]!.key).toBe('home.presentation')
  })

  it('ACC-01 : une section masquée n’est pas rendue', () => {
    const anchors = shownSections(homeSectionKeys, contentWith(['home.galerie', 'home.contact'])).map(section => section.anchor)

    expect(anchors).toEqual(['presentation', 'epreuves', 'benevoles', 'partenaires'])
  })

  it('ACC-02 : les sections visibles alternent les fonds blanc cassé et sable', () => {
    const backgrounds = shownSections(homeSectionKeys, contentWith()).map(section => section.background)

    expect(backgrounds).toEqual(['background', 'neutral', 'background', 'neutral', 'background', 'neutral'])
  })

  it('ACC-02 : masquer une section ne casse pas l’alternance', () => {
    const sections = shownSections(homeSectionKeys, contentWith(['home.presentation']))

    expect(sections.map(section => [section.anchor, section.background])).toEqual([
      ['epreuves', 'background'],
      ['galerie', 'neutral'],
      ['benevoles', 'background'],
      ['partenaires', 'neutral'],
      ['contact', 'background'],
    ])
  })

  it('ACC-04 : une galerie sans photo ou des partenaires sans logo ne sont pas rendus, même visibles', () => {
    const content = contentWith([], { 'home.galerie': { photos: [] }, 'home.partenaires': { items: [] } })

    expect(shownSections(homeSectionKeys, content).map(section => section.anchor)).toEqual(['presentation', 'epreuves', 'benevoles', 'contact'])
  })

  it('ACC-04 : une FAQ sans question n’est pas rendue sur la page Infos pratiques', () => {
    const content = contentWith([], { 'infos.faq': { items: [] } })

    expect(shownSections(infosSectionKeys, content).map(section => section.anchor)).toEqual(['pratiques'])
  })

  it('ACC-01 : la section Les épreuves, non masquable, est toujours rendue', () => {
    const allHidden = contentWith([...homeSectionKeys])

    expect(shownSections(homeSectionKeys, allHidden).map(section => section.anchor)).toEqual(['epreuves'])
  })
})
