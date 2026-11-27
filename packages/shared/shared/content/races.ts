import type { BlockContent, PublishedContent } from './blocks'
import { races, type RaceSlug } from './site'

export type VisibleRace = BlockContent<'race.trail-40'> & { slug: RaceSlug }

// Épreuves visibles, dans l'ordre fixe d'affichage (ACC-14, ACC-16) : cartes de
// l'accueil et chiffres clés.
export function visibleRaces(content: PublishedContent): VisibleRace[] {
  return races
    .map(race => ({ ...content[`race.${race.slug}`], slug: race.slug }))
    .filter(race => race.visible)
}

// Nombre écrit à la française (« 13,5 », « 1 900 »).
export const frenchNumber = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 1 })
