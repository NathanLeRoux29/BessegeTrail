import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, it } from 'vitest'
import { PageSection } from '#components'

describe('PageSection', () => {
  it('ACC-03 : la section a un id égal à son ancre et un titre h2 qui la nomme', async () => {
    const wrapper = await mountSuspended(PageSection, {
      props: { anchor: 'galerie', title: 'En images', background: 'neutral' },
      slots: { default: () => 'Contenu de la galerie' },
    })

    const section = wrapper.get('section')
    const title = section.get('h2')
    expect(section.attributes('id')).toBe('galerie')
    expect(title.text()).toBe('En images')
    expect(section.attributes('aria-labelledby')).toBe(title.attributes('id'))
    expect(section.text()).toContain('Contenu de la galerie')
  })

  it('ACC-02 : la section prend le fond demandé', async () => {
    const neutral = await mountSuspended(PageSection, { props: { anchor: 'galerie', title: 'Galerie', background: 'neutral' } })
    const light = await mountSuspended(PageSection, { props: { anchor: 'contact', title: 'Contact', background: 'background' } })

    expect(neutral.get('section').classes()).toContain('page-section--neutral')
    expect(light.get('section').classes()).toContain('page-section--background')
  })

  it('ACC-13 : un contenu à côté (image) forme une seconde colonne, absente sinon', async () => {
    const withAside = await mountSuspended(PageSection, {
      props: { anchor: 'presentation', title: 'L’événement' },
      slots: { default: () => 'Texte', aside: () => 'Image' },
    })
    const without = await mountSuspended(PageSection, { props: { anchor: 'contact', title: 'Contact' } })

    expect(withAside.get('.page-section__inner').classes()).toContain('page-section__inner--split')
    expect(withAside.get('.page-section__aside').text()).toBe('Image')
    expect(without.find('.page-section__aside').exists()).toBe(false)
  })
})
