import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, it } from 'vitest'
import { ContactSection } from '#components'
import { contentWith } from '../fixtures'

const content = contentWith()
const block = content['home.contact']
const settings = content.settings

function mountContact(overrides: { block?: Partial<typeof block>, settings?: Partial<typeof settings> } = {}) {
  return mountSuspended(ContactSection, {
    props: { block: { ...block, ...overrides.block }, settings: { ...settings, ...overrides.settings }, anchor: 'contact', background: 'background' },
  })
}

describe('ContactSection', () => {
  it('ACC-30 : la section affiche son titre, son texte d’introduction et l’e-mail en lien mailto:', async () => {
    const wrapper = await mountContact()

    expect(wrapper.get('section#contact h2').text()).toBe(block.title)
    expect(wrapper.get('.section-head p').text()).toBe(block.text)
    expect(wrapper.get('a.contact-mail').attributes('href')).toBe(`mailto:${settings.email}`)
    expect(wrapper.get('a.contact-mail').text()).toBe(settings.email)
  })

  it('ACC-30 : les réseaux sociaux renseignés dans les paramètres sont affichés, pas les autres', async () => {
    const wrapper = await mountContact({ settings: { socials: { facebook: '', instagram: 'https://www.instagram.com/trail', strava: '', youtube: '' } } })

    const links = wrapper.findAll('ul.socials a')
    expect(links.map(link => link.attributes('href'))).toEqual(['https://www.instagram.com/trail'])
  })

  it('ACC-30 : sans e-mail ni texte, ni lien ni paragraphe vide', async () => {
    const wrapper = await mountContact({ block: { text: '' }, settings: { email: '' } })

    expect(wrapper.find('a[href^="mailto:"]').exists()).toBe(false)
    expect(wrapper.find('.section-head p').exists()).toBe(false)
  })
})
