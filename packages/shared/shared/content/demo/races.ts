import type { DemoContent } from './index'
import { registerUrl } from './common'
import { download, photo } from './files'

// Les cinq épreuves (spec 03). Tracés et GPX fictifs, autour de Bessèges.

type RaceDemo = DemoContent['race.trail-40']

// Texte, chiffres et liens propres à l'épreuve ; images et GPX déduits du slug.
type RaceText = Omit<RaceDemo, 'image' | 'route' | 'profile' | 'gpx' | 'visible' | 'resultsUrl'>
  & { name: string, distance: number, elevationGain: number }

function race(slug: string, gpxSize: number, content: RaceText): RaceDemo {
  const { name, distance, elevationGain } = content
  return {
    visible: true,
    ...content,
    image: photo(`epreuve-${slug}`),
    route: { ...photo(`trace-${slug}`, 1120), alt: `Tracé du parcours ${name}, au départ de Bessèges` },
    profile: { ...photo(`profil-${slug}`, 533), alt: `Profil du parcours ${name} : ${distance} km et ${elevationGain} m de dénivelé positif` },
    gpx: download(`${slug}.gpx`, gpxSize),
    resultsUrl: '',
  }
}

export const trail40 = race('trail-40', 27988, {
  name: 'La Cévenole',
  type: 'Trail',
  start: 'Samedi 17 avril, 7 h 30',
  distance: 40,
  elevationGain: 1900,
  price: '35 € en ligne, 40 € sur place',
  description: '<p>Le grand parcours du Trail de Bessèges : <strong>40 km et 1 900 m de dénivelé positif</strong> à travers les crêtes qui séparent la vallée de la Cèze de celle de l’Auzonnet.</p>'
    + '<p>Un parcours exigeant et technique, réservé aux coureurs expérimentés.</p>',
  extra: '<ul><li>4 ravitaillements (km 10, 18, 27 et 34)</li><li>Barrière horaire au km 27 : 13 h 30</li><li>Matériel obligatoire : réserve d’eau 1 L, couverture de survie, sifflet</li></ul>',
  registerUrl,
  seo: {
    title: 'La Cévenole, trail 40 km, Trail de Bessèges',
    description: '40 km et 1 900 m de dénivelé positif sur les crêtes des Cévennes, au départ de Bessèges, le 17 avril 2027.',
  },
})

export const trail20 = race('trail-20', 14192, {
  name: 'La Cézarenque',
  type: 'Trail',
  start: 'Samedi 17 avril, 9 h 00',
  distance: 20,
  elevationGain: 950,
  price: '22 € en ligne, 27 € sur place',
  description: '<p>Un trail complet et accessible, alternant sentiers en balcon et descentes en sous-bois.</p>',
  extra: '<ul><li>2 ravitaillements (km 8 et 14)</li><li>Matériel obligatoire : réserve d’eau 0,5 L</li></ul>',
  registerUrl,
  seo: {
    title: 'La Cézarenque, trail 20 km, Trail de Bessèges',
    description: '20 km et 950 m de dénivelé positif entre sentiers en balcon et sous-bois, au départ de Bessèges, le 17 avril 2027.',
  },
})

export const trail13 = race('trail-13', 9364, {
  name: 'La Bességeoise',
  type: 'Trail',
  start: 'Samedi 17 avril, 9 h 30',
  distance: 13,
  elevationGain: 550,
  price: '16 € en ligne, 21 € sur place',
  description: '<p>Le format idéal pour découvrir le trail : rapide, ludique et au plus près du village.</p>',
  extra: '<ul><li>1 ravitaillement (km 7)</li></ul>',
  // Lien vide : bouton vers le lien d'inscription général (ACC-05).
  registerUrl: '',
  seo: {
    title: 'La Bességeoise, trail 13 km, Trail de Bessèges',
    description: '13 km et 550 m de dénivelé positif pour découvrir le trail, au départ de Bessèges, le 17 avril 2027.',
  },
})

export const hike = race('randonnee', 8700, {
  name: 'Randonnée des châtaigniers',
  type: 'Randonnée',
  start: 'Samedi 17 avril, 8 h 30',
  distance: 12,
  elevationGain: 400,
  price: '8 €, gratuit pour les moins de 12 ans',
  description: '<p>Une randonnée non chronométrée à la découverte du patrimoine de la vallée, avec une pause gourmande à mi-parcours.</p>',
  extra: '',
  registerUrl,
  seo: {
    title: 'Randonnée des châtaigniers, Trail de Bessèges',
    description: 'Randonnée de 12 km non chronométrée à la découverte de la vallée de la Cèze, au départ de Bessèges, le 17 avril 2027.',
  },
})

export const charityWalk = race('marche-solidaire', 4536, {
  name: 'Marche solidaire',
  type: 'Marche',
  start: 'Samedi 17 avril, 10 h 00',
  distance: 6,
  elevationGain: 120,
  price: 'Participation libre, reversée à une association locale',
  description: '<p>Une boucle facile et familiale le long de la Cèze. Chaque pas compte : les dons sont intégralement reversés.</p>',
  extra: '',
  registerUrl,
  seo: {
    title: 'Marche solidaire, Trail de Bessèges',
    description: 'Boucle familiale de 6 km le long de la Cèze, au profit d’une association locale, au départ de Bessèges, le 17 avril 2027.',
  },
})
