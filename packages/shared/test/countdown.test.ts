import { describe, expect, it } from 'vitest'
import { countdown, startInstant } from '../shared/content/countdown'

describe('countdown', () => {
  it('ACC-07 : jours, heures et minutes restants jusqu’au départ', () => {
    // Départ le 17 avril 2027 à 7 h 30, heure de Paris (UTC+2 en avril).
    const now = new Date('2027-04-14T03:10:00Z')

    expect(countdown('2027-04-17T07:30', now)).toEqual({ days: 3, hours: 2, minutes: 20 })
  })

  it('ACC-07 : la date de départ est l’heure de Paris, quel que soit le fuseau du serveur', () => {
    expect(startInstant('2027-04-17T07:30').toISOString()).toBe('2027-04-17T05:30:00.000Z')
    expect(startInstant('2027-01-10T09:00').toISOString()).toBe('2027-01-10T08:00:00.000Z')
  })

  it('ACC-07 : les secondes restantes sont arrondies à la minute inférieure', () => {
    expect(countdown('2027-04-17T07:30', new Date('2027-04-17T05:28:30Z'))).toEqual({ days: 0, hours: 0, minutes: 1 })
  })

  it('ACC-10 : une fois l’heure de départ atteinte, il n’y a plus de compte à rebours', () => {
    expect(countdown('2027-04-17T07:30', new Date('2027-04-17T05:30:00Z'))).toBeNull()
    expect(countdown('2027-04-17T07:30', new Date('2027-05-01T00:00:00Z'))).toBeNull()
  })
})
