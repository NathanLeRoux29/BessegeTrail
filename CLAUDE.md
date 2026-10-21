# CLAUDE.md

Site du **Trail de Bessèges** (1re édition le 17 avril 2027) : un site public et un
back-office qui modifie le contenu de sections prédéfinies. Mise en ligne visée :
1er janvier 2027, développement à temps partiel. **Aller au plus simple.**

## Règles de collaboration

- **Git : l'utilisateur lance lui-même toutes les commandes qui écrivent** (add,
  commit, branch, checkout, merge, push, tag). Proposer seulement le titre du
  commit (et un corps si utile). Les commandes en lecture (status, log, diff) sont
  autorisées.
- Toute action visible sur GitHub (issues, labels, milestones, PR, réglages) est
  présentée à l'utilisateur et attend son accord explicite.
- Signaler le flou ou les contradictions, et proposer une alternative quand une
  fonctionnalité coûte cher pour peu de valeur.
- Rédiger en français : docs, issues, messages de commit, textes de l'interface,
  commentaires. Identifiants de code en anglais.

## Sources de vérité

| Quoi | Où |
|---|---|
| Décisions de cadrage, architecture, coûts | `docs/cadrage.md` |
| Comportement attendu, critères d'acceptation | `docs/specs/` (index : `docs/specs/README.md`) |
| Rendu visuel attendu | `docs/maquettes/` (`python3 -m http.server -d docs/maquettes 8000`) |
| Travail à faire | Issues GitHub, créées avec les templates de `.github/ISSUE_TEMPLATE/` |

Chaque critère d'acceptation a un identifiant stable (`ACC-15`, `DEP-06`…). Les
issues, les tests et les PR citent ces identifiants. Si l'implémentation doit
s'écarter d'une spec, mettre la spec à jour dans la même PR.

## Architecture cible

```
apps/site         Nuxt 4, site public. Lit la base en lecture seule. Aucune route d'écriture.
apps/admin        Nuxt 4, back-office. Authentification, écriture, envoi de fichiers, migrations.
packages/shared   Layer Nuxt : composants de sections, thème, schémas Zod, contenu de démo.
docker/           Dockerfiles, Compose (dev et prod), Caddyfile.
docs/             Cadrage, specs, maquettes, exploitation.
```

- Le back-office importe les **mêmes composants** que le site : l'aperçu est le
  rendu réel. Ne jamais dupliquer un composant de section dans `apps/admin`.
- Un bloc de contenu = une clé + un schéma Zod dans `packages/shared`, utilisé à la
  fois pour valider (admin) et pour typer le rendu (site).

## Commandes

Node 24 (`.nvmrc`) et pnpm 12 (champ `packageManager`). Depuis la racine :

| Commande | Effet |
|---|---|
| `pnpm install` | Installe les dépendances et génère les types Nuxt (`.nuxt/`) |
| `pnpm dev:site` / `pnpm dev:admin` | Lance le site (port 3000) ou l'admin (port 3001) |
| `pnpm lint` / `pnpm lint:fix` | ESLint sur tout le dépôt (mise en forme comprise, pas de Prettier) |
| `pnpm typecheck` | `nuxt typecheck` sur les deux apps (le layer partagé est inclus) |
| `pnpm test` | Vitest dans les trois paquets |
| `pnpm test:docker` | Construit les images Docker et vérifie DEP-01 et AUT-19 (lent, Docker requis) |
| `docker build --file docker/app.Dockerfile --build-arg APP=site --tag bessege/site .` | Construit l'image d'une app (`APP=site` ou `admin`) |

Avant de proposer un commit : `pnpm lint && pnpm typecheck && pnpm test`, plus
`pnpm test:docker` si `docker/`, une dépendance ou la configuration d'une app change.

- Versions communes dans le `catalog` de `pnpm-workspace.yaml` (`"nuxt": "catalog:"`).
- Une dépendance qui doit exécuter un script d'installation s'ajoute à
  `allowBuilds` dans `pnpm-workspace.yaml` (pnpm les bloque par défaut).
- TypeScript reste en 6.x tant que `vue-tsc` ne prend pas en charge TypeScript 7.
- Tests d'intégration d'une app : `@nuxt/test-utils/e2e` (`setup` construit et
  démarre l'app). Tests unitaires du layer : Vitest seul.

- Images Docker : un seul `docker/app.Dockerfile` paramétré par `APP`, construit
  depuis la racine. L'image finale ne contient que `.output`, tourne avec
  l'utilisateur `node` et a un healthcheck `wget` sur `/api/health`.

Prévues plus tard : `docker compose up` (#3), `pnpm test:e2e` (#4),
`pnpm content:pull` et `pnpm content:reset` (#74).

## TDD (obligatoire)

1. Écrire le test qui décrit le comportement attendu, le lancer, **le voir échouer**.
2. Écrire le code minimal pour le faire passer.
3. Refactoriser avec les tests au vert.

- Pas de code de production sans test rouge au préalable, y compris pour un
  correctif (test de non-régression d'abord).
- Le nom du test cite le critère : `it('ACC-15 : la carte entière mène à la page de l’épreuve', …)`.
- Unitaire et API : Vitest. Parcours et rendu : Playwright, avec un contrôle
  axe-core sur chaque page (aucune violation sérieuse ou critique).
- Pour une tâche d'infra non testable unitairement, la vérification est un check
  de CI ou une commande documentée dans l'issue.

## Conventions de code

- TypeScript strict. Composants Vue en `<script setup lang="ts">`.
- **Couleurs :** uniquement via les 5 jetons du thème (spec 04). Aucune couleur en
  dur. Jamais de texte blanc sur l'orange.
- **Accessibilité :** HTML sémantique, un seul `h1` par page, focus visible, cibles
  de 44 px minimum, `prefers-reduced-motion` respecté, texte alternatif obligatoire
  pour toute image porteuse d'information.
- **Sécurité :** jamais de `v-html` sans passer par l'assainisseur partagé (CNT-06).
  Valider toute entrée côté serveur avec le schéma Zod. Aucun secret dans le code :
  variables d'environnement en local, GitHub Environments en CI.
- Un lien externe s'ouvre dans un nouvel onglet avec `rel="noopener"` et le
  signale aux lecteurs d'écran.

## Contenu et code

- Le code monte par Git (`dev → preprod → main`). Le contenu (base SQLite et
  uploads) reste sur le serveur et ne descend que `prod → préprod → local`.
- Ajouter un champ : prévoir une valeur par défaut dans le schéma. Renommer,
  déplacer ou supprimer : écrire une migration de contenu testée (CNT-30 à CNT-33).
- Ne jamais versionner de contenu réel ni de base de données.

## Branches, commits et versions

```
push ──▶ dev ──PR──▶ preprod ──PR──▶ main
```

- On travaille et on pousse directement sur `dev` : pas de branche par issue.

- Conventional Commits, description en français : `feat(site): galerie avec visionneuse`.
  Portées : `site`, `admin`, `shared`, `contenu`, `auth`, `infra`, `ci`, `docs`.
- Merges `dev → preprod` et `preprod → main` en *merge commit*, jamais en squash
  (semantic-release a besoin des messages).
- `dev` n'est pas déployé ; `preprod` et `main` le sont automatiquement après la CI.

## Issues

- Trois templates : fonctionnalité, bug, tâche technique (`.github/ISSUE_TEMPLATE/`).
- Pour transformer une spec en issues, utiliser le skill `creer-issues-depuis-spec`.
- Pour traiter une issue, utiliser le skill `traiter-issue`.
- `gh issue view N` échoue sur ce dépôt (avertissement GitHub) : toujours passer
  `--json title,body,…`.
- Labels : `type:feature`, `type:bug`, `type:tech`, `domaine:*`, `P1`, `P2`.
