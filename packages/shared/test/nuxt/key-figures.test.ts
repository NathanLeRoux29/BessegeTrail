import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, it } from 'vitest'
import { KeyFigures } from '#components'

describe('KeyFigures', () => {
  it('ACC-35 : chaque chiffre clé est affiché avec son libellé, dans une liste nommée', async () => {
    const wrapper = await mountSuspended(KeyFigures, {
      props: { figures: [{ value: '5', label: 'épreuves' }, { value: '40 km', label: 'le plus long' }] },
    })

    expect(wrapper.get('ul').attributes('aria-label')).toBe('Chiffres clés')
    expect(wrapper.findAll('li').map(item => item.text().replace(/\s+/g, ' '))).toEqual(['5 épreuves', '40 km le plus long'])
  })

  it('ACC-35 : sans chiffre, le bandeau n’est pas rendu', async () => {
    const wrapper = await mountSuspended(KeyFigures, { props: { figures: [] } })

    expect(wrapper.find('ul').exists()).toBe(false)
  })
})
