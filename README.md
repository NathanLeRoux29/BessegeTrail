# Trail de Bessèges

Site internet du **Trail de Bessèges** (Gard), 1re édition le samedi 17 avril 2027,
organisé par l'association Horizon Cévennes.

Le projet comprend :

- un **site public** : accueil, page Infos pratiques, une page par épreuve, pages
  légales ;
- un **back-office** pour modifier le contenu des sections prédéfinies (textes,
  images, liens, visibilité), avec un aperçu en direct avant publication.

Les inscriptions et les résultats ne sont pas gérés par le site : ce sont des liens
vers des plateformes externes.

## État du projet

Le code n'est pas encore écrit. Le projet avance par phases, chacune validée avant
la suivante.

| Phase | Contenu | État |
|---|---|---|
| 1. Cadrage | Stack, hébergement, déploiement | ✅ Fait |
| 2. Spécifications | Specs par domaine dans `docs/specs/` | ✅ Fait |
| 3. Maquettes | Maquettes HTML interactives dans `docs/maquettes/` | ✅ Fait |
| 4. Outillage | Templates d'issues, skill Claude Code, `CLAUDE.md` | À faire |
| 5. Backlog | Issues GitHub ordonnées | À faire |

## Documentation

- [Cadrage](docs/cadrage.md) : décisions techniques, architecture, coûts.
- [Spécifications](docs/specs/README.md) : user stories et critères d'acceptation.
- [Maquettes](docs/maquettes/index.html) : site public et back-office.

### Voir les maquettes

```bash
python3 -m http.server -d docs/maquettes 8000
```

Puis ouvrir <http://localhost:8000>. Les modifications faites dans le back-office
de la maquette sont conservées dans le navigateur.

## Stack prévue

- **Nuxt 4** (Vue) en monorepo pnpm : `apps/site` (public, lecture seule),
  `apps/admin` (back-office), `packages/shared` (composants, thème, schémas Zod).
- **SQLite** (Drizzle) pour le contenu, images converties en WebP.
- **Tests** : Vitest, Playwright, axe-core. Développement en TDD.
- **Docker** en dev comme en prod, derrière **Caddy** (HTTPS automatique).
- **Umami** auto-hébergé pour les statistiques de visite, sans cookie.
- Hébergement sur un VPS OVH.

## Branches et versions

```
push ──▶ dev ──PR──▶ preprod ──PR──▶ main
          CI          CI obligatoire   CI obligatoire
          X.Y.Z-dev.N X.Y.Z-rc.N       X.Y.Z
          (local)     préproduction    production
```

Les messages de commit suivent les
[Conventional Commits](https://www.conventionalcommits.org/fr/) : les versions
sont calculées automatiquement par semantic-release.

Le code monte vers la production par Git. Le contenu saisi dans le back-office
reste sur le serveur et ne circule que dans l'autre sens (production → préprod →
poste local). Voir la [spec 05](docs/specs/05-contenu-publication.md).
