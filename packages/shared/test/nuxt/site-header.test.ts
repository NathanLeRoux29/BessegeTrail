import { mountSuspended } from '@nuxt/test-utils/runtime'
import { afterEach, describe, expect, it } from 'vitest'
import { SiteHeader } from '#components'
import { blockSchemas } from '../../shared/content/blocks'

const header = blockSchemas.header.parse({
  logo: { src: '/demo/logos/logo.svg', alt: 'Trail de Bessèges, accueil' },
  title: 'Trail de Bessèges',
  menu: [
    { label: 'Épreuves', target: '/#epreuves' },
    { label: 'Galerie', target: '/#galerie' },
    { label: 'Infos pratiques', target: '/infos-pratiques' },
    { label: 'Résultats', target: 'https://www.example.org/resultats' },
  ],
  cta: { label: 'S’inscrire', url: 'https://www.example.org/inscription-header' },
})
const registerUrl = 'https://www.example.org/inscriptions'

type HeaderProps = { header?: typeof header, registerUrl?: string, hiddenTargets?: string[] }

function mountHeader(props: HeaderProps = {}) {
  return mountSuspended(SiteHeader, { props: { header, registerUrl, ...props }, attachTo: document.body })
}

afterEach(() => {
  document.body.innerHTML = ''
})

describe('SiteHeader', () => {
  it('SOC-01 : affiche le logo (lien vers l’accueil), le titre, le menu et le bouton d’action', async () => {
    const wrapper = await mountHeader()

    const brand = wrapper.get('a.brand')
    expect(brand.attributes('href')).toBe('/')
    expect(brand.get('img').attributes()).toMatchObject({ src: '/demo/logos/logo.svg', alt: 'Trail de Bessèges, accueil' })
    expect(brand.text()).toBe('Trail de Bessèges')
    expect(wrapper.findAll('nav li a').map(link => link.text())).toEqual(['Épreuves', 'Galerie', 'Infos pratiques', 'Résultats (nouvel onglet)'])
    const cta = wrapper.get('.header-cta')
    expect(cta.text()).toBe('S’inscrire (nouvel onglet)')
    expect(cta.attributes()).toMatchObject({ href: 'https://www.example.org/inscription-header', target: '_blank', rel: 'noopener' })
  })

  it('SOC-01 : sans lien, le bouton d’action mène au lien d’inscription général', async () => {
    const wrapper = await mountHeader({ header: { ...header, cta: { label: 'S’inscrire', url: '' } } })

    expect(wrapper.get('.header-cta').attributes('href')).toBe(registerUrl)
  })

  it('SOC-01 : sans aucun lien d’inscription, le bouton d’action n’est pas affiché', async () => {
    const wrapper = await mountHeader({ header: { ...header, cta: { label: 'S’inscrire', url: '' } }, registerUrl: '' })

    expect(wrapper.find('.header-cta').exists()).toBe(false)
  })

  it('SOC-02 : une URL externe s’ouvre dans un nouvel onglet, signalé aux lecteurs d’écran', async () => {
    const wrapper = await mountHeader()

    const links = wrapper.findAll('nav li a')
    expect(links[3]!.attributes()).toMatchObject({ href: 'https://www.example.org/resultats', target: '_blank', rel: 'noopener' })
    expect(links[3]!.get('.visually-hidden').text()).toBe('(nouvel onglet)')
    expect(links[1]!.attributes('href')).toBe('/#galerie')
    expect(links[1]!.attributes('target')).toBeUndefined()
  })

  it('SOC-03 : un élément qui cible une section masquée n’est pas affiché', async () => {
    const wrapper = await mountHeader({ hiddenTargets: ['/#galerie'] })

    expect(wrapper.findAll('nav li a').map(link => link.text())).not.toContain('Galerie')
    expect(wrapper.findAll('nav li')).toHaveLength(3)
  })

  it('un logo sans fichier n’affiche pas d’image, le titre reste', async () => {
    const wrapper = await mountHeader({ header: { ...header, logo: { src: '', alt: '' } } })

    expect(wrapper.find('a.brand img').exists()).toBe(false)
    expect(wrapper.get('a.brand').text()).toBe('Trail de Bessèges')
  })

  it('SOC-04 : le bouton « Menu » ouvre le menu, Échap le referme et rend le focus au bouton', async () => {
    const wrapper = await mountHeader()
    const toggle = wrapper.get('button.menu-toggle')
    const nav = wrapper.get('nav')

    expect(toggle.text()).toBe('Menu')
    expect(toggle.attributes()).toMatchObject({ 'aria-expanded': 'false', 'aria-controls': nav.attributes('id') })

    await toggle.trigger('click')
    expect(toggle.attributes('aria-expanded')).toBe('true')
    expect(nav.classes()).toContain('is-open')
    expect(document.activeElement).toBe(nav.find('a').element)

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    await wrapper.vm.$nextTick()
    expect(toggle.attributes('aria-expanded')).toBe('false')
    expect(nav.classes()).not.toContain('is-open')
    expect(document.activeElement).toBe(toggle.element)
  })

  it('SOC-04 : choisir un lien du menu le referme', async () => {
    const wrapper = await mountHeader()
    const toggle = wrapper.get('button.menu-toggle')

    await toggle.trigger('click')
    await wrapper.get('nav li a').trigger('click')

    expect(toggle.attributes('aria-expanded')).toBe('false')
  })
})
