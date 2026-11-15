import type { z } from 'zod'
import type { BlockKey, blockSchemas } from '../blocks'
import { footer, header, settings } from './common'
import { contact, gallery, hero, partners, presentation, races, volunteers } from './home'
import { faq, page, practical } from './infos'
import { legalNotice, privacy } from './legal'
import { charityWalk, hike, trail13, trail20, trail40 } from './races'

// Contenu de démonstration (CNT-16, CNT-17), repris des maquettes : chargé par
// l'admin au premier démarrage, puis remplacé par l'éditeur. Le typage oblige à
// fournir chaque bloc ; un test valide chacun avec son schéma.

export type DemoContent = { [K in BlockKey]: z.input<typeof blockSchemas[K]> }

export const demoContent: DemoContent = {
  'settings': settings,
  'header': header,
  'footer': footer,
  'home.hero': hero,
  'home.presentation': presentation,
  'home.epreuves': races,
  'home.galerie': gallery,
  'home.benevoles': volunteers,
  'home.partenaires': partners,
  'home.contact': contact,
  'infos.page': page,
  'infos.pratiques': practical,
  'infos.faq': faq,
  'race.trail-40': trail40,
  'race.trail-20': trail20,
  'race.trail-13': trail13,
  'race.randonnee': hike,
  'race.marche-solidaire': charityWalk,
  'page.mentions-legales': legalNotice,
  'page.confidentialite': privacy,
}
