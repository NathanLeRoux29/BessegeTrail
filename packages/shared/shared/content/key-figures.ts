import type { PublishedContent } from './blocks'
import { races } from './site'

export interface KeyFigure {
  value: string
  label: string
}

const number = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 1 })

// Plus grande valeur renseignée, ou null si aucune ne l'est.
function max(values: (number | null)[]): number | null {
  const known = values.filter(value => value !== null)
  return known.length ? Math.max(...known) : null
}

// Bandeau sous la bannière (ACC-35), calculé à partir des épreuves visibles et
// des paramètres : rien à saisir. Un chiffre inconnu n'est pas affiché ; sans
// épreuve visible, le bandeau est vide.
export function keyFigures(content: PublishedContent): KeyFigure[] {
  const visible = races.map(race => content[`race.${race.slug}`]).filter(race => race.visible)
  if (!visible.length) return []

  const figures: KeyFigure[] = [{ value: String(visible.length), label: visible.length > 1 ? 'épreuves' : 'épreuve' }]
  const distance = max(visible.map(race => race.distance))
  if (distance !== null) figures.push({ value: `${number.format(distance)} km`, label: 'le plus long' })
  const elevationGain = max(visible.map(race => race.elevationGain))
  if (elevationGain !== null) figures.push({ value: `${number.format(elevationGain)} m`, label: 'de dénivelé positif' })

  // « 1re édition » : le premier mot en grand, le reste en libellé.
  const [edition, ...words] = content.settings.edition.split(' ')
  if (edition) figures.push({ value: edition, label: words.join(' ') || 'édition' })
  return figures
}
