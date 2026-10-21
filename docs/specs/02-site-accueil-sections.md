# 02 — Site public : sections de la page d'accueil

## Objectif

Présenter l'événement sur une page d'accueil composée de sections prédéfinies,
dans un ordre fixe. Chaque section peut être masquée et son contenu est
modifiable dans le back-office.

## Ordre des sections

| # | Section | Ancre | Masquable |
|---|---|---|---|
| 1 | Bannière et compte à rebours | `#accueil` | Non |
| 2 | Présentation | `#presentation` | Oui |
| 3 | Les épreuves | `#epreuves` | Non |
| 4 | Galerie | `#galerie` | Oui |
| 5 | Bénévoles | `#benevoles` | Oui |
| 6 | Partenaires | `#partenaires` | Oui |
| 7 | Contact | `#contact` | Oui |

La bannière et les épreuves ne sont pas masquables : sans elles, l'accueil n'a plus
de sens.

Un bandeau de chiffres clés (nombre d'épreuves, plus longue distance, dénivelé
maximal, édition) suit la bannière. Il est calculé à partir des épreuves visibles
et des paramètres généraux : rien à saisir.

Les infos pratiques et la FAQ ont leur propre page (spec 10). Les critères
ACC-18 à ACC-20 et ACC-25 à ACC-27 y ont été déplacés (INF-07 à INF-12).

## User stories

- En tant que visiteur, je veux voir immédiatement la date, le lieu et le temps
  restant avant la course afin de savoir si je peux participer.
- En tant que visiteur, je veux comparer les épreuves d'un coup d'œil afin de
  choisir celle qui me correspond.
- En tant que bénévole potentiel, je veux savoir comment aider afin de rejoindre
  l'équipe.
- En tant que partenaire, je veux voir mon logo afin que mon soutien soit visible.

## Critères d'acceptation

### Règles communes

- **ACC-01** — Une section masquée n'est pas rendue dans le HTML (et pas seulement
  cachée en CSS).
- **ACC-02** — Les sections visibles alternent automatiquement entre le fond
  blanc cassé et le fond sable, dans l'ordre d'affichage. Masquer une section ne
  casse pas l'alternance.
- **ACC-03** — Chaque section a un titre `h2` modifiable et un `id` égal à son
  ancre.
- **ACC-04** — Une section de liste vide (galerie sans image, FAQ sans question,
  partenaires sans logo) n'est pas rendue, même si elle est marquée visible.

### 1. Bannière et compte à rebours

- **ACC-05** — La bannière affiche une image de fond, le nom de l'événement (`h1`),
  la date et le lieu, un sous-titre, et un bouton d'action principal (libellé et
  lien modifiables, par défaut « S'inscrire »).
- **ACC-06** — Le texte reste lisible sur l'image grâce à un voile sombre
  (contraste ≥ 4,5:1 entre le texte et le voile).
- **ACC-07** — Le compte à rebours affiche les jours, heures et minutes restants
  jusqu'à la date et l'heure de départ définies dans les paramètres généraux.
- **ACC-08** — Le compte à rebours est calculé côté serveur au premier affichage
  (visible sans JavaScript), puis mis à jour chaque minute côté client.
- **ACC-09** — Le compte à rebours n'est pas annoncé en continu par les lecteurs
  d'écran : seul un texte statique est exposé (ex. « Départ dans 180 jours »).
- **ACC-10** — Une fois la date de départ passée, le compte à rebours est remplacé
  par un texte modifiable (par défaut « Merci à tous, rendez-vous l'an prochain ! »).
- **ACC-11** — Le compte à rebours peut être masqué indépendamment du reste de la
  bannière.
- **ACC-35** — Sous la bannière, un bandeau de chiffres clés affiche le nombre
  d'épreuves visibles, la plus longue distance, le plus grand dénivelé positif et
  l'édition. Ces valeurs sont calculées automatiquement à partir des épreuves et
  des paramètres généraux.

### 2. Présentation

- **ACC-12** — La section affiche un titre, un texte mis en forme (paragraphes,
  gras, italique, liens, listes) et une image optionnelle.
- **ACC-13** — Sur ordinateur, l'image est à côté du texte. Sur mobile, elle passe
  sous le texte.

### 3. Les épreuves

- **ACC-14** — La section affiche un texte d'introduction optionnel puis une carte
  par épreuve visible, dans l'ordre défini (trail 40, 20, 13 km, randonnée,
  marche solidaire).
- **ACC-15** — Chaque carte affiche le nom, la distance, le type (Trail,
  Randonnée, Marche) et l'image de l'épreuve. Toute la carte est cliquable et
  mène à la page de l'épreuve (un seul lien par carte).
- **ACC-16** — Une épreuve masquée n'a pas de carte.
- **ACC-17** — Les cartes s'affichent sur une colonne sur mobile, plusieurs
  colonnes sur ordinateur.

### 4. Galerie

- **ACC-21** — La galerie affiche les photos en grille. Chaque photo a un texte
  alternatif obligatoire.
- **ACC-22** — Un clic sur une photo l'ouvre en grand (visionneuse). La visionneuse
  se navigue au clavier (flèches, Échap), piège le focus tant qu'elle est ouverte
  et le rend à la miniature à la fermeture.
- **ACC-23** — La galerie accepte jusqu'à 30 photos.

### 5. Bénévoles

- **ACC-24** — La section affiche un texte mis en forme, une image optionnelle et
  un bouton vers un lien externe (ex. formulaire Google). Le bouton n'est pas
  affiché si le lien est vide.

### 6. Partenaires

- **ACC-28** — La section affiche les logos des partenaires. Chaque logo a le nom du
  partenaire comme texte alternatif et peut porter un lien vers son site (nouvel
  onglet).
- **ACC-29** — Les logos sont affichés à hauteur égale, quelle que soit leur taille
  d'origine.
- **ACC-31** — Les logos défilent en continu, de gauche à droite, en boucle sans
  à-coup, à vitesse constante quel que soit le nombre de logos.
- **ACC-32** — Le défilement s'arrête au survol de la souris et quand un logo
  reçoit le focus clavier. Un bouton « Mettre en pause le défilement » /
  « Reprendre le défilement » (`aria-pressed`) permet de l'arrêter durablement
  (WCAG 2.2.2).
- **ACC-33** — Si les logos tiennent dans la largeur de l'écran, ou si le visiteur
  a demandé à réduire les animations (`prefers-reduced-motion`), les logos sont
  affichés en grille fixe centrée, sans défilement ni bouton de pause.
- **ACC-34** — La copie des logos qui sert à la boucle est ignorée par les
  lecteurs d'écran (`aria-hidden`) et par la navigation au clavier : chaque
  partenaire n'est annoncé et atteignable qu'une fois.

### 7. Contact

- **ACC-30** — La section affiche un texte d'introduction, l'adresse e-mail de
  contact (lien `mailto:`) et les réseaux sociaux renseignés dans les paramètres
  généraux.

## Hors périmètre

- Réordonner les sections.
- Ajouter une section ou dupliquer une section existante.
- Formulaire de contact.
- Carte interactive.
- Vidéo en fond de bannière.
- Flux Instagram ou Facebook intégré.
- Réglage de la vitesse ou du sens du défilement des partenaires depuis le
  back-office.
