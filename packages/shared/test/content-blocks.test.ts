import { describe, expect, it } from 'vitest'
import { z } from 'zod'
import { blockKeys, blockSchemas } from '../shared/content/blocks'

// Clés du modèle de contenu (spec 05, tableau « Modèle de contenu »).
const specKeys = [
  'settings', 'header', 'footer',
  'home.hero', 'home.presentation', 'home.epreuves', 'home.galerie', 'home.benevoles', 'home.partenaires', 'home.contact',
  'infos.page', 'infos.pratiques', 'infos.faq',
  'race.trail-40', 'race.trail-20', 'race.trail-13', 'race.randonnee', 'race.marche-solidaire',
  'page.mentions-legales', 'page.confidentialite',
]

interface JsonSchema {
  properties: Record<string, JsonSchema>
  items: JsonSchema
  maxLength?: number
  maxItems?: number
}

function jsonSchema(key: string) {
  return z.toJSONSchema(blockSchemas[key as keyof typeof blockSchemas], { io: 'input' }) as unknown as JsonSchema
}

describe('schémas des blocs de contenu', () => {
  it('CNT-01 : chaque clé du modèle de contenu a un schéma, et il n’y a aucune clé en trop', () => {
    expect([...blockKeys].sort()).toEqual([...specKeys].sort())
    for (const key of blockKeys) expect(blockSchemas[key]).toBeInstanceOf(z.ZodObject)
  })

  describe('limites de longueur (CNT-03)', () => {
    it('CNT-03 : un titre de section de 80 caractères est accepté, 81 refusé', () => {
      const schema = blockSchemas['home.presentation']

      expect(schema.safeParse({ title: 'a'.repeat(80) }).success).toBe(true)
      expect(schema.safeParse({ title: 'a'.repeat(81) }).success).toBe(false)
    })

    it('CNT-03 : une meta description de 160 caractères est acceptée, 161 refusée', () => {
      for (const key of ['settings', 'infos.page', 'race.trail-40', 'page.mentions-legales'] as const) {
        expect(blockSchemas[key].safeParse({ seo: { description: 'a'.repeat(160) } }).success, key).toBe(true)
        expect(blockSchemas[key].safeParse({ seo: { description: 'a'.repeat(161) } }).success, key).toBe(false)
      }
    })

    it('CNT-03 : un titre obligatoire vide est refusé', () => {
      expect(blockSchemas['home.presentation'].safeParse({ title: '   ' }).success).toBe(false)
    })

    it('ACC-23 : la galerie accepte jusqu’à 30 photos, pas une de plus', () => {
      const photos = (n: number) => Array.from({ length: n }, (_, i) => ({ src: `/uploads/${i}-960.webp`, alt: `Photo ${i}` }))

      expect(blockSchemas['home.galerie'].safeParse({ photos: photos(30) }).success).toBe(true)
      expect(blockSchemas['home.galerie'].safeParse({ photos: photos(31) }).success).toBe(false)
    })

    it('CNT-03 : la galerie refuse une 31e photo, la FAQ une 31e question et Sur place un 10e bloc', () => {
      const photos = (n: number) => Array.from({ length: n }, (_, i) => ({ src: `/uploads/${i}.webp`, alt: `Photo ${i}` }))
      const questions = (n: number) => Array.from({ length: n }, (_, i) => ({ question: `Question ${i} ?`, answer: '<p>Oui.</p>' }))
      const infos = (n: number) => Array.from({ length: n }, (_, i) => ({ icon: 'info', title: `Info ${i}` }))

      expect(blockSchemas['home.galerie'].safeParse({ photos: photos(30) }).success).toBe(true)
      expect(blockSchemas['home.galerie'].safeParse({ photos: photos(31) }).success).toBe(false)
      expect(blockSchemas['infos.faq'].safeParse({ items: questions(30) }).success).toBe(true)
      expect(blockSchemas['infos.faq'].safeParse({ items: questions(31) }).success).toBe(false)
      expect(blockSchemas['infos.pratiques'].safeParse({ items: infos(9) }).success).toBe(true)
      expect(blockSchemas['infos.pratiques'].safeParse({ items: infos(10) }).success).toBe(false)
    })

    it('CNT-03 : les limites sont lisibles dans le JSON Schema, pour l’affichage dans les formulaires', () => {
      expect(jsonSchema('home.presentation').properties.title.maxLength).toBe(80)
      expect(jsonSchema('settings').properties.seo.properties.description.maxLength).toBe(160)
      expect(jsonSchema('home.galerie').properties.photos.maxItems).toBe(30)
      expect(jsonSchema('header').properties.menu.items.properties.label.maxLength).toBe(25)
    })
  })

  describe('liens externes (CNT-04)', () => {
    const bad = 'javascript:alert(1)'
    const cases: [string, Record<string, unknown>][] = [
      ['settings', { registerUrl: bad }],
      ['settings', { socials: { instagram: bad } }],
      ['header', { cta: { url: bad } }],
      ['header', { menu: [{ label: 'Lien', target: bad }] }],
      ['home.hero', { cta: { url: bad } }],
      ['home.benevoles', { button: { url: bad } }],
      ['home.partenaires', { items: [{ name: 'Partenaire', url: bad }] }],
      ['infos.pratiques', { mapUrl: bad }],
      ['race.trail-40', { registerUrl: bad }],
      ['race.trail-40', { resultsUrl: bad }],
    ]

    it.each(cases)('CNT-04 : %s refuse javascript: dans %j', (key, input) => {
      expect(blockSchemas[key as keyof typeof blockSchemas].safeParse(input).success).toBe(false)
    })

    it.each(cases)('CNT-04 : %s accepte https:// à la même place que %j', (key, input) => {
      const valid = JSON.parse(JSON.stringify(input).replace(bad, 'https://exemple.fr'))

      expect(blockSchemas[key as keyof typeof blockSchemas].safeParse(valid).success).toBe(true)
    })
  })

  describe('valeurs par défaut (CNT-30)', () => {
    it.each(specKeys)('CNT-30 : le bloc %s vide est complété par ses valeurs par défaut et reste valide', (key) => {
      const schema = blockSchemas[key as keyof typeof blockSchemas]
      const filled = schema.parse({})

      expect(schema.safeParse(filled).success).toBe(true)
    })

    it('CNT-30 : une section masquable arrive masquée', () => {
      for (const key of ['home.presentation', 'home.galerie', 'home.benevoles', 'home.partenaires', 'home.contact', 'infos.pratiques', 'infos.faq', 'race.trail-40'] as const) {
        expect(blockSchemas[key].parse({}).visible, key).toBe(false)
      }
    })

    it('CNT-30 : un bloc sans un champ récent est complété par sa valeur par défaut, sans écraser les autres', () => {
      const stored = { visible: true, title: 'L’événement', text: '<p>Un trail au cœur des Cévennes.</p>' }

      expect(blockSchemas['home.presentation'].parse(stored)).toEqual({ ...stored, image: { src: '', alt: '', width: 0, height: 0 } })
    })

    it('CNT-30 : un groupe de champs absent est complété champ par champ', () => {
      expect(blockSchemas['settings'].parse({ socials: { instagram: 'https://instagram.com/trail' } }).socials)
        .toEqual({ facebook: '', instagram: 'https://instagram.com/trail', strava: '', youtube: '' })
    })

    it('les titres par défaut reprennent le nom de la section ou de l’épreuve', () => {
      expect(blockSchemas['home.galerie'].parse({}).title).toBe('Galerie')
      expect(blockSchemas['race.trail-40'].parse({}).name).toBe('Trail 40 km')
      expect(blockSchemas['race.randonnee'].parse({}).type).toBe('Randonnée')
      expect(blockSchemas['page.confidentialite'].parse({}).title).toBe('Politique de confidentialité')
    })
  })

  describe('champs particuliers', () => {
    it('EPR-02 : la distance et le dénivelé d’une épreuve peuvent rester vides', () => {
      expect(blockSchemas['race.trail-40'].parse({})).toMatchObject({ distance: null, elevationGain: null })
      expect(blockSchemas['race.trail-40'].safeParse({ distance: 40.5, elevationGain: 1800 }).success).toBe(true)
      expect(blockSchemas['race.trail-40'].safeParse({ distance: -1 }).success).toBe(false)
    })

    it('le type d’une épreuve est Trail, Randonnée ou Marche', () => {
      expect(blockSchemas['race.trail-40'].safeParse({ type: 'Course' }).success).toBe(false)
    })

    it('l’e-mail de contact est vide ou valide', () => {
      expect(blockSchemas['settings'].safeParse({ email: 'contact@trail-besseges.fr' }).success).toBe(true)
      expect(blockSchemas['settings'].safeParse({ email: 'pas-un-email' }).success).toBe(false)
    })

    it('ACC-07 : la date de départ est une date et une heure (heure de Paris), ou vide', () => {
      expect(blockSchemas['settings'].safeParse({ startDate: '2027-04-17T07:30' }).success).toBe(true)
      expect(blockSchemas['settings'].safeParse({ startDate: '17/04/2027' }).success).toBe(false)
      expect(blockSchemas['settings'].safeParse({ startDate: '2027-02-30T07:30' }).success).toBe(false)
    })

    it('INF-07 : l’icône d’un bloc Sur place est choisie dans la liste fixe', () => {
      expect(blockSchemas['infos.pratiques'].safeParse({ items: [{ icon: 'douche', title: 'Douches' }] }).success).toBe(true)
      expect(blockSchemas['infos.pratiques'].safeParse({ items: [{ icon: 'piscine', title: 'Piscine' }] }).success).toBe(false)
    })
  })
})
