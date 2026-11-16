import { blockKeys, blockSchemas, type PublishedContent } from '../shared/content/blocks'
import { demoContent } from '../shared/content/demo'

// Contenu publié complet (celui de la démo : tout est visible, les listes sont
// remplies), avec les blocs de `hidden` masqués et `overrides` appliqués.
export function contentWith(hidden: string[] = [], overrides: Partial<Record<string, object>> = {}): PublishedContent {
  return Object.fromEntries(blockKeys.map((key) => {
    const block = { ...blockSchemas[key].parse(demoContent[key]) as Record<string, unknown>, ...overrides[key] }
    return [key, 'visible' in block ? { ...block, visible: !hidden.includes(key) } : block]
  })) as PublishedContent
}
