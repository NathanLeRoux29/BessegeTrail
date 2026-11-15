import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, it } from 'vitest'
import { SocialLinks } from '#components'

const socials = {
  facebook: 'https://www.facebook.com/trail-besseges',
  instagram: 'https://www.instagram.com/trail-besseges',
  strava: '',
  youtube: '',
}

describe('SocialLinks', () => {
  it('SOC-07 : chaque réseau renseigné a un lien externe et un nom accessible', async () => {
    const wrapper = await mountSuspended(SocialLinks, { props: { socials, eventName: 'Trail de Bessèges' } })

    const links = wrapper.findAll('a')
    expect(links.map(link => link.text())).toEqual([
      'Facebook du Trail de Bessèges (nouvel onglet)',
      'Instagram du Trail de Bessèges (nouvel onglet)',
    ])
    expect(links[0]!.attributes()).toMatchObject({ href: socials.facebook, target: '_blank', rel: 'noopener' })
    expect(links[0]!.get('svg').attributes('aria-hidden')).toBe('true')
  })

  it('SOC-07 : un réseau sans URL n’est pas affiché', async () => {
    const wrapper = await mountSuspended(SocialLinks, { props: { socials, eventName: 'Trail de Bessèges' } })

    expect(wrapper.text()).not.toMatch(/Strava|YouTube/)
  })

  it('SOC-07 : sans aucun réseau, la liste n’est pas rendue', async () => {
    const wrapper = await mountSuspended(SocialLinks, {
      props: { socials: { facebook: '', instagram: '', strava: '', youtube: '' }, eventName: 'Trail de Bessèges' },
    })

    expect(wrapper.find('ul').exists()).toBe(false)
  })
})
