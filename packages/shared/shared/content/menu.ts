import type { BlockKey, PublishedContent } from './blocks'
import { internalTargets } from './fields'
import { isSectionShown } from './sections'

// Bloc affiché par une cible interne du menu : section de l'accueil (/#galerie),
// section des Infos pratiques (/infos-pratiques#faq) ou page d'épreuve
// (/epreuves/trail-40). La page Infos pratiques elle-même n'a pas de bloc
// masquable.
const targetPatterns = [
  [/^\/#(.+)$/, 'home'],
  [/^\/infos-pratiques#(.+)$/, 'infos'],
  [/^\/epreuves\/(.+)$/, 'race'],
] as const

function targetBlock(target: string): BlockKey | undefined {
  for (const [pattern, prefix] of targetPatterns) {
    const match = pattern.exec(target)
    if (match) return `${prefix}.${match[1]}` as BlockKey
  }
  return undefined
}

// Cibles du menu qui mènent à une section ou une épreuve masquée (SOC-03), ou à
// une section de liste vide, qui n'est pas rendue (ACC-04) : les éléments du menu
// qui les visent ne sont pas affichés. Calculé à partir du contenu publié sur le
// site, des brouillons dans l'aperçu de l'admin.
export function hiddenMenuTargets(content: PublishedContent): string[] {
  return internalTargets.filter((target) => {
    const key = targetBlock(target)
    return key !== undefined && !isSectionShown(key, content)
  })
}
