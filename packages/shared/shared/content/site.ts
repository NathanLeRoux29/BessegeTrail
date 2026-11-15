// Pages et sections fixes du site public (specs 02, 03 et 10).

// Les cinq épreuves, dans l'ordre d'affichage (ACC-14). URL : /epreuves/<slug>.
export const races = [
  { slug: 'trail-40', name: 'Trail 40 km', type: 'Trail' },
  { slug: 'trail-20', name: 'Trail 20 km', type: 'Trail' },
  { slug: 'trail-13', name: 'Trail 13 km', type: 'Trail' },
  { slug: 'randonnee', name: 'Randonnée', type: 'Randonnée' },
  { slug: 'marche-solidaire', name: 'Marche solidaire', type: 'Marche' },
] as const

export type RaceSlug = typeof races[number]['slug']

// Ancres des sections de l'accueil vers lesquelles le menu peut pointer.
export const homeAnchors = ['presentation', 'epreuves', 'galerie', 'benevoles', 'partenaires', 'contact'] as const

// Ancres des sections de la page Infos pratiques.
export const infosAnchors = ['pratiques', 'faq'] as const
