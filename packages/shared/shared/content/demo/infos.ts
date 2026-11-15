import type { DemoContent } from './index'
import { download } from './files'

// Page Infos pratiques (spec 10).

export const page: DemoContent['infos.page'] = {
  title: 'Infos pratiques',
  intro: 'Tout ce qu’il faut savoir pour préparer votre venue à Bessèges : accès, dossards, horaires, et les réponses à vos questions.',
  seo: {
    title: 'Infos pratiques, Trail de Bessèges',
    description: 'Accès, parking, retrait des dossards, horaires, douches et restauration : tout pour préparer votre venue au Trail de Bessèges.',
  },
}

export const practical: DemoContent['infos.pratiques'] = {
  visible: true,
  title: 'Sur place',
  items: [
    { icon: 'lieu', title: 'Village départ', text: 'Place de la mairie, Bessèges. Départs et arrivées de toutes les épreuves.' },
    { icon: 'dossard', title: 'Retrait des dossards', text: 'Vendredi 16 avril de 16 h à 20 h et samedi dès 6 h 30 au village départ. Pièce d’identité obligatoire.' },
    { icon: 'parking', title: 'Parking', text: 'Parkings gratuits au stade et à la gare. Fléchage depuis la D 17.' },
    { icon: 'douche', title: 'Douches', text: 'Douches chaudes au gymnase municipal, à 200 m de l’arrivée.' },
    { icon: 'restauration', title: 'Restauration', text: 'Repas d’après-course offert aux coureurs. Buvette et produits locaux toute la journée.' },
    { icon: 'horaire', title: 'Horaires', text: 'Premier départ à 7 h 30 (trail 40 km). Remise des prix à 15 h.' },
  ],
  address: 'Place de la mairie, 30160 Bessèges',
  mapUrl: 'https://www.openstreetmap.org/search?query=Bess%C3%A8ges',
  rules: download('reglement-trail-besseges-2027.pdf', 1333),
}

export const faq: DemoContent['infos.faq'] = {
  visible: true,
  title: 'Questions fréquentes',
  items: [
    {
      question: 'Faut-il un certificat médical ?',
      answer: '<p>Oui pour les trails : un certificat médical de non contre-indication à la course à pied en compétition, de moins d’un an, ou une licence FFA en cours de validité. Non pour la randonnée et la marche solidaire.</p>',
    },
    {
      question: 'Les bâtons sont-ils autorisés ?',
      answer: '<p>Oui sur le trail 40 km et le trail 20 km. Ils sont interdits sur le trail 13 km.</p>',
    },
    {
      question: 'Peut-on s’inscrire sur place ?',
      answer: '<p>Oui, dans la limite des places disponibles, avec une majoration de 5 €. Nous recommandons fortement l’inscription en ligne.</p>',
    },
    {
      question: 'À quoi sert la marche solidaire ?',
      answer: '<p>Les dons collectés sont intégralement reversés à une association locale d’aide aux familles.</p>',
    },
  ],
}
