import type { PublishedContent } from '#bessege/content/blocks'

// Contenu publié de tous les blocs (CNT-08), pour les pages et le layout du site.
// Les composants de section le reçoivent par props : l'aperçu de l'admin leur
// passe les brouillons à la place.
export function usePublishedContent() {
  return useFetch<PublishedContent>('/api/content', { key: 'published-content' })
}
