# 10 — Site public : page Infos pratiques

## Objectif

Regrouper sur une page dédiée tout ce qui sert à préparer sa venue : les
informations sur place (accès, dossards, parking, horaires, règlement) et les
questions fréquentes. L'accueil reste centré sur l'envie de participer.

## Structure de la page

URL : `/infos-pratiques`

| # | Section | Ancre | Masquable |
|---|---|---|---|
| 1 | En-tête de la page (titre, introduction, raccourcis) | — | Non |
| 2 | Sur place | `#pratiques` | Oui |
| 3 | Questions fréquentes | `#faq` | Oui |

## User stories

- En tant que visiteur, je veux trouver les infos pratiques (accès, parking,
  dossards, règlement) afin d'organiser ma venue.
- En tant que visiteur, je veux lire les réponses aux questions fréquentes afin de
  ne pas avoir à écrire aux organisateurs.
- En tant que visiteur, je veux accéder directement à la FAQ depuis le menu afin de
  trouver une réponse rapidement.

## Critères d'acceptation

### Règles communes

- **INF-01** — La page reprend les règles communes des sections de l'accueil
  (spec 02, ACC-01 à ACC-04) : section masquée absente du HTML, alternance
  automatique des fonds, titre `h2` modifiable, section de liste vide non rendue.
- **INF-02** — La page est toujours accessible, même si ses deux sections sont
  masquées (seul l'en-tête est alors affiché).
- **INF-03** — Les éléments du menu peuvent cibler la page (`/infos-pratiques`) ou
  une de ses sections (`/infos-pratiques#faq`). Un élément qui cible une section
  masquée n'est pas affiché (spec 01, SOC-03).
- **INF-04** — Dans le menu, le lien vers la page courante porte
  `aria-current="page"` et est mis en évidence.

### 1. En-tête de la page

- **INF-05** — L'en-tête affiche la date et le lieu de l'événement, le titre de la
  page (`h1`, modifiable) et un texte d'introduction optionnel.
- **INF-06** — Si les deux sections sont visibles, l'en-tête propose des raccourcis
  vers chacune d'elles (liens d'ancre).

### 2. Sur place

- **INF-07** — La section affiche une liste de blocs d'information (9 au
  maximum). Chaque bloc a une icône choisie dans une liste fixe (lieu, parking,
  dossard, horaire, douche, restauration, info), un titre et un texte.
- **INF-08** — La section affiche l'adresse du lieu de départ avec un lien
  « Voir sur la carte » vers une URL de carte externe (ex. Google Maps).
- **INF-09** — Si un règlement PDF est déposé, un bouton « Télécharger le
  règlement (PDF, x Mo) » est affiché.

### 3. Questions fréquentes

- **INF-10** — La FAQ affiche une liste de questions dépliables (30 au maximum).
  Chaque réponse est un texte mis en forme.
- **INF-11** — Les questions utilisent `<details>`/`<summary>` (accessibles et
  fonctionnelles sans JavaScript).
- **INF-12** (P2) — La page contient des données structurées JSON-LD `FAQPage`.

## Hors périmètre

- Recherche dans la FAQ.
- Catégories de questions.
- Carte interactive.
