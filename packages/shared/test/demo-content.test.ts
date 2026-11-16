import { existsSync, readFileSync, statSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'
import { describe, expect, it } from 'vitest'
import { blockKeys, blockSchemas, type BlockContent } from '../shared/content/blocks'
import { demoContent } from '../shared/content/demo'

// Fichiers de démo servis par les deux apps (dossier public du layer).
const publicDir = fileURLToPath(new URL('../public', import.meta.url))

const parsed = blockKeys.map(key => ({ key, content: blockSchemas[key].parse(demoContent[key]) as Record<string, unknown> }))

// Parcourt un contenu et renvoie chaque objet rencontré, avec sa clé de bloc.
function objects(value: unknown): Record<string, unknown>[] {
  if (Array.isArray(value)) return value.flatMap(objects)
  if (value && typeof value === 'object') {
    const object = value as Record<string, unknown>
    return [object, ...Object.values(object).flatMap(objects)]
  }
  return []
}

const allObjects = parsed.flatMap(({ key, content }) => objects(content).map(object => ({ key, object })))

// Chemins de fichiers locaux : `src` des images et fichiers, `logo` des partenaires.
const localFiles = allObjects.flatMap(({ key, object }) =>
  ['src', 'logo'].filter(field => typeof object[field] === 'string' && object[field] !== '').map(field => ({ key, path: object[field] as string })))

describe('contenu de démonstration', () => {
  it('CNT-17 : chaque clé de bloc a un contenu de démo', () => {
    expect(Object.keys(demoContent).sort()).toEqual([...blockKeys].sort())
  })

  it.each(blockKeys)('CNT-17 : la démo de %s passe le schéma du bloc', (key) => {
    const result = blockSchemas[key].safeParse(demoContent[key])

    expect(result.error?.issues ?? []).toEqual([])
  })

  it('CNT-16 : toutes les sections masquables sont visibles', () => {
    const hidden = parsed.filter(({ content }) => content.visible === false).map(({ key }) => key)

    expect(hidden).toEqual([])
  })

  it('CNT-16 : chaque épreuve a ses chiffres, son image, son tracé, son profil et son GPX', () => {
    const races = parsed.filter(({ key }) => key.startsWith('race.')).map(({ content }) => content as BlockContent<'race.trail-40'>)

    expect(races).toHaveLength(5)
    for (const race of races) {
      expect(race.distance).toBeGreaterThan(0)
      expect(race.elevationGain).toBeGreaterThan(0)
      expect([race.image.src, race.route.src, race.profile.src, race.gpx.src]).not.toContain('')
    }
  })

  it('CNT-16 : chaque fichier référencé existe dans le dossier de démo', () => {
    const missing = localFiles.filter(({ path }) => !path.startsWith('/demo/') || !existsSync(publicDir + path))

    expect(localFiles.length).toBeGreaterThan(30)
    expect(missing).toEqual([])
  })

  it('SOC-12 : chaque photo existe en WebP en 480, 960 et 1600 px de large', () => {
    const photos = localFiles.filter(({ path }) => path.endsWith('.webp'))
    const incomplete = photos.filter(({ path }) => !path.endsWith('-960.webp')
      || !['480', '1600'].every(width => existsSync(publicDir + path.replace(/-960\.webp$/, `-${width}.webp`))))

    expect(photos.length).toBeGreaterThan(20)
    expect(incomplete).toEqual([])
  })

  it('SOC-12 : chaque photo indique les dimensions de sa version de 1600 px', async () => {
    const photos = allObjects.map(({ object }) => object).filter(object => typeof object.src === 'string' && object.src.endsWith('.webp'))
    const wrong: string[] = []
    for (const photo of photos) {
      const { width, height } = await sharp(publicDir + (photo.src as string).replace(/-960\.webp$/, '-1600.webp')).metadata()
      if (photo.width !== width || photo.height !== height) wrong.push(`${photo.src as string} : ${String(photo.width)}×${String(photo.height)} au lieu de ${width}×${height}`)
    }

    expect(photos.length).toBeGreaterThan(20)
    expect(wrong).toEqual([])
  })

  it('CNT-24 : chaque image porteuse d’information a un texte alternatif', () => {
    const withoutAlt = allObjects.filter(({ object }) => 'alt' in object && object.src !== '' && object.alt === '')

    expect(withoutAlt).toEqual([])
  })

  it('INF-09 : la taille indiquée de chaque fichier à télécharger est exacte', () => {
    const files = allObjects.filter(({ object }) => 'size' in object).map(({ object }) => object as { src: string, size: number })
    const wrong = files.filter(({ src, size }) => !existsSync(publicDir + src) || statSync(publicDir + src).size !== size)

    expect(files).toHaveLength(6)
    expect(wrong).toEqual([])
  })

  it('CNT-22 : chaque GPX de démo est un fichier GPX avec un tracé', () => {
    const gpx = localFiles.filter(({ path }) => path.endsWith('.gpx'))
    const invalid = gpx.filter(({ path }) => {
      const xml = readFileSync(publicDir + path, 'utf8')
      return !/^<\?xml [^>]*\?>\s*<gpx [^>]*xmlns="http:\/\/www\.topografix\.com\/GPX\/1\/1"/.test(xml)
        || !/<trkpt lat="[\d.]+" lon="[\d.]+">/.test(xml) || !xml.trimEnd().endsWith('</gpx>')
    })

    expect(gpx).toHaveLength(5)
    expect(invalid).toEqual([])
  })

  it('CNT-21 : le règlement de démo est un PDF', () => {
    const pdf = localFiles.filter(({ path }) => path.endsWith('.pdf'))

    expect(pdf).toHaveLength(1)
    expect(readFileSync(publicDir + pdf[0]!.path).subarray(0, 5).toString()).toBe('%PDF-')
  })
})
