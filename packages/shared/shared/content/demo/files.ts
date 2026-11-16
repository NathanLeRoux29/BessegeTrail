// Fichiers du contenu de démo, servis par les deux apps depuis le dossier
// public du layer (packages/shared/public/demo). Crédits des photos :
// public/demo/CREDITS.md.

// Image en WebP, déclinée en 480, 960 et 1600 px de large : `src` désigne la
// version 960, les autres s'en déduisent. Dimensions de la version 1600 (SOC-12),
// vérifiées par un test : photos en 3:2 par défaut.
export function photo(name: string, height = 1067) {
  return { src: `/demo/images/${name}-960.webp`, width: 1600, height }
}

export function logo(name: string): string {
  return `/demo/logos/${name}.svg`
}

// Fichier à télécharger, avec sa taille en octets (INF-09), vérifiée par un test.
export function download(name: string, size: number) {
  return { src: `/demo/fichiers/${name}`, size }
}
