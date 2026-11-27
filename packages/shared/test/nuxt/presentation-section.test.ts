import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, it } from 'vitest'
import { PresentationSection } from '#components'
import { contentWith } from '../fixtures'

const block = contentWith()['home.presentation']

function mountPresentation(overrides: Partial<typeof block> = {}) {
  return mountSuspended(PresentationSection, {
    props: { block: { ...block, ...overrides }, anchor: 'presentation', background: 'background', edition: '1re édition' },
  })
}

describe('PresentationSection', () => {
  it('ACC-12 : la section affiche son titre et un texte mis en forme (paragraphes, gras, italique, liens, listes)', async () => {
    const wrapper = await mountPresentation({
      title: 'L’événement',
      text: '<p>Un <strong>trail</strong> en <em>Cévennes</em>, <a href="https://example.org">en savoir plus</a>.</p><ul><li>40 km</li></ul>',
    })

    expect(wrapper.get('section#presentation h2').text()).toBe('L’événement')
    expect(wrapper.get('.eyebrow').text()).toBe('1re édition')
    const text = wrapper.get('.rich-text')
    expect(text.get('strong').text()).toBe('trail')
    expect(text.get('em').text()).toBe('Cévennes')
    expect(text.get('a').attributes('href')).toBe('https://example.org')
    expect(text.get('ul li').text()).toBe('40 km')
  })

  it('ACC-12 : l’image, porteuse d’information, a son texte alternatif et passe à côté du texte', async () => {
    const wrapper = await mountPresentation()

    const image = wrapper.get('.page-section__aside img')
    expect(image.attributes('alt')).toBe(block.image.alt)
    expect(image.attributes('loading')).toBe('lazy')
  })

  it('ACC-12 : l’image est facultative, la section reste sur une colonne sans elle', async () => {
    const wrapper = await mountPresentation({ image: { src: '', alt: '', width: 0, height: 0 } })

    expect(wrapper.find('img').exists()).toBe(false)
    expect(wrapper.find('.page-section__aside').exists()).toBe(false)
  })

  it('ACC-12 : un texte vide n’est pas affiché', async () => {
    const wrapper = await mountPresentation({ text: '' })

    expect(wrapper.find('.rich-text').exists()).toBe(false)
  })
})
