# 01 — Site public : socle

## Objectif

Fournir la structure commune à toutes les pages publiques (header, footer,
navigation, pages légales, page 404) et garantir les exigences transverses :
responsive, performance, accessibilité et référencement.

## User stories

- En tant que visiteur, je veux une navigation claire sur mobile comme sur
  ordinateur afin de trouver rapidement les épreuves et les infos pratiques.
- En tant que visiteur, je veux un bouton « S'inscrire » toujours visible afin de
  m'inscrire sans chercher.
- En tant que visiteur utilisant un lecteur d'écran ou le clavier, je veux pouvoir
  parcourir tout le site afin d'accéder aux mêmes informations que les autres.
- En tant qu'organisateur, je veux que le site remonte dans les moteurs de
  recherche sur « trail Bessèges » afin d'attirer des coureurs.
- En tant qu'organisateur, je veux des mentions légales et une politique de
  confidentialité afin de respecter les obligations d'une association.

## Critères d'acceptation

### Header

- **SOC-01** — Le header affiche le logo (lien vers l'accueil), le titre du site,
  les éléments du menu et un bouton d'action (libellé et lien modifiables, par
  défaut « S'inscrire »).
- **SOC-02** — Chaque élément du menu a un libellé et une cible : une ancre de
  section de l'accueil, la page Infos pratiques ou une de ses sections (spec 10),
  une page d'épreuve, ou une URL externe. Une URL externe
  s'ouvre dans un nouvel onglet avec `rel="noopener"`.
- **SOC-03** — Un élément du menu qui cible une section masquée n'est pas affiché.
- **SOC-04** — En dessous de 768 px de large, le menu est replié derrière un bouton
  « Menu » accessible (`aria-expanded`, fermeture avec Échap, focus géré). Le bouton
  d'action reste visible.
- **SOC-05** — Le header reste visible en haut de l'écran pendant le défilement.

### Footer

- **SOC-06** — Le footer affiche : le nom de l'association, l'adresse e-mail de
  contact (lien `mailto:`), les liens vers les réseaux sociaux renseignés, les liens
  vers les mentions légales et la politique de confidentialité, et un texte libre
  (ex. « © 2027 Horizon Cévennes »).
- **SOC-07** — Un réseau social sans URL n'est pas affiché. Chaque icône a un nom
  accessible (ex. « Instagram du Trail de Bessèges »).

### Pages légales et 404

- **SOC-08** — Les pages `/mentions-legales` et `/confidentialite` affichent un
  titre et un texte mis en forme (titres, paragraphes, listes, liens), modifiables
  dans le back-office.
- **SOC-09** — Une URL inconnue renvoie une page 404 (statut HTTP 404) aux couleurs
  du site, avec un lien vers l'accueil.

### Responsive

- **SOC-10** — Toutes les pages s'affichent sans défilement horizontal de 320 px à
  1920 px de large.
- **SOC-11** — Les zones cliquables mesurent au moins 44 × 44 px sur mobile.

### Performance

- **SOC-12** — Les images sont servies en WebP avec plusieurs tailles (`srcset`) et
  des dimensions explicites. Seule l'image de la bannière est chargée en priorité,
  les autres sont en chargement différé (`loading="lazy"`).
- **SOC-13** — Les polices sont auto-hébergées (aucun appel à Google Fonts ou à un
  CDN tiers).
- **SOC-14** — Score Lighthouse mobile ≥ 90 en Performance, Accessibilité, Bonnes
  pratiques et SEO sur l'accueil et une page d'épreuve, avec le contenu de démo.

### Accessibilité (objectif WCAG 2.1 AA)

- **SOC-15** — Aucune violation axe-core de niveau *serious* ou *critical* sur
  chaque page publique (test Playwright automatisé).
- **SOC-16** — Un lien « Aller au contenu » est le premier élément focusable.
- **SOC-17** — La hiérarchie des titres est cohérente : un seul `h1` par page, pas
  de niveau sauté.
- **SOC-18** — Toute image porteuse d'information a un texte alternatif. Les images
  décoratives ont `alt=""`.
- **SOC-19** — Le focus clavier est toujours visible.
- **SOC-20** — Les animations respectent `prefers-reduced-motion`.

### Référencement (SEO)

- **SOC-21** — Chaque page a un `<title>` et une `meta description` uniques,
  modifiables dans le back-office. Une valeur par défaut est construite à partir
  du nom de l'événement si le champ est vide.
- **SOC-22** — Chaque page a les balises Open Graph (`og:title`, `og:description`,
  `og:image`, `og:url`) et une URL canonique.
- **SOC-23** — `/sitemap.xml` liste l'accueil, la page Infos pratiques, les pages
  d'épreuves visibles et les pages légales. `/robots.txt` autorise l'indexation et référence le sitemap.
- **SOC-24** — L'accueil contient des données structurées JSON-LD de type
  `SportsEvent` (nom, date, lieu, organisateur, URL d'inscription).
- **SOC-25** — Le document a `lang="fr"`.

### Statistiques côté site

- **SOC-26** — Le script Umami est chargé uniquement en production (pas en
  préprod ni en dev). Il ne dépose aucun cookie.
- **SOC-27** — Les clics sur les boutons d'inscription et de résultats sont
  enregistrés comme événements Umami, avec le nom de l'épreuve.

## Hors périmètre

- Multilingue.
- Recherche interne au site.
- Mode sombre.
- Bannière de consentement aux cookies (inutile : aucun cookie déposé côté public).
- Création de nouvelles pages depuis le back-office.
