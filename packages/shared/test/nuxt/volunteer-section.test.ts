import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, it } from 'vitest'
import { VolunteerSection } from '#components'
import { contentWith } from '../fixtures'

const block = contentWith()['home.benevoles']

function mountVolunteers(overrides: Partial<typeof block> = {}) {
  return mountSuspended(VolunteerSection, { props: { block: { ...block, ...overrides }, anchor: 'benevoles', background: 'neutral' } })
}

describe('VolunteerSection', () => {
  it('ACC-24 : la section affiche son titre, un texte mis en forme et l’image avec son texte alternatif', async () => {
    const wrapper = await mountVolunteers({ text: '<p>Sans <strong>bénévoles</strong>, pas de trail.</p>' })

    expect(wrapper.get('section#benevoles h2').text()).toBe(block.title)
    expect(wrapper.get('.rich-text strong').text()).toBe('bénévoles')
    expect(wrapper.get('img').attributes('alt')).toBe(block.image.alt)
  })

  it('ACC-24 : le bouton mène au lien externe, dans un nouvel onglet', async () => {
    const wrapper = await mountVolunteers()

    const button = wrapper.get('a.button--primary')
    expect(button.attributes()).toMatchObject({ href: block.button.url, target: '_blank', rel: 'noopener' })
    expect(button.text()).toBe(`${block.button.label} (nouvel onglet)`)
  })

  it('ACC-24 : sans lien, le bouton n’est pas affiché', async () => {
    const wrapper = await mountVolunteers({ button: { label: 'Je deviens bénévole', url: '' } })

    expect(wrapper.find('a.button--primary').exists()).toBe(false)
  })

  it('ACC-24 : l’image est facultative', async () => {
    const wrapper = await mountVolunteers({ image: { src: '', alt: '', width: 0, height: 0 } })

    expect(wrapper.find('img').exists()).toBe(false)
    expect(wrapper.find('.page-section__aside').exists()).toBe(false)
  })
})
