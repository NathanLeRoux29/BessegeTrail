// Compte à rebours de la bannière (ACC-07, ACC-10).

export interface Countdown {
  days: number
  hours: number
  minutes: number
}

// La date de départ des paramètres est saisie sans fuseau (« 2027-04-17T07:30 ») :
// c'est l'heure de Paris, où a lieu la course, que le serveur tourne en UTC ou non.
const timeZone = 'Europe/Paris'

const zoned = new Intl.DateTimeFormat('en-US', {
  timeZone,
  hourCycle: 'h23',
  year: 'numeric',
  month: 'numeric',
  day: 'numeric',
  hour: 'numeric',
  minute: 'numeric',
})

// Instant du départ : l'heure saisie, lue d'abord comme UTC, est décalée de
// l'écart entre Paris et UTC à cette date (heure d'été comprise).
export function startInstant(startDate: string): Date {
  const asUtc = new Date(`${startDate}Z`)
  const parts = Object.fromEntries(zoned.formatToParts(asUtc).map(part => [part.type, Number(part.value)]))
  const parisAsUtc = Date.UTC(parts.year!, parts.month! - 1, parts.day!, parts.hour!, parts.minute!)
  return new Date(asUtc.getTime() - (parisAsUtc - asUtc.getTime()))
}

const minute = 60_000

// Temps restant avant le départ, à la minute près ; null une fois le départ passé.
export function countdown(startDate: string, now: Date): Countdown | null {
  const remaining = Math.floor((startInstant(startDate).getTime() - now.getTime()) / minute)
  if (remaining <= 0) return null
  return {
    days: Math.floor(remaining / (24 * 60)),
    hours: Math.floor(remaining / 60) % 24,
    minutes: remaining % 60,
  }
}
