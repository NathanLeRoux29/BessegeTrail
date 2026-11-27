import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, it } from 'vitest'
import { RacesSection } from '#components'
import { visibleRaces } from '../../shared/content/races'
import { contentWith } from '../fixtures'

const content = contentWith()
const block = content['home.epreuves']

function mountRaces(hidden: string[] = [], overrides: Partial<typeof block> = {}, raceOverrides = {}) {
  const races = visibleRaces(contentWith(hidden, raceOverrides))
  return mountSuspended(RacesSection, { props: { block: { ...block, ...overrides }, races, anchor: 'epreuves', background: 'neutral' } })
}

describe('RacesSection', () => {
  it('ACC-14 : un texte d’introduction puis une carte par épreuve, dans l’ordre défini', async () => {
    const wrapper = await mountRaces()

    expect(wrapper.get('.section-head p').text()).toBe(block.intro)
    expect(wrapper.findAll('.race-card').map(card => card.attributes('href')))
      .toEqual(['/epreuves/trail-40', '/epreuves/trail-20', '/epreuves/trail-13', '/epreuves/randonnee', '/epreuves/marche-solidaire'])
  })

  it('ACC-14 : sans introduction, aucun paragraphe vide', async () => {
    const wrapper = await mountRaces([], { intro: '' })

    expect(wrapper.find('.section-head p').exists()).toBe(false)
  })

  it('ACC-15 : chaque carte affiche le nom, la distance, le type et l’image, dans un seul lien', async () => {
    const wrapper = await mountRaces()

    const card = wrapper.findAll('li')[0]!
    expect(card.findAll('a')).toHaveLength(1)
    expect(card.get('.race-name').text()).toBe('La Cévenole')
    expect(card.get('.race-distance').text().replace(/\s+/g, ' ')).toBe('40 km')
    expect(card.get('.race-badge').text()).toBe('Trail')
    expect(card.get('img').attributes()).toMatchObject({ alt: '', loading: 'lazy' })
  })

  it('ACC-15 : une distance décimale est écrite à la française, une distance inconnue n’est pas affichée', async () => {
    const wrapper = await mountRaces([], {}, { 'race.trail-13': { distance: 13.5 }, 'race.randonnee': { distance: null } })

    const cards = wrapper.findAll('.race-card')
    expect(cards[2]!.get('.race-distance').text().replace(/\s+/g, ' ')).toBe('13,5 km')
    expect(cards[3]!.find('.race-distance').exists()).toBe(false)
  })

  it('ACC-16 : une épreuve masquée n’a pas de carte', async () => {
    const wrapper = await mountRaces(['race.trail-20'])

    expect(wrapper.findAll('.race-card')).toHaveLength(4)
    expect(wrapper.find('a[href="/epreuves/trail-20"]').exists()).toBe(false)
  })
})
