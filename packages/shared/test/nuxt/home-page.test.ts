import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, it } from 'vitest'
import { HomePage } from '#components'
import { contentWith } from '../fixtures'

describe('HomePage', () => {
  it('ACC-05 / ACC-35 : l’accueil commence par la bannière (seul h1) puis le bandeau de chiffres clés', async () => {
    const wrapper = await mountSuspended(HomePage, { props: { content: contentWith() } })

    expect(wrapper.findAll('h1').map(title => title.text())).toEqual(['Trail de Bessèges'])
    expect(wrapper.get('#accueil + .key-figures').text().replace(/\s+/g, ' ')).toContain('5 épreuves')
  })

  it('ACC-03 : chaque section visible a son ancre et son titre h2 modifiable', async () => {
    const wrapper = await mountSuspended(HomePage, {
      props: { content: contentWith([], { 'home.galerie': { title: 'En images' } }) },
    })

    expect(wrapper.findAll('section.page-section').map(section => section.attributes('id')))
      .toEqual(['presentation', 'epreuves', 'galerie', 'benevoles', 'partenaires', 'contact'])
    expect(wrapper.get('#galerie h2').text()).toBe('En images')
  })

  it('ACC-01 : une section masquée est absente du HTML', async () => {
    const wrapper = await mountSuspended(HomePage, { props: { content: contentWith(['home.presentation']) } })

    expect(wrapper.find('#presentation').exists()).toBe(false)
    expect(wrapper.html()).not.toContain('L’événement')
  })

  it('ACC-02 : l’alternance des fonds suit les sections affichées', async () => {
    const wrapper = await mountSuspended(HomePage, { props: { content: contentWith(['home.presentation']) } })

    expect(wrapper.get('#epreuves').classes()).toContain('page-section--background')
    expect(wrapper.get('#galerie').classes()).toContain('page-section--neutral')
  })

  it('ACC-04 : une galerie vide n’est pas rendue, même visible', async () => {
    const wrapper = await mountSuspended(HomePage, { props: { content: contentWith([], { 'home.galerie': { photos: [] } }) } })

    expect(wrapper.find('#galerie').exists()).toBe(false)
  })
})
