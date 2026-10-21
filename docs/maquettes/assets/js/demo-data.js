/* Contenu de démonstration partagé par le site et le back-office.
 * Reflète le modèle de contenu de la spec 05 : un bloc par clé, rendu par un
 * composant de section. Dans l'application réelle, ce contenu vient de SQLite. */
window.DEMO_CONTENT = {
  settings: {
    eventName: 'Trail de Bessèges',
    edition: '1re édition',
    startDate: '2027-04-17T07:30',
    dateLabel: 'Samedi 17 avril 2027',
    place: 'Bessèges (Gard)',
    email: 'contact@trail-besseges.fr',
    registerUrl: 'https://www.example-inscriptions.fr/trail-besseges-2027',
    socials: {
      facebook: 'https://www.facebook.com/',
      instagram: 'https://www.instagram.com/',
      strava: '',
      youtube: '',
    },
    seoTitle: 'Trail de Bessèges, 17 avril 2027, trails et randonnée en Cévennes',
    seoDescription: 'Trails de 13, 20 et 40 km, randonnée et marche solidaire au départ de Bessèges, dans les Cévennes gardoises.',
  },

  header: {
    logo: { src: '../assets/img/logo.svg', alt: 'Trail de Bessèges, accueil' },
    title: 'Trail de Bessèges',
    menu: [
      { label: "L'événement", target: '#presentation' },
      { label: 'Épreuves', target: '#epreuves' },
      { label: 'Infos pratiques', target: 'infos-pratiques.html' },
      { label: 'Galerie', target: '#galerie' },
      { label: 'Bénévoles', target: '#benevoles' },
      { label: 'FAQ', target: 'infos-pratiques.html#faq' },
      { label: 'Contact', target: '#contact' },
    ],
    cta: { label: "S'inscrire", url: 'https://www.example-inscriptions.fr/trail-besseges-2027' },
  },

  footer: {
    association: 'Association Horizon Cévennes',
    text: '© 2027 Horizon Cévennes. Fait avec ❤ à Bessèges.',
  },

  home: {
    hero: {
      image: { src: '../assets/img/hero.svg', alt: '' },
      subtitle: 'Courir au cœur des Cévennes, entre châtaigneraies, crêtes de schiste et vallée de la Cèze.',
      cta: { label: "S'inscrire", url: 'https://www.example-inscriptions.fr/trail-besseges-2027' },
      showCountdown: true,
      afterText: 'Merci à tous, rendez-vous l’an prochain !',
    },
    presentation: {
      visible: true,
      title: "L'événement",
      text: "Pour sa **première édition**, le Trail de Bessèges vous emmène sur les sentiers qui dominent la vallée de la Cèze : anciens chemins muletiers, forêts de châtaigniers et points de vue sur le mont Lozère.\n\nTrois trails, une randonnée et une marche solidaire : que vous veniez chercher la performance ou simplement partager un moment en pleine nature, il y a une épreuve pour vous.\n\nL'événement est organisé par des bénévoles de l'association Horizon Cévennes, avec le soutien de la commune et des commerçants de la vallée.",
      image: { src: '../assets/img/photo-1.svg', alt: 'Coureurs sur une crête au lever du soleil' },
    },
    epreuves: {
      title: 'Les épreuves',
      intro: 'Cinq formats pour tous les niveaux, du trail exigeant à la marche en famille.',
    },
    galerie: {
      visible: true,
      title: 'Galerie',
      photos: [
        { src: '../assets/img/photo-2.svg', alt: 'Brume matinale sur la vallée de la Cèze' },
        { src: '../assets/img/photo-3.svg', alt: 'Sentier en balcon au-dessus de Bessèges' },
        { src: '../assets/img/photo-4.svg', alt: 'Coucher de soleil sur les crêtes cévenoles' },
        { src: '../assets/img/photo-5.svg', alt: 'Forêt de châtaigniers au printemps' },
        { src: '../assets/img/photo-6.svg', alt: 'Ravitaillement au col de Bordezac' },
        { src: '../assets/img/photo-7.svg', alt: 'Arrivée sur la place de la mairie' },
      ],
    },
    benevoles: {
      visible: true,
      title: 'Devenez bénévole',
      text: "Sans bénévoles, pas de trail ! Balisage, ravitaillements, sécurité, accueil des coureurs : rejoignez l'équipe pour une journée conviviale au cœur de la course.\n\nRepas et tee-shirt offerts à tous les bénévoles.",
      image: { src: '../assets/img/photo-8.svg', alt: 'Bénévoles au ravitaillement' },
      button: { label: 'Je deviens bénévole', url: 'https://forms.example.com/benevoles-trail-besseges' },
    },
    partenaires: {
      visible: true,
      title: 'Nos partenaires',
      items: [1, 2, 3, 4, 5, 6].map((i) => ({
        name: ['Mairie de Bessèges', 'Cévennes Sport', 'Boulangerie du Pont', 'Gard Rando', 'Caves de la Cèze', 'Pharmacie Centrale'][i - 1],
        logo: `../assets/img/partenaire-${i}.svg`,
        url: 'https://www.example.com/',
      })),
    },
    contact: {
      visible: true,
      title: 'Contact',
      text: 'Une question sur les épreuves, les inscriptions ou les partenariats ? Écrivez-nous, nous répondons sous 48 heures.',
    },
  },

  infos: {
    page: {
      title: 'Infos pratiques',
      intro: 'Tout ce qu\u2019il faut savoir pour préparer votre venue à Bessèges : accès, dossards, horaires, et les réponses à vos questions.',
    },
    pratiques: {
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
      rules: { name: 'reglement-trail-besseges-2027.pdf', size: '0,4 Mo' },
    },
    faq: {
      visible: true,
      title: 'Questions fréquentes',
      items: [
        { q: 'Faut-il un certificat médical ?', a: 'Oui pour les trails : un certificat médical de non contre-indication à la course à pied en compétition, de moins d’un an, ou une licence FFA en cours de validité. Non pour la randonnée et la marche solidaire.' },
        { q: 'Les bâtons sont-ils autorisés ?', a: 'Oui sur le trail 40 km et le trail 20 km. Ils sont interdits sur le trail 13 km.' },
        { q: 'Peut-on s’inscrire sur place ?', a: 'Oui, dans la limite des places disponibles, avec une majoration de 5 €. Nous recommandons fortement l’inscription en ligne.' },
        { q: 'À quoi sert la marche solidaire ?', a: 'Les dons collectés sont intégralement reversés à une association locale d’aide aux familles.' },
      ],
    },
  },

  races: {
    'trail-40': {
      visible: true, name: 'La Cévenole', type: 'Trail', distance: 40, dplus: 1900, start: 'Samedi 17 avril, 7 h 30',
      price: '35 € en ligne, 40 € sur place', image: '../assets/img/photo-4.svg',
      description: "Le grand parcours du Trail de Bessèges : **40 km et 1 900 m de dénivelé positif** à travers les crêtes qui séparent la vallée de la Cèze de celle de l'Auzonnet.\n\nUn parcours exigeant et technique, réservé aux coureurs expérimentés.",
      extra: "- 4 ravitaillements (km 10, 18, 27 et 34)\n- Barrière horaire au km 27 : 13 h 30\n- Matériel obligatoire : réserve d'eau 1 L, couverture de survie, sifflet",
      trace: '../assets/img/trace-trail-40.svg', profil: '../assets/img/profil-trail-40.svg',
      gpx: 'trail-besseges-40km.gpx', registerUrl: 'https://www.example-inscriptions.fr/trail-besseges-2027', resultsUrl: '',
    },
    'trail-20': {
      visible: true, name: 'La Cézarenque', type: 'Trail', distance: 20, dplus: 950, start: 'Samedi 17 avril, 9 h 00',
      price: '22 € en ligne, 27 € sur place', image: '../assets/img/photo-2.svg',
      description: 'Un trail complet et accessible, alternant sentiers en balcon et descentes en sous-bois.',
      extra: '- 2 ravitaillements (km 8 et 14)\n- Matériel obligatoire : réserve d’eau 0,5 L',
      trace: '../assets/img/trace-trail-20.svg', profil: '../assets/img/profil-trail-20.svg',
      gpx: 'trail-besseges-20km.gpx', registerUrl: 'https://www.example-inscriptions.fr/trail-besseges-2027', resultsUrl: '',
    },
    'trail-13': {
      visible: true, name: 'La Bességeoise', type: 'Trail', distance: 13, dplus: 550, start: 'Samedi 17 avril, 9 h 30',
      price: '16 € en ligne, 21 € sur place', image: '../assets/img/photo-3.svg',
      description: 'Le format idéal pour découvrir le trail : rapide, ludique et au plus près du village.',
      extra: '- 1 ravitaillement (km 7)',
      trace: '../assets/img/trace-trail-13.svg', profil: '../assets/img/profil-trail-13.svg',
      gpx: 'trail-besseges-13km.gpx', registerUrl: '', resultsUrl: '',
    },
    randonnee: {
      visible: true, name: 'Randonnée des châtaigniers', type: 'Randonnée', distance: 12, dplus: 400, start: 'Samedi 17 avril, 8 h 30',
      price: '8 €, gratuit pour les moins de 12 ans', image: '../assets/img/photo-5.svg',
      description: 'Une randonnée non chronométrée à la découverte du patrimoine de la vallée, avec une pause gourmande à mi-parcours.',
      extra: '',
      trace: '../assets/img/trace-randonnee.svg', profil: '../assets/img/profil-randonnee.svg',
      gpx: 'trail-besseges-randonnee.gpx', registerUrl: 'https://www.example-inscriptions.fr/trail-besseges-2027', resultsUrl: '',
    },
    'marche-solidaire': {
      visible: true, name: 'Marche solidaire', type: 'Marche', distance: 6, dplus: 120, start: 'Samedi 17 avril, 10 h 00',
      price: 'Participation libre, reversée à une association locale', image: '../assets/img/photo-6.svg',
      description: 'Une boucle facile et familiale le long de la Cèze. Chaque pas compte : les dons sont intégralement reversés.',
      extra: '',
      trace: '../assets/img/trace-marche-solidaire.svg', profil: '../assets/img/profil-marche-solidaire.svg',
      gpx: '', registerUrl: 'https://www.example-inscriptions.fr/trail-besseges-2027', resultsUrl: '',
    },
  },

  pages: {
    'mentions-legales': {
      title: 'Mentions légales',
      text: "### Éditeur du site\nAssociation Horizon Cévennes, association loi 1901.\nSiège : place de la mairie, 30160 Bessèges.\nDirecteur de la publication : le président de l'association.\n\n### Hébergement\nOVH SAS, 2 rue Kellermann, 59100 Roubaix, France.\n\n### Propriété intellectuelle\nLes textes et photos de ce site appartiennent à l'association ou à leurs auteurs. Toute reproduction nécessite une autorisation.",
    },
    confidentialite: {
      title: 'Politique de confidentialité',
      text: "### Données collectées\nCe site ne dépose **aucun cookie**. La mesure d'audience (Umami, auto-hébergé) est anonyme.\n\n### Inscriptions\nLes inscriptions sont gérées par une plateforme externe, soumise à sa propre politique de confidentialité.\n\n### Contact\nPour toute question : contact@trail-besseges.fr.",
    },
  },
};

window.RACE_ORDER = ['trail-40', 'trail-20', 'trail-13', 'randonnee', 'marche-solidaire'];

/* Stockage de la démo : le back-office publie, le site lit la version publiée.
 * Tout accès est protégé : sans stockage, la démo retombe sur le contenu par défaut. */
window.DemoStore = {
  read(key) {
    try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : null; } catch (e) { return null; }
  },
  write(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* stockage indisponible */ }
  },
  remove(key) {
    try { localStorage.removeItem(key); } catch (e) { /* stockage indisponible */ }
  },
  published() { return this.read('maquette.v2.published') || structuredClone(window.DEMO_CONTENT); },
  draft() { return this.read('maquette.v2.draft'); },
  reset() { this.remove('maquette.v2.published'); this.remove('maquette.v2.draft'); this.remove('maquette.v2.meta'); },
};
