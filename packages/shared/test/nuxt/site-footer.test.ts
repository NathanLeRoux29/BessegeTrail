import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, it } from 'vitest'
import { SiteFooter } from '#components'
import { blockSchemas } from '../../shared/content/blocks'

const settings = blockSchemas.settings.parse({
  eventName: 'Trail de Bessèges',
  place: 'Bessèges (Gard)',
  dateLabel: 'Samedi 17 avril 2027',
  email: 'contact@trail-besseges.fr',
  socials: { instagram: 'https://www.instagram.com/trail-besseges' },
})
const footer = blockSchemas.footer.parse({ association: 'Association Horizon Cévennes', text: '© 2027 Horizon Cévennes' })
const header = blockSchemas.header.parse({ logo: { src: '/demo/logos/logo.svg', alt: 'Trail de Bessèges, accueil' }, title: 'Trail de Bessèges' })

function mountFooter(overrides: { settings?: typeof settings, footer?: typeof footer } = {}) {
  return mountSuspended(SiteFooter, { props: { settings, footer, header, ...overrides } })
}

describe('SiteFooter', () => {
  it('SOC-06 : affiche l’association, l’e-mail, les réseaux, les liens légaux et le texte libre', async () => {
    const wrapper = await mountFooter()

    expect(wrapper.text()).toContain('Association Horizon Cévennes')
    expect(wrapper.get('a[href="mailto:contact@trail-besseges.fr"]').text()).toBe('contact@trail-besseges.fr')
    expect(wrapper.get('a[href="https://www.instagram.com/trail-besseges"]').text()).toBe('Instagram du Trail de Bessèges (nouvel onglet)')
    expect(wrapper.get('a[href="/mentions-legales"]').text()).toBe('Mentions légales')
    expect(wrapper.get('a[href="/confidentialite"]').text()).toBe('Politique de confidentialité')
    expect(wrapper.text()).toContain('© 2027 Horizon Cévennes')
  })

  it('SOC-06 : rappelle le titre, la date et le lieu, avec un lien vers l’accueil', async () => {
    const wrapper = await mountFooter()

    const brand = wrapper.get('a.brand')
    expect(brand.attributes('href')).toBe('/')
    expect(brand.text()).toBe('Trail de Bessèges')
    expect(brand.get('img').attributes('alt')).toBe('')
    expect(wrapper.text()).toContain('Samedi 17 avril 2027 · Bessèges (Gard)')
  })

  it('SOC-06 : une association, un e-mail ou un texte libre vide n’est pas affiché', async () => {
    const wrapper = await mountFooter({
      settings: { ...settings, email: '', dateLabel: '', place: '' },
      footer: { association: '', text: '' },
    })

    expect(wrapper.find('a[href^="mailto:"]').exists()).toBe(false)
    expect(wrapper.find('.footer-contact').exists()).toBe(false)
    expect(wrapper.find('.footer-text').exists()).toBe(false)
    expect(wrapper.find('.footer-date').exists()).toBe(false)
  })
})
