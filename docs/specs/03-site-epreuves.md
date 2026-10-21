# 03 — Site public : pages des épreuves

## Objectif

Donner à chaque épreuve une page détaillée, construite sur un template unique,
pour que le coureur trouve toutes les informations utiles et le lien d'inscription.

## Épreuves (V1)

| Épreuve | URL |
|---|---|
| Trail 40 km | `/epreuves/trail-40` |
| Trail 20 km | `/epreuves/trail-20` |
| Trail 13 km | `/epreuves/trail-13` |
| Randonnée | `/epreuves/randonnee` |
| Marche solidaire | `/epreuves/marche-solidaire` |

La liste et les URL sont fixes en V1. Le contenu de chaque épreuve est modifiable.

## User stories

- En tant que coureur, je veux connaître la distance, le dénivelé, l'heure de
  départ et le tarif afin de choisir mon épreuve.
- En tant que coureur, je veux voir le tracé et le profil, et télécharger le GPX,
  afin de préparer ma course.
- En tant que coureur, je veux accéder directement à l'inscription et, après la
  course, aux résultats.

## Critères d'acceptation

### Contenu de la page

- **EPR-01** — La page affiche une bannière avec l'image de l'épreuve et son nom
  (`h1`).
- **EPR-02** — La page affiche les chiffres clés : distance (km), dénivelé positif
  (m), date et heure de départ, tarif (texte libre, ex. « 25 € en ligne, 30 € sur
  place »). Un chiffre clé vide n'est pas affiché.
- **EPR-03** — La page affiche une description mise en forme et un bloc
  « Informations complémentaires » optionnel (ravitaillements, barrières horaires,
  matériel obligatoire…).
- **EPR-04** — La page affiche l'image du tracé et l'image du profil, chacune avec
  son texte alternatif. Une image absente n'est pas affichée (pas d'emplacement vide).
- **EPR-05** — Si un fichier GPX est déposé, un bouton « Télécharger le GPX » est
  affiché. Le fichier est téléchargé avec un nom lisible
  (ex. `trail-besseges-40km.gpx`).

### Boutons externes

- **EPR-06** — Le bouton « S'inscrire » est affiché uniquement si le lien
  d'inscription est renseigné. Il s'ouvre dans un nouvel onglet.
- **EPR-07** — Le bouton « Voir les résultats » est affiché uniquement si le lien
  des résultats est renseigné. Il s'ouvre dans un nouvel onglet.
- **EPR-08** — Le libellé des boutons est explicite pour les lecteurs d'écran
  (ex. « S'inscrire au Trail 40 km, nouvel onglet »).

### Navigation et visibilité

- **EPR-09** — La page propose un lien « Toutes les épreuves » vers `/#epreuves`.
- **EPR-10** (P2) — La page propose des liens vers l'épreuve précédente et suivante.
- **EPR-11** — Une épreuve masquée renvoie une 404 et n'apparaît pas dans le
  sitemap ni dans le menu.

### SEO

- **EPR-12** — Chaque page d'épreuve a son `<title>`, sa `meta description` et son
  image Open Graph (par défaut l'image de bannière de l'épreuve).
- **EPR-13** — Chaque page contient des données structurées JSON-LD `SportsEvent`
  rattachées à l'événement principal (`superEvent`).

## Hors périmètre

- Ajouter, supprimer ou réordonner des épreuves (reporté).
- Modifier l'URL d'une épreuve.
- Profil altimétrique ou carte générés automatiquement à partir du GPX (les images
  sont fournies par l'éditeur, par exemple exportées d'OpenRunner ou de Visorando).
- Carte interactive.
- Classements ou résultats hébergés sur le site.
