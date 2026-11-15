import type { DemoContent } from './index'
import { registerUrl } from './common'
import { logo, photo } from './files'

// Accueil (spec 02).

export const hero: DemoContent['home.hero'] = {
  image: { src: photo('banniere') },
  subtitle: 'Courir au cœur des Cévennes, entre châtaigneraies, crêtes de schiste et vallée de la Cèze.',
  cta: { label: 'S’inscrire', url: registerUrl },
  showCountdown: true,
  afterText: 'Merci à tous, rendez-vous l’an prochain !',
}

export const presentation: DemoContent['home.presentation'] = {
  visible: true,
  title: 'L’événement',
  text: '<p>Pour sa <strong>première édition</strong>, le Trail de Bessèges vous emmène sur les sentiers qui dominent la vallée de la Cèze : anciens chemins muletiers, forêts de châtaigniers et points de vue sur le mont Lozère.</p>'
    + '<p>Trois trails, une randonnée et une marche solidaire : que vous veniez chercher la performance ou simplement partager un moment en pleine nature, il y a une épreuve pour vous.</p>'
    + '<p>L’événement est organisé par des bénévoles de l’association Horizon Cévennes, avec le soutien de la commune et des commerçants de la vallée.</p>',
  image: { src: photo('presentation'), alt: 'Coureur sur une route de montagne, au bord d’un lac' },
}

export const races: DemoContent['home.epreuves'] = {
  title: 'Les épreuves',
  intro: 'Cinq formats pour tous les niveaux, du trail exigeant à la marche en famille.',
}

export const gallery: DemoContent['home.galerie'] = {
  visible: true,
  title: 'Galerie',
  photos: [
    { src: photo('galerie-1'), alt: 'Le Gardon entre les rochers, à Sainte-Croix-Vallée-Française' },
    { src: photo('galerie-2'), alt: 'Menhirs de Cropilhac sur le causse, près de Florac' },
    { src: photo('galerie-3'), alt: 'Les crêtes des Cévennes depuis un flanc du mont Aigoual' },
    { src: photo('galerie-4'), alt: 'Randonneurs sur le chemin de Stevenson, près du viaduc de Mirandol' },
    { src: photo('galerie-5'), alt: 'Maisons cévenoles au bord du Gardon' },
    { src: photo('galerie-6'), alt: 'Forêt de pins dans la brume' },
  ],
}

export const volunteers: DemoContent['home.benevoles'] = {
  visible: true,
  title: 'Devenez bénévole',
  text: '<p>Sans bénévoles, pas de trail ! Balisage, ravitaillements, sécurité, accueil des coureurs : rejoignez l’équipe pour une journée conviviale au cœur de la course.</p>'
    + '<p>Repas et tee-shirt offerts à tous les bénévoles.</p>',
  image: { src: photo('benevoles'), alt: 'Bénévole tendant des gobelets d’eau aux coureurs' },
  button: { label: 'Je deviens bénévole', url: 'https://www.example.org/benevoles-trail-besseges' },
}

const partnerNames = ['Mairie de Bessèges', 'Cévennes Sport', 'Boulangerie du Pont', 'Gard Rando', 'Caves de la Cèze', 'Pharmacie Centrale']

export const partners: DemoContent['home.partenaires'] = {
  visible: true,
  title: 'Nos partenaires',
  items: partnerNames.map((name, index) => ({ name, logo: logo(`partenaire-${index + 1}`), url: 'https://www.example.org/' })),
}

export const contact: DemoContent['home.contact'] = {
  visible: true,
  title: 'Contact',
  text: 'Une question sur les épreuves, les inscriptions ou les partenariats ? Écrivez-nous, nous répondons sous 48 heures.',
}
