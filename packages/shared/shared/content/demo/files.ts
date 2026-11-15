// Fichiers du contenu de démo, servis par les deux apps depuis le dossier
// public du layer (packages/shared/public/demo). Crédits des photos :
// public/demo/CREDITS.md.

// Image en WebP, déclinée en 480, 960 et 1600 px de large : `src` désigne la
// version 960, les autres s'en déduisent (SOC-12).
export function photo(name: string): string {
  return `/demo/images/${name}-960.webp`
}

export function logo(name: string): string {
  return `/demo/logos/${name}.svg`
}

// Fichier à télécharger, avec sa taille en octets (INF-09), vérifiée par un test.
export function download(name: string, size: number) {
  return { src: `/demo/fichiers/${name}`, size }
}
