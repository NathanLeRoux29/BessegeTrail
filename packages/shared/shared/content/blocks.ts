import { z } from 'zod'
import { decorativeImage, externalUrl, file, image, localPath, menuTarget, requiredText, richText, seo, text } from './fields'
import { races } from './site'

// Un schéma par bloc de contenu (spec 05, CNT-01) : l'admin valide avec, le site
// type son rendu avec. Limites et libellés repris de la maquette de l'éditeur.
//
// Ajouter un champ : toujours avec une valeur par défaut (CNT-30). Renommer,
// déplacer ou supprimer : migration de contenu (CNT-31).

// Section masquable : arrive masquée tant qu'elle n'est pas publiée (CNT-30).
const visible = z.boolean().default(false)

// Bouton vers un lien externe. Lien vide : lien d'inscription général pour les
// boutons « S'inscrire », bouton masqué sinon.
function button(label: string, max: number) {
  return z.object({ label: requiredText(max, label), url: externalUrl }).prefault({})
}

// Éléments communs

const settings = z.object({
  eventName: requiredText(60, 'Trail de Bessèges'),
  edition: text(30),
  place: text(60),
  // Date et heure du premier départ, heure de Paris (compte à rebours, ACC-07).
  startDate: z.union([z.literal(''), z.iso.datetime({ local: true, precision: -1 })]).default(''),
  dateLabel: text(40),
  email: z.union([z.literal(''), z.email('Adresse e-mail invalide').max(254)]).default(''),
  registerUrl: externalUrl,
  socials: z.object({
    facebook: externalUrl,
    instagram: externalUrl,
    strava: externalUrl,
    youtube: externalUrl,
  }).prefault({}),
  // Référencement de l'accueil, et valeurs par défaut des autres pages.
  seo,
})

const header = z.object({
  logo: image,
  title: requiredText(40, 'Trail de Bessèges'),
  menu: z.array(z.object({
    label: requiredText(25, 'Lien'),
    target: menuTarget,
  })).max(8).default([]),
  cta: button('S’inscrire', 20),
})

const footer = z.object({
  association: text(80),
  text: text(120),
})

// Accueil (spec 02)

const hero = z.object({
  image: decorativeImage,
  subtitle: text(200),
  cta: button('S’inscrire', 30),
  showCountdown: z.boolean().default(true),
  afterText: requiredText(80, 'Merci à tous, rendez-vous l’an prochain !'),
})

const presentation = z.object({
  visible,
  title: requiredText(80, 'Présentation'),
  text: richText(),
  image,
})

const homeRaces = z.object({
  title: requiredText(80, 'Les épreuves'),
  intro: text(200),
})

const gallery = z.object({
  visible,
  title: requiredText(80, 'Galerie'),
  photos: z.array(image).max(30).default([]),
})

const volunteers = z.object({
  visible,
  title: requiredText(80, 'Bénévoles'),
  text: richText(),
  image,
  button: button('Je deviens bénévole', 30),
})

const partners = z.object({
  visible,
  title: requiredText(80, 'Partenaires'),
  items: z.array(z.object({
    // Sert aussi de texte alternatif du logo (ACC-28).
    name: requiredText(60, 'Partenaire'),
    logo: localPath,
    url: externalUrl,
  })).max(40).default([]),
})

const contact = z.object({
  visible,
  title: requiredText(80, 'Contact'),
  text: text(240),
})

// Infos pratiques (spec 10)

const infosPage = z.object({
  title: requiredText(60, 'Infos pratiques'),
  intro: text(240),
  seo,
})

export const infoIcons = ['lieu', 'parking', 'dossard', 'horaire', 'douche', 'restauration', 'info'] as const

const practical = z.object({
  visible,
  title: requiredText(80, 'Sur place'),
  items: z.array(z.object({
    icon: z.enum(infoIcons).default('info'),
    title: requiredText(40, 'Information'),
    text: text(200),
  })).max(9).default([]),
  address: text(120),
  mapUrl: externalUrl,
  rules: file,
})

const faq = z.object({
  visible,
  title: requiredText(80, 'Questions fréquentes'),
  items: z.array(z.object({
    question: requiredText(120, 'Question'),
    answer: richText(),
  })).max(30).default([]),
})

// Épreuves (spec 03) : même schéma, nom et type par défaut propres à chacune.

function race(defaults: typeof races[number]) {
  return z.object({
    visible,
    name: requiredText(40, defaults.name),
    type: z.enum(['Trail', 'Randonnée', 'Marche']).default(defaults.type),
    start: text(40),
    // Vide : chiffre clé non affiché (EPR-02).
    distance: z.number().positive().max(200).nullable().default(null),
    elevationGain: z.number().int().nonnegative().max(10_000).nullable().default(null),
    price: text(80),
    image: decorativeImage,
    description: richText(),
    extra: richText(),
    route: image,
    profile: image,
    gpx: file,
    registerUrl: externalUrl,
    resultsUrl: externalUrl,
    seo,
  })
}

// Pages légales (spec 01, SOC-08)

function legalPage(title: string) {
  return z.object({
    title: requiredText(80, title),
    text: richText(50_000),
    seo,
  })
}

export const blockSchemas = {
  'settings': settings,
  'header': header,
  'footer': footer,
  'home.hero': hero,
  'home.presentation': presentation,
  'home.epreuves': homeRaces,
  'home.galerie': gallery,
  'home.benevoles': volunteers,
  'home.partenaires': partners,
  'home.contact': contact,
  'infos.page': infosPage,
  'infos.pratiques': practical,
  'infos.faq': faq,
  'race.trail-40': race(races[0]),
  'race.trail-20': race(races[1]),
  'race.trail-13': race(races[2]),
  'race.randonnee': race(races[3]),
  'race.marche-solidaire': race(races[4]),
  'page.mentions-legales': legalPage('Mentions légales'),
  'page.confidentialite': legalPage('Politique de confidentialité'),
}

export type BlockKey = keyof typeof blockSchemas

// Contenu validé d'un bloc, pour typer le rendu sur le site.
export type BlockContent<K extends BlockKey> = z.output<typeof blockSchemas[K]>

export const blockKeys = Object.keys(blockSchemas) as BlockKey[]

// Contenu publié de tous les blocs, tel que le site le lit (CNT-08).
export type PublishedContent = { [K in BlockKey]: BlockContent<K> }
