import { mountSuspended } from '@nuxt/test-utils/runtime'
import { clearNuxtState } from '#imports'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { HeroCountdown } from '#components'

const props = { startDate: '2027-04-17T07:30', afterText: 'Merci à tous, rendez-vous l’an prochain !' }

describe('HeroCountdown', () => {
  beforeEach(() => {
    // L'horloge avance aussi seule : mountSuspended attend ses propres minuteurs.
    vi.useFakeTimers({ shouldAdvanceTime: true })
    clearNuxtState()
  })

  afterEach(() => vi.useRealTimers())

  // Instants au milieu d'une minute : l'horloge qui avance seule ne change pas le résultat.
  it('ACC-07 : affiche les jours, heures et minutes restants', async () => {
    vi.setSystemTime(new Date('2027-04-14T03:09:30Z'))
    const wrapper = await mountSuspended(HeroCountdown, { props })

    expect(wrapper.findAll('.countdown-box').map(box => box.text().replace(/\s+/g, ' '))).toEqual(['3 jours', '2 heures', '20 minutes'])
  })

  it('ACC-08 : le compte à rebours est mis à jour chaque minute', async () => {
    vi.setSystemTime(new Date('2027-04-14T03:09:30Z'))
    const wrapper = await mountSuspended(HeroCountdown, { props })
    const minutes = () => wrapper.findAll('.countdown-box strong').at(-1)!.text()
    expect(minutes()).toBe('20')

    await vi.advanceTimersByTimeAsync(90_000)

    expect(minutes()).toBe('19')
  })

  it('ACC-09 : seul un texte statique est exposé aux lecteurs d’écran, sans annonce en continu', async () => {
    vi.setSystemTime(new Date('2027-04-14T03:09:30Z'))
    const wrapper = await mountSuspended(HeroCountdown, { props })

    expect(wrapper.get('.visually-hidden').text()).toBe('Départ dans 3 jours')
    expect(wrapper.get('.countdown-boxes').attributes('aria-hidden')).toBe('true')
    expect(wrapper.get('.countdown-label').attributes('aria-hidden')).toBe('true')
    expect(wrapper.find('[aria-live]').exists()).toBe(false)
  })

  it('ACC-09 : le dernier jour, le texte statique reste juste', async () => {
    vi.setSystemTime(new Date('2027-04-17T01:00:00Z'))
    const wrapper = await mountSuspended(HeroCountdown, { props })

    expect(wrapper.get('.visually-hidden').text()).toBe('Départ dans moins d’un jour')
  })

  it('ACC-10 : après le départ, le texte de remplacement est affiché à la place', async () => {
    vi.setSystemTime(new Date('2027-04-18T10:00:00Z'))
    const wrapper = await mountSuspended(HeroCountdown, { props })

    expect(wrapper.find('.countdown-boxes').exists()).toBe(false)
    expect(wrapper.get('.countdown-after').text()).toBe('Merci à tous, rendez-vous l’an prochain !')
  })

  it('ACC-10 : le texte de remplacement prend le relais quand le départ arrive, page ouverte', async () => {
    vi.setSystemTime(new Date('2027-04-17T05:28:30Z'))
    const wrapper = await mountSuspended(HeroCountdown, { props })
    expect(wrapper.find('.countdown-after').exists()).toBe(false)

    await vi.advanceTimersByTimeAsync(90_000)

    expect(wrapper.find('.countdown-after').exists()).toBe(true)
  })

  it('sans date de départ, rien n’est affiché', async () => {
    const wrapper = await mountSuspended(HeroCountdown, { props: { ...props, startDate: '' } })

    expect(wrapper.text()).toBe('')
  })
})
