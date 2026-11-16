import { describe, expect, it } from 'vitest'
import { keyFigures } from '../shared/content/key-figures'
import { contentWith } from './fixtures'

describe('keyFigures', () => {
  it('ACC-35 : le bandeau compte les épreuves visibles, la plus longue distance, le plus grand dénivelé et l’édition', () => {
    expect(keyFigures(contentWith())).toEqual([
      { value: '5', label: 'épreuves' },
      { value: '40 km', label: 'le plus long' },
      { value: '1 900 m', label: 'de dénivelé positif' },
      { value: '1re', label: 'édition' },
    ])
  })

  it('ACC-35 : les chiffres sont recalculés quand une épreuve est masquée', () => {
    const figures = keyFigures(contentWith(['race.trail-40', 'race.marche-solidaire']))

    expect(figures.slice(0, 3)).toEqual([
      { value: '3', label: 'épreuves' },
      { value: '20 km', label: 'le plus long' },
      { value: '950 m', label: 'de dénivelé positif' },
    ])
  })

  it('ACC-35 : une seule épreuve visible, au singulier, et une distance décimale à la française', () => {
    const races = ['race.trail-40', 'race.trail-20', 'race.randonnee', 'race.marche-solidaire']
    const figures = keyFigures(contentWith(races, { 'race.trail-13': { distance: 13.5 } }))

    expect(figures.slice(0, 2)).toEqual([{ value: '1', label: 'épreuve' }, { value: '13,5 km', label: 'le plus long' }])
  })

  it('ACC-35 : une distance, un dénivelé ou une édition non renseignés ne sont pas affichés', () => {
    const unknown = { distance: null, elevationGain: null }
    const content = contentWith([], {
      'settings': { edition: '' },
      'race.trail-40': unknown,
      'race.trail-20': unknown,
      'race.trail-13': unknown,
      'race.randonnee': unknown,
      'race.marche-solidaire': unknown,
    })

    expect(keyFigures(content)).toEqual([{ value: '5', label: 'épreuves' }])
  })

  it('ACC-35 : sans épreuve visible, le bandeau est vide', () => {
    const races = ['race.trail-40', 'race.trail-20', 'race.trail-13', 'race.randonnee', 'race.marche-solidaire']

    expect(keyFigures(contentWith(races))).toEqual([])
  })

  it('ACC-35 : une édition en un seul mot est complétée par « édition »', () => {
    expect(keyFigures(contentWith([], { settings: { edition: '2027' } })).at(-1)).toEqual({ value: '2027', label: 'édition' })
  })
})
