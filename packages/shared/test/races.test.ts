import { describe, expect, it } from 'vitest'
import { visibleRaces } from '../shared/content/races'
import { contentWith } from './fixtures'

describe('visibleRaces', () => {
  it('ACC-14 : les épreuves visibles suivent l’ordre défini (trail 40, 20, 13 km, randonnée, marche solidaire)', () => {
    expect(visibleRaces(contentWith()).map(race => race.slug))
      .toEqual(['trail-40', 'trail-20', 'trail-13', 'randonnee', 'marche-solidaire'])
  })

  it('ACC-16 : une épreuve masquée n’est pas dans la liste', () => {
    const races = visibleRaces(contentWith(['race.trail-20', 'race.randonnee']))

    expect(races.map(race => race.slug)).toEqual(['trail-40', 'trail-13', 'marche-solidaire'])
    expect(races[0]).toMatchObject({ slug: 'trail-40', name: 'La Cévenole', distance: 40, type: 'Trail' })
  })
})
