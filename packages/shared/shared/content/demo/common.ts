import type { DemoContent } from './index'
import { logo } from './files'

// Réglages et éléments communs à toutes les pages.

export const registerUrl = 'https://www.example.org/inscriptions/trail-besseges-2027'

export const settings: DemoContent['settings'] = {
  eventName: 'Trail de Bessèges',
  edition: '1re édition',
  place: 'Bessèges (Gard)',
  startDate: '2027-04-17T07:30',
  dateLabel: 'Samedi 17 avril 2027',
  email: 'contact@trail-besseges.fr',
  registerUrl,
  socials: {
    facebook: 'https://www.facebook.com/',
    instagram: 'https://www.instagram.com/',
    strava: '',
    youtube: '',
  },
  seo: {
    title: 'Trail de Bessèges, 17 avril 2027, trails et randonnée en Cévennes',
    description: 'Trails de 13, 20 et 40 km, randonnée et marche solidaire au départ de Bessèges, dans les Cévennes gardoises.',
  },
}

export const header: DemoContent['header'] = {
  logo: { src: logo('logo'), alt: 'Trail de Bessèges, accueil' },
  title: 'Trail de Bessèges',
  menu: [
    { label: 'L’événement', target: '/#presentation' },
    { label: 'Épreuves', target: '/#epreuves' },
    { label: 'Infos pratiques', target: '/infos-pratiques' },
    { label: 'Galerie', target: '/#galerie' },
    { label: 'Bénévoles', target: '/#benevoles' },
    { label: 'FAQ', target: '/infos-pratiques#faq' },
    { label: 'Contact', target: '/#contact' },
  ],
  cta: { label: 'S’inscrire', url: registerUrl },
}

export const footer: DemoContent['footer'] = {
  association: 'Association Horizon Cévennes',
  text: '© 2027 Horizon Cévennes. Fait avec ❤ à Bessèges.',
}
