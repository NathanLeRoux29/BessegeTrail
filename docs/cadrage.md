# Cadrage — Site du Trail de Bessèges

Décisions prises en phase 1 (octobre 2026). Ce document sert de référence : toute
remise en cause d'une décision doit être tracée ici.

## Contexte

| Élément | Valeur |
|---|---|
| Événement | Trail de Bessèges, 1re édition le 17 avril 2027, annuel |
| Organisateur | Association Horizon Cévennes |
| Mise en ligne visée | 1er janvier 2027 |
| Éditeurs du back-office | 2 personnes, non techniques, sur ordinateur uniquement |
| Langue | Français uniquement |
| Maintenance d'une édition à l'autre | Le développeur (pas de fonctionnalité dédiée en V1) |
| Contenu au démarrage | Contenu de démonstration, remplacé ensuite via le back-office |

## Principes produit

- Site construit à partir de **templates et sections prédéfinis**. Le back-office
  modifie le contenu (textes, images, liens, fichiers, visibilité), jamais la mise
  en page.
- **Couleurs fixées dans le code** (5 couleurs, voir `specs/04-theme.md`), non
  modifiables depuis le back-office.
- **Inscriptions et résultats** : liens externes, affichés sous forme de boutons.
- **Contact** : adresse e-mail et réseaux sociaux, pas de formulaire.
- **Brouillon → Publier** : toute modification est d'abord un brouillon visible
  dans l'aperçu, puis publiée volontairement.
- **5 épreuves** fixes en V1 (trails 40, 20 et 13 km, randonnée, marche solidaire),
  chacune avec sa page. L'ajout ou la suppression d'épreuves est reporté.

## Stack technique

| Brique | Choix |
|---|---|
| Framework | Nuxt 4 (Vue 3, TypeScript), rendu serveur (SSR) |
| Organisation | Monorepo pnpm : `apps/site`, `apps/admin`, `packages/shared` (layer Nuxt) |
| Base de données | SQLite via Drizzle ORM (site en lecture seule, admin en lecture/écriture) |
| Validation du contenu | Schémas Zod partagés entre site et admin |
| Authentification | `nuxt-auth-utils` (session scellée, mots de passe hachés) |
| UI back-office | Nuxt UI |
| Images | `sharp` : conversion WebP et déclinaisons de tailles à l'envoi |
| Tests | Vitest + `@nuxt/test-utils` (unitaires et API), Playwright + axe-core (bout en bout) |
| Statistiques | Umami auto-hébergé, sans cookie |
| Conteneurs | Docker et Docker Compose, en dev comme en prod |

Écartés : React, PHP, Java (choix du développeur) et Directus (back-office générique,
moins adapté à un public non technique, plus lourd à héberger).

## Architecture

```
                      Internet
                         │
                ┌────────┴────────┐
                │  Caddy (HTTPS)  │
                └─┬──────┬──────┬─┘
   trail-besseges.fr  admin.trail-besseges.fr  stats.trail-besseges.fr
                  │      │      │
             ┌────┘      │      └────┐
         ┌───▼──┐    ┌───▼───┐   ┌───▼───┐
         │ site │    │ admin │   │ Umami │──▶ PostgreSQL
         └───┬──┘    └───┬───┘   └───────┘
     lecture │           │ lecture/écriture
         ┌───▼───────────▼───┐
         │ SQLite + /uploads │  (volume Docker)
         └───────────────────┘
```

- Le **site public** n'a ni authentification, ni route d'écriture, ni envoi de
  fichiers. Il ouvre la base en lecture seule. Caddy sert directement `/uploads`.
- L'**admin** est sur un sous-domaine séparé. Il réutilise les composants de
  sections du layer partagé pour l'aperçu.
- La **préprod** reprend la même architecture avec ses propres volumes, sur les
  sous-domaines `preprod.` et `admin.preprod.`.

## Hébergement et coûts

| Poste | Coût estimé |
|---|---|
| VPS OVH d'entrée de gamme (Ubuntu LTS, datacenter France) | ≈ 5 à 7 €/mois (à vérifier) |
| Domaine `trail-besseges.fr` | ≈ 8 €/an |
| Images Docker sur GHCR, GitHub Actions, CodeQL (dépôt public) | 0 € |
| Google Workspace (offre gratuite pour les associations) | 0 €, hors budget du site |
| Surveillance UptimeRobot (offre gratuite) | 0 € |
| **Total** | **≈ 6 à 8 €/mois** |

## Branches, versions et déploiement

```
push ──▶ dev ──PR──▶ preprod ──PR──▶ main
          │            │               │
  CI non bloquante  CI obligatoire  CI obligatoire
  v1.2.0-dev.N      v1.2.0-rc.N     v1.2.0
  (pas déployé)     → préprod       → production
```

Détails dans `specs/09-deploiement-ci-cd.md`.

## Palette

| Rôle | Couleur |
|---|---|
| Primaire | `#F5700F` |
| Secondaire | `#052D1F` |
| Fond | `#FAF7F0` |
| Neutre | `#E9E2D3` |
| Texte | `#1F2421` |

Règle : du texte blanc sur l'orange est interdit (contraste 2,9:1). Les boutons
orange portent un texte vert `#052D1F` (contraste 5,1:1).
