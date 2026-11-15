import { describe, expect, it } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { RichText } from '#components'

describe('RichText', () => {
  it('affiche le texte mis en forme', async () => {
    const wrapper = await mountSuspended(RichText, { props: { html: '<h3>Accès</h3><p>Parking <strong>gratuit</strong>.</p>' } })

    expect(wrapper.find('h3').text()).toBe('Accès')
    expect(wrapper.find('strong').text()).toBe('gratuit')
  })

  it('CNT-06 : n’affiche ni script, ni onclick, ni lien javascript:', async () => {
    const html = '<p onclick="alert(1)">a</p><script>alert(1)</script><a href="javascript:alert(1)">b</a><img src="x" onerror="alert(1)">'
    const wrapper = await mountSuspended(RichText, { props: { html } })

    expect(wrapper.html()).not.toMatch(/script|onclick|onerror|javascript:|<img/i)
    expect(wrapper.text()).toContain('a')
  })

  it('ouvre un lien externe dans un nouvel onglet, signalé aux lecteurs d’écran', async () => {
    const wrapper = await mountSuspended(RichText, { props: { html: '<p><a href="https://exemple.fr">Résultats</a></p>' } })
    const link = wrapper.find('a')

    expect(link.attributes()).toMatchObject({ target: '_blank', rel: 'noopener' })
    expect(link.find('.visually-hidden').text()).toBe('(nouvel onglet)')
  })
})
