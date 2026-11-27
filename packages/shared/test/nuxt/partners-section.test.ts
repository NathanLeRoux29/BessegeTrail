import { mountSuspended } from '@nuxt/test-utils/runtime'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { PartnersSection } from '#components'
import { contentWith } from '../fixtures'

const block = contentWith()['home.partenaires']

function mountPartners(overrides: Partial<typeof block> = {}) {
  return mountSuspended(PartnersSection, { props: { block: { ...block, ...overrides }, anchor: 'partenaires', background: 'background' } })
}

// Logos plus larges que le bandeau : le défilement est nécessaire.
function overflowing() {
  vi.spyOn(HTMLElement.prototype, 'scrollWidth', 'get').mockReturnValue(2000)
  vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(1200)
}

describe('PartnersSection', () => {
  afterEach(() => vi.restoreAllMocks())

  it('ACC-28 : chaque logo a le nom du partenaire pour texte alternatif et mène à son site, dans un nouvel onglet', async () => {
    const wrapper = await mountPartners()

    const track = wrapper.get('.marquee-track:not([aria-hidden])')
    expect(track.findAll('img').map(image => image.attributes('alt'))).toEqual(block.items.map(item => item.name))
    const link = track.get('a')
    expect(link.attributes()).toMatchObject({ href: block.items[0]!.url, target: '_blank', rel: 'noopener' })
    expect(link.text()).toBe('(nouvel onglet)')
  })

  it('ACC-28 : un partenaire sans site a son logo sans lien', async () => {
    const wrapper = await mountPartners({ items: [{ name: 'Mairie de Bessèges', logo: '/demo/logos/partenaire-1.svg', url: '' }] })

    const track = wrapper.get('.marquee-track:not([aria-hidden])')
    expect(track.find('a').exists()).toBe(false)
    expect(track.get('img').attributes('alt')).toBe('Mairie de Bessèges')
  })

  it('ACC-34 : la copie qui sert à la boucle est cachée aux lecteurs d’écran et sortie de l’ordre de tabulation', async () => {
    const wrapper = await mountPartners()

    const copy = wrapper.get('.marquee-track[aria-hidden="true"]')
    expect(copy.findAll('a').every(link => link.attributes('tabindex') === '-1')).toBe(true)
    expect(copy.findAll('img').every(image => image.attributes('alt') === '')).toBe(true)
    expect(wrapper.findAll('.marquee-track')).toHaveLength(2)
  })

  it('ACC-31 : la durée du tour suit le nombre de logos, pour une vitesse constante', async () => {
    const six = await mountPartners()
    const three = await mountPartners({ items: block.items.slice(0, 3) })

    expect(six.get('.marquee').attributes('style')).toContain('--duration: 30s')
    expect(three.get('.marquee').attributes('style')).toContain('--duration: 15s')
  })

  it('ACC-32 : le bouton met en pause puis reprend le défilement (aria-pressed)', async () => {
    overflowing()
    const wrapper = await mountPartners()
    await new Promise(resolve => setTimeout(resolve, 0))

    const button = wrapper.get('button.marquee-toggle')
    expect(button.attributes('aria-pressed')).toBe('false')
    expect(button.text()).toBe('Mettre en pause le défilement')

    await button.trigger('click')
    expect(button.attributes('aria-pressed')).toBe('true')
    expect(button.text()).toBe('Reprendre le défilement')
    expect(wrapper.get('.marquee').classes()).toContain('is-paused')

    await button.trigger('click')
    expect(wrapper.get('.marquee').classes()).not.toContain('is-paused')
  })

  it('ACC-33 : si les logos tiennent dans la largeur, grille fixe sans bouton de pause', async () => {
    vi.spyOn(HTMLElement.prototype, 'scrollWidth', 'get').mockReturnValue(400)
    vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(1200)
    const wrapper = await mountPartners({ items: block.items.slice(0, 2) })
    await new Promise(resolve => setTimeout(resolve, 0))

    expect(wrapper.get('.marquee').classes()).toContain('is-static')
    expect(wrapper.find('button.marquee-toggle').exists()).toBe(false)
  })

  it('ACC-31 : si les logos dépassent la largeur, ils défilent', async () => {
    overflowing()
    const wrapper = await mountPartners()
    await new Promise(resolve => setTimeout(resolve, 0))

    expect(wrapper.get('.marquee').classes()).not.toContain('is-static')
  })
})
