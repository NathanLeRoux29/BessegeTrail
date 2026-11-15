import { describe, expect, it } from 'vitest'
import { externalUrl, file, image, localPath, menuTarget } from '../shared/content/fields'

describe('lien externe (CNT-04)', () => {
  it.each([
    'https://www.example-inscriptions.fr/trail-besseges-2027',
    'https://exemple.fr',
    'HTTPS://exemple.fr/majuscules',
    'mailto:contact@trail-besseges.fr',
    'mailto:contact@trail-besseges.fr?subject=Inscription',
  ])('CNT-04 : accepte %s', (url) => {
    expect(externalUrl.safeParse(url).success).toBe(true)
  })

  it('CNT-04 : accepte un lien vide (champ non renseigné)', () => {
    expect(externalUrl.parse('')).toBe('')
  })

  it('CNT-04 : retire les espaces autour du lien', () => {
    expect(externalUrl.parse('  https://exemple.fr  ')).toBe('https://exemple.fr')
  })

  it.each([
    'javascript:alert(1)',
    'JavaScript:alert(1)',
    '  javascript:alert(1)',
    'http://exemple.fr',
    'data:text/html,<script>alert(1)</script>',
    '//exemple.fr',
    'https://',
    'https:exemple.fr',
    'ftp://exemple.fr',
    'exemple.fr',
    '/epreuves/trail-40',
    'mailto:pas-une-adresse',
  ])('CNT-04 : refuse %s', (url) => {
    const result = externalUrl.safeParse(url)

    expect(result.success).toBe(false)
    expect(result.error?.issues[0]?.message).toBe('Le lien doit commencer par https:// ou mailto:')
  })

  it('CNT-04 : refuse un lien de plus de 500 caractères', () => {
    expect(externalUrl.safeParse(`https://exemple.fr/${'a'.repeat(482)}`).success).toBe(false)
  })
})

describe('chemin d’un fichier du site (images, GPX, PDF)', () => {
  it.each(['', '/uploads/3f2a9c.webp', '/demo/banniere.webp'])('accepte « %s »', (path) => {
    expect(localPath.safeParse(path).success).toBe(true)
  })

  it.each([
    'https://exemple.fr/photo.jpg',
    '//exemple.fr/photo.jpg',
    'javascript:alert(1)',
    'uploads/photo.webp',
    '/uploads/ma photo.webp',
    '/uploads\\photo.webp',
  ])('refuse « %s »', (path) => {
    expect(localPath.safeParse(path).success).toBe(false)
  })

  it('une image sans valeur est complétée par une source et un texte alternatif vides', () => {
    expect(image.parse(undefined)).toEqual({ src: '', alt: '' })
  })

  it('une image dont la source n’est pas un chemin du site est refusée', () => {
    expect(image.safeParse({ src: 'https://exemple.fr/photo.jpg', alt: 'Départ' }).success).toBe(false)
  })

  it('un fichier garde sa taille, pour afficher « PDF, x Mo » (INF-09)', () => {
    expect(file.parse({ src: '/uploads/reglement.pdf', size: 1_200_000 })).toEqual({ src: '/uploads/reglement.pdf', size: 1_200_000 })
    expect(file.safeParse({ src: '/uploads/reglement.pdf', size: -1 }).success).toBe(false)
  })
})

describe('destination d’un lien du menu (SOC-02)', () => {
  it.each([
    '/#presentation',
    '/#contact',
    '/infos-pratiques',
    '/infos-pratiques#faq',
    '/epreuves/trail-40',
    '/epreuves/marche-solidaire',
    'https://www.facebook.com/trailbesseges',
  ])('SOC-02 : accepte %s', (target) => {
    expect(menuTarget.safeParse(target).success).toBe(true)
  })

  it.each([
    '',
    '/admin',
    '/#inconnue',
    '/epreuves/trail-50',
    'javascript:alert(1)',
    'http://exemple.fr',
  ])('SOC-02 : refuse « %s »', (target) => {
    expect(menuTarget.safeParse(target).success).toBe(false)
  })
})
