import { z } from 'zod'
import { homeAnchors, infosAnchors, races } from './site'

// Types de champs communs aux schémas des blocs (spec 05).
//
// Chaque champ a une valeur par défaut (CNT-30) : un contenu enregistré avant
// l'ajout d'un champ reste valide et reçoit cette valeur. Les limites de
// longueur (CNT-03) sont lisibles par `z.toJSONSchema()` pour les formulaires.

// Texte court facultatif (vide = non affiché).
export function text(max: number, fallback = '') {
  return z.string().trim().max(max).default(fallback)
}

// Texte court obligatoire, avec une valeur par défaut générique.
export function requiredText(max: number, fallback: string) {
  return z.string().trim().min(1, 'Ce champ est obligatoire').max(max).default(fallback)
}

// Texte mis en forme, en HTML (assaini par l'assainisseur partagé, CNT-06).
export function richText(max = 10_000) {
  return z.string().max(max).default('')
}

// Lien externe : https:// ou mailto: uniquement (CNT-04).
function isExternalUrl(value: string): boolean {
  let url: URL
  try {
    url = new URL(value)
  }
  catch {
    return false
  }
  if (url.protocol === 'https:') return /^https:\/\/[^/]/i.test(value)
  if (url.protocol === 'mailto:') return z.email().safeParse(decodeURIComponent(url.pathname)).success
  return false
}

const externalUrlMessage = 'Le lien doit commencer par https:// ou mailto:'

const filledExternalUrl = z.string().trim().max(500).refine(isExternalUrl, externalUrlMessage)

// Lien externe facultatif (vide = bouton ou lien masqué).
export const externalUrl = z.union([z.literal(''), filledExternalUrl], { error: externalUrlMessage }).default('')

// Chemin d'un fichier servi par le site (/uploads/…, contenu de démo) : jamais
// d'URL externe ni de schéma comme javascript:. Vide = pas de fichier.
export const localPath = z.string()
  .regex(/^(\/(?!\/)[^\s\\]*)?$/, 'Le fichier doit être déposé sur le site')
  .default('')

// Image porteuse d'information, avec son texte alternatif.
export const image = z.object({
  src: localPath,
  alt: text(150),
}).prefault({})

// Image décorative : pas de texte alternatif (alt="" au rendu).
export const decorativeImage = z.object({
  src: localPath,
}).prefault({})

// Fichier à télécharger (GPX, PDF), avec sa taille en octets (INF-09).
export const file = z.object({
  src: localPath,
  size: z.number().int().nonnegative().default(0),
}).prefault({})

// Destination d'un lien du menu (SOC-02) : une section de l'accueil, la page
// Infos pratiques ou une de ses sections, une épreuve, ou un lien externe.
export const internalTargets = [
  ...homeAnchors.map(anchor => `/#${anchor}`),
  '/infos-pratiques',
  ...infosAnchors.map(anchor => `/infos-pratiques#${anchor}`),
  ...races.map(race => `/epreuves/${race.slug}`),
]

export const menuTarget = z.union([z.enum(internalTargets), filledExternalUrl], { error: 'Destination inconnue' })

// Titre et description pour les moteurs de recherche (SOC-21). Vides, ils sont
// construits à partir du nom de l'événement.
export const seo = z.object({
  title: text(70),
  description: text(160),
}).prefault({})
