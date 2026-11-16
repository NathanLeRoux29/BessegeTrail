import type { BlockKey, PublishedContent } from './blocks'
import { homeAnchors, infosAnchors } from './site'

// Sections de l'accueil et de la page Infos pratiques, dans l'ordre fixe
// d'affichage (spec 02, spec 10). La clé de bloc se termine par l'ancre.
export const homeSectionKeys = homeAnchors.map(anchor => `home.${anchor}` as const)
export const infosSectionKeys = infosAnchors.map(anchor => `infos.${anchor}` as const)

// Sections de liste : vides, elles ne sont pas rendues, même visibles (ACC-04).
const listFields: Partial<Record<BlockKey, string>> = {
  'home.galerie': 'photos',
  'home.partenaires': 'items',
  'infos.faq': 'items',
}

// Une section est rendue si elle n'est pas masquée (ACC-01) et, pour une section
// de liste, si la liste n'est pas vide (ACC-04). Sert aussi au menu (SOC-03).
export function isSectionShown(key: BlockKey, content: PublishedContent): boolean {
  const block = content[key] as Record<string, unknown>
  if (block.visible === false) return false
  const list = listFields[key]
  return !list || (block[list] as unknown[]).length > 0
}

// Fond d'une section, nommé d'après son jeton de couleur : blanc cassé ou sable.
export type SectionBackground = 'background' | 'neutral'

export interface ShownSection<K extends BlockKey> {
  key: K
  anchor: string
  background: SectionBackground
}

// Sections à rendre, dans l'ordre, avec leur ancre (ACC-03) et leur fond, qui
// alterne parmi les sections rendues seulement (ACC-02).
export function shownSections<K extends BlockKey>(keys: readonly K[], content: PublishedContent): ShownSection<K>[] {
  return keys
    .filter(key => isSectionShown(key, content))
    .map((key, index) => ({
      key,
      anchor: key.slice(key.indexOf('.') + 1),
      background: index % 2 === 0 ? 'background' : 'neutral',
    }))
}
