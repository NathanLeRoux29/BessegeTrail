// Génère les fichiers du contenu de démo dans public/demo (CNT-16). Lancé une
// fois à la main ; seul le résultat est versionné.
//
//   node packages/shared/scripts/demo-files.ts <dossier des photos originales>
//
// Le dossier contient une photo JPEG par nom utilisé dans shared/content/demo
// (banniere.jpg, galerie-1.jpg…), téléchargée depuis la source indiquée dans
// public/demo/CREDITS.md. Tracés, profils et logos viennent des maquettes.
// Affiche à la fin la taille des fichiers à reporter dans le contenu de démo.

import { copyFileSync, mkdirSync, readdirSync, statSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import sharp from 'sharp'

const photosDir = process.argv[2]
if (!photosDir) throw new Error('Usage : node packages/shared/scripts/demo-files.ts <dossier des photos>')

const root = new URL('..', import.meta.url).pathname
const mockups = new URL('../../../docs/maquettes/assets/img/', import.meta.url).pathname
const out = join(root, 'public/demo')
const widths = [480, 960, 1600]

for (const dir of ['images', 'logos', 'fichiers']) mkdirSync(join(out, dir), { recursive: true })

// Photos : WebP 3:2, recadrées sur la zone la plus intéressante, sans métadonnées
// (sharp ne les recopie pas).
for (const file of readdirSync(photosDir).filter(name => name.endsWith('.jpg'))) {
  const name = file.replace(/\.jpg$/, '')
  for (const width of widths) {
    await sharp(join(photosDir, file))
      .rotate()
      .resize(width, Math.round(width * 2 / 3), { fit: 'cover', position: sharp.strategy.attention })
      .webp({ quality: 70 })
      .toFile(join(out, 'images', `${name}-${width}.webp`))
  }
}

// Tracés et profils des épreuves : SVG des maquettes, en WebP.
for (const file of readdirSync(mockups).filter(name => /^(trace|profil)-.*\.svg$/.test(name))) {
  const name = file.replace(/\.svg$/, '')
  for (const width of widths) {
    await sharp(join(mockups, file), { density: 300 })
      .resize(width)
      .webp({ quality: 80 })
      .toFile(join(out, 'images', `${name}-${width}.webp`))
  }
}

// Logos : SVG des maquettes, tels quels (CNT-20).
for (const file of readdirSync(mockups).filter(name => /^(logo|partenaire-\d)\.svg$/.test(name))) {
  copyFileSync(join(mockups, file), join(out, 'logos', file))
}

// GPX fictifs : une boucle autour de Bessèges, de la longueur et du dénivelé de
// chaque épreuve, un point tous les 100 m environ.
const races = [
  { slug: 'trail-40', name: 'La Cévenole', distance: 40, elevationGain: 1900 },
  { slug: 'trail-20', name: 'La Cézarenque', distance: 20, elevationGain: 950 },
  { slug: 'trail-13', name: 'La Bességeoise', distance: 13, elevationGain: 550 },
  { slug: 'randonnee', name: 'Randonnée des châtaigniers', distance: 12, elevationGain: 400 },
  { slug: 'marche-solidaire', name: 'Marche solidaire', distance: 6, elevationGain: 120 },
]
const start = { lat: 44.2925, lon: 4.0975, ele: 160 }

// Boucle irrégulière de rayon moyen `radius` (km), en coordonnées locales.
function loop(radius: number, angle: number) {
  const r = radius * (1 + 0.25 * Math.sin(3 * angle) + 0.1 * Math.sin(7 * angle))
  return { x: r * Math.cos(angle), y: r * Math.sin(angle) }
}

for (const [index, race] of races.entries()) {
  const points = race.distance * 10
  const radius = race.distance / (2 * Math.PI)
  const climbs = Math.max(1, Math.round(race.distance / 8))
  // Chaque boucle part dans une direction différente et revient à Bessèges.
  const origin = loop(radius, index)
  const lines: string[] = []
  for (let i = 0; i <= points; i++) {
    const t = i / points
    const { x, y } = loop(radius, index + 2 * Math.PI * t)
    const lat = start.lat + (y - origin.y) / 111.2
    const lon = start.lon + (x - origin.x) / (111.2 * Math.cos(start.lat * Math.PI / 180))
    const ele = start.ele + (race.elevationGain / climbs) * (1 - Math.cos(2 * Math.PI * climbs * t)) / 2
    lines.push(`      <trkpt lat="${lat.toFixed(6)}" lon="${lon.toFixed(6)}"><ele>${ele.toFixed(1)}</ele></trkpt>`)
  }
  writeFileSync(join(out, 'fichiers', `${race.slug}.gpx`), `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="Trail de Bessèges, contenu de démonstration" xmlns="http://www.topografix.com/GPX/1/1">
  <metadata><name>${race.name} (tracé fictif)</name></metadata>
  <trk>
    <name>${race.name} (tracé fictif)</name>
    <trkseg>
${lines.join('\n')}
    </trkseg>
  </trk>
</gpx>
`)
}

// Règlement : PDF d'une page, écrit sans dépendance (police Helvetica, codage
// WinAnsi).
const rules = [
  'Règlement du Trail de Bessèges 2027',
  'Document d’exemple, remplacé par le règlement de l’association.',
  '',
  'Article 1 : organisation',
  'Le Trail de Bessèges est organisé par l’association Horizon Cévennes.',
  '',
  'Article 2 : épreuves',
  'Trails de 40, 20 et 13 km, randonnée de 12 km et marche solidaire de 6 km.',
  '',
  'Article 3 : certificat médical',
  'Un certificat médical ou une licence FFA est exigé pour les trails.',
  '',
  'Article 4 : sécurité',
  'Le matériel obligatoire de chaque épreuve peut être contrôlé au départ.',
  '',
  'Article 5 : environnement',
  'Tout abandon de déchet sur le parcours entraîne la disqualification.',
]
const winAnsi: Record<string, number> = { '’': 0x92, '€': 0x80, 'œ': 0x9C }
const encode = (text: string) => Buffer.from([...text].map(char => winAnsi[char] ?? char.charCodeAt(0)))
const escape = (text: Buffer) => Buffer.from(text.toString('latin1').replace(/[\\()]/g, '\\$&'), 'latin1')
const stream = Buffer.concat([
  Buffer.from('BT /F1 18 Tf 56 780 Td 22 TL\n'),
  ...rules.flatMap((line, i) => [
    Buffer.from(i === 1 ? '/F1 11 Tf\n' : ''),
    Buffer.from('('), escape(encode(line)), Buffer.from(') Tj T*\n'),
  ]),
  Buffer.from('ET\n'),
])
const objects = [
  Buffer.from('<< /Type /Catalog /Pages 2 0 R >>'),
  Buffer.from('<< /Type /Pages /Kids [3 0 R] /Count 1 >>'),
  Buffer.from('<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>'),
  Buffer.from('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>'),
  Buffer.concat([Buffer.from(`<< /Length ${stream.length} >>\nstream\n`), stream, Buffer.from('endstream')]),
]
const parts = [Buffer.from('%PDF-1.4\n')]
const offsets: number[] = []
for (const [i, object] of objects.entries()) {
  offsets.push(Buffer.concat(parts).length)
  parts.push(Buffer.from(`${i + 1} 0 obj\n`), object, Buffer.from('\nendobj\n'))
}
const xref = Buffer.concat(parts).length
parts.push(Buffer.from(`xref\n0 ${objects.length + 1}\n0000000000 65535 f \n${offsets.map(offset => `${String(offset).padStart(10, '0')} 00000 n \n`).join('')}`
  + `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`))
writeFileSync(join(out, 'fichiers', 'reglement-trail-besseges-2027.pdf'), Buffer.concat(parts))

for (const file of readdirSync(join(out, 'fichiers'))) {
  console.log(`${file} : ${statSync(join(out, 'fichiers', file)).size} octets`)
}
console.log(`Total : ${readdirSync(join(out, 'images')).reduce((sum, file) => sum + statSync(join(out, 'images', file)).size, 0)} octets d’images`)
