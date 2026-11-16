import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, it } from 'vitest'
import { HomeHero } from '#components'
import { contentWith } from '../fixtures'

const content = contentWith()
const settings = content.settings
const hero = content['home.hero']

function mountHero(overrides: { hero?: Partial<typeof hero>, settings?: Partial<typeof settings> } = {}) {
  return mountSuspended(HomeHero, {
    props: { hero: { ...hero, ...overrides.hero }, settings: { ...settings, ...overrides.settings } },
  })
}

describe('HomeHero', () => {
  it('ACC-05 : la bannière affiche l’image de fond, le nom en h1, la date, le lieu et le sous-titre', async () => {
    const wrapper = await mountHero()

    const background = wrapper.get('img.hero-bg')
    expect(background.attributes()).toMatchObject({ alt: '', fetchpriority: 'high', src: hero.image.src })
    expect(wrapper.get('h1').text()).toBe('Trail de Bessèges')
    expect(wrapper.text()).toContain('Samedi 17 avril 2027')
    expect(wrapper.text()).toContain('Bessèges (Gard)')
    expect(wrapper.get('.hero-subtitle').text()).toBe(hero.subtitle)
    expect(wrapper.get('section').attributes('id')).toBe('accueil')
  })

  it('ACC-05 : le bouton d’action principal a le libellé et le lien de la bannière', async () => {
    const wrapper = await mountHero({ hero: { cta: { label: 'Je m’inscris', url: 'https://inscription.example.org/bannière' } } })

    const cta = wrapper.get('a.button--primary')
    expect(cta.attributes()).toMatchObject({ href: 'https://inscription.example.org/bannière', target: '_blank', rel: 'noopener' })
    expect(cta.text()).toBe('Je m’inscris (nouvel onglet)')
  })

  it('ACC-05 : sans lien propre, le bouton mène au lien d’inscription général', async () => {
    const wrapper = await mountHero({ hero: { cta: { label: 'S’inscrire', url: '' } } })

    expect(wrapper.get('a.button--primary').attributes('href')).toBe(settings.registerUrl)
  })

  it('ACC-05 : sans aucun lien d’inscription, le bouton n’est pas affiché', async () => {
    const wrapper = await mountHero({ hero: { cta: { label: 'S’inscrire', url: '' } }, settings: { registerUrl: '' } })

    expect(wrapper.find('a.button--primary').exists()).toBe(false)
  })

  it('ACC-05 : un sous-titre, une date, un lieu ou une édition vides ne sont pas affichés', async () => {
    const wrapper = await mountHero({ hero: { subtitle: '' }, settings: { dateLabel: '', place: '', edition: '' } })

    expect(wrapper.find('.hero-subtitle').exists()).toBe(false)
    expect(wrapper.find('.hero-meta').exists()).toBe(false)
    expect(wrapper.find('.eyebrow').exists()).toBe(false)
  })

  it('ACC-11 : le compte à rebours masqué n’est pas rendu, le reste de la bannière si', async () => {
    const shown = await mountHero()
    const hidden = await mountHero({ hero: { showCountdown: false } })

    expect(shown.find('.hero-countdown').exists()).toBe(true)
    expect(hidden.find('.hero-countdown').exists()).toBe(false)
    expect(hidden.get('h1').text()).toBe('Trail de Bessèges')
  })
})
