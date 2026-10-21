# 04 — Thème

## Objectif

Définir une identité visuelle unique, fixée dans le code, garantissant un rendu
cohérent et accessible sur tout le site. Les couleurs ne sont **pas** modifiables
depuis le back-office (décision de cadrage).

## Palette

| Jeton CSS | Couleur | Usage |
|---|---|---|
| `--color-primary` | `#F5700F` | Boutons d'action, accents, liens au survol |
| `--color-secondary` | `#052D1F` | Header, footer, titres, texte sur fond orange |
| `--color-background` | `#FAF7F0` | Fond général (blanc cassé) |
| `--color-neutral` | `#E9E2D3` | Fond d'une section sur deux, bordures |
| `--color-text` | `#1F2421` | Texte courant |

## Associations autorisées

| Texte | Fond | Contraste approx. | Usage |
|---|---|---|---|
| `#052D1F` | `#F5700F` | 5,1:1 | Boutons primaires |
| `#FAF7F0` | `#052D1F` | 14:1 | Header, footer, boutons secondaires |
| `#1F2421` | `#FAF7F0` | 14,7:1 | Texte courant |
| `#1F2421` | `#E9E2D3` | 12,2:1 | Texte sur sections sable |
| `#052D1F` | `#E9E2D3` | 11,6:1 | Titres sur sections sable |
| `#052D1F` | `#FAF7F0` | 14:1 | Titres |
| `#F5700F` | `#052D1F` | 5,1:1 | Accents sur fond vert |

**Interdit :** texte blanc ou blanc cassé sur `#F5700F` (2,9:1 et 2,7:1), et texte orange
sur fond clair (2,7:1). L'orange sur fond clair est réservé aux éléments
décoratifs (filets, icônes non porteuses d'information).

## User stories

- En tant que visiteur, je veux un site lisible et cohérent afin de m'y retrouver
  facilement.
- En tant que développeur, je veux que les couleurs soient centralisées afin de
  pouvoir les changer en un seul endroit.

## Critères d'acceptation

- **THM-01** — Les 5 couleurs sont définies une seule fois, dans le layer partagé,
  sous forme de jetons (variables CSS et configuration de l'outil de style). Aucune
  couleur en dur ailleurs dans les composants.
- **THM-02** — Un test unitaire calcule le contraste de chaque association
  autorisée et échoue si l'une d'elles passe sous 4,5:1.
- **THM-03** — Les composants n'exposent que les variantes prévues : bouton
  primaire (orange, texte vert), bouton secondaire (vert, texte blanc cassé),
  bouton contour.
- **THM-04** — La typographie utilise au plus 2 familles de polices (titres et
  texte courant), auto-hébergées, avec `font-display: swap`. Choix des polices
  arrêté en phase 3 (maquettes).
- **THM-05** — Le site public et l'aperçu du back-office utilisent exactement les
  mêmes jetons et composants.

## Hors périmètre

- Modification des couleurs ou des polices depuis le back-office.
- Choix d'une couleur par section.
- Mode sombre.
