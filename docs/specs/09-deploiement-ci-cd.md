# 09 — Déploiement, CI/CD et maintenance GitHub

## Objectif

Livrer le site de façon fiable et reproductible, à faible coût, avec une chaîne
automatisée : qualité vérifiée à chaque changement, versions tracées, déploiement
en un clic de merge, sauvegardes et surveillance.

## Environnements

| Environnement | Branche | Où | URL |
|---|---|---|---|
| Dev | `dev` | Poste local, Docker Compose | `localhost` |
| Préprod | `preprod` | VPS OVH | `preprod.trail-besseges.fr`, `admin.preprod.trail-besseges.fr` |
| Production | `main` | VPS OVH | `trail-besseges.fr`, `admin.trail-besseges.fr`, `stats.trail-besseges.fr` |

`www.trail-besseges.fr` redirige vers `trail-besseges.fr`.

## User stories

- En tant que développeur, je veux lancer tout le projet avec une seule commande
  afin de travailler en local dans les mêmes conditions que la prod.
- En tant que développeur, je veux qu'une CI vérifie chaque changement afin de ne
  jamais livrer une régression en préprod ou en prod.
- En tant que développeur, je veux qu'un merge vers `preprod` ou `main` déploie
  automatiquement afin de ne pas faire de manipulation manuelle sur le serveur.
- En tant que développeur, je veux pouvoir revenir à la version précédente en
  quelques minutes afin de réparer un déploiement raté.
- En tant qu'organisateur, je veux que le contenu soit sauvegardé chaque jour afin
  de ne rien perdre en cas de panne.

## Critères d'acceptation

### Docker

- **DEP-01** — Chaque app (`site`, `admin`) a une image Docker multi-étapes basée
  sur Node 24 LTS (Alpine), exécutée par un utilisateur non root, avec un
  `HEALTHCHECK` sur `/api/health`.
- **DEP-02** — `docker compose up` lance l'environnement de dev complet (site,
  admin, avec rechargement à chaud). Umami est optionnel en dev (profil Compose
  `stats`).
- **DEP-03** — Le Compose de production lance : Caddy, site et admin de prod, site
  et admin de préprod, Umami et sa base PostgreSQL. Chaque environnement a ses
  propres volumes (base SQLite, uploads).
- **DEP-04** — Caddy obtient et renouvelle automatiquement les certificats HTTPS,
  sert `/uploads` directement, et protège la préprod (site et admin) par une
  authentification HTTP basique.
- **DEP-05** — La préprod envoie `X-Robots-Tag: noindex` et un `robots.txt` qui
  interdit l'indexation.

### CI (GitHub Actions)

- **DEP-06** — Le workflow `ci` s'exécute à chaque push sur `dev` et sur chaque PR
  vers `preprod` ou `main`. Il enchaîne : installation (cache pnpm), lint (ESLint),
  vérification des types (`nuxi typecheck`), tests unitaires et d'API (Vitest),
  construction des images Docker, tests de bout en bout (Playwright et axe-core)
  sur les images construites.
- **DEP-07** — Le résultat de chaque étape est un *check* nommé de façon stable
  (`lint`, `typecheck`, `test`, `build`, `e2e`), utilisable dans les règles de
  protection.
- **DEP-08** — La CI échoue si la couverture de tests du layer partagé et des
  routes d'API de l'admin passe sous 80 %.
- **DEP-09** — Un échec de CI sur `dev` ne bloque pas le push, mais il est visible
  sur le commit et notifié par e-mail.

### Versions

- **DEP-10** — Les messages de commit suivent Conventional Commits (`feat:`,
  `fix:`, `chore:`…). Un hook local (commitlint) et un check de CI le vérifient.
- **DEP-11** — semantic-release crée un tag et une release GitHub :
  - à chaque push sur `dev` : version `X.Y.Z-dev.N` ;
  - à chaque merge vers `preprod` : version `X.Y.Z-rc.N` ;
  - à chaque merge vers `main` : version `X.Y.Z`, avec un changelog.
- **DEP-12** — Les merges `dev → preprod` et `preprod → main` utilisent un *merge
  commit* (pas de squash) pour conserver les messages de commit nécessaires au
  calcul de version.
- **DEP-13** — Les images Docker sont publiées sur GHCR avec le numéro de version
  comme tag. Le numéro de version est injecté dans l'image et affiché dans le
  back-office (spec 07, DSH-04).

### Déploiement

- **DEP-14** — Après la release sur `preprod` (respectivement `main`), un job
  déploie sur la préprod (respectivement la prod) : connexion SSH au VPS avec une
  clé dédiée, mise à jour du tag de version, `docker compose pull` puis
  `up -d`.
- **DEP-15** — L'admin est démarré avant le site (il exécute les migrations). Le
  déploiement échoue si l'endpoint de santé ne répond pas dans les 60 secondes.
- **DEP-16** — Les secrets de déploiement sont stockés dans des *GitHub
  Environments* (`preprod`, `production`) et ne sont accessibles qu'aux jobs de
  déploiement de la branche correspondante.
- **DEP-17** — Un workflow manuel « Rollback » redéploie une version choisie
  (saisie du tag) sur un environnement.

### Protection des branches (rulesets GitHub)

- **DEP-18** — `main` et `preprod` : PR obligatoire, checks `lint`, `typecheck`,
  `test`, `build`, `e2e` obligatoires, push direct, force-push et suppression
  interdits. Aucune approbation obligatoire (développeur seul). L'option « branche
  à jour avec la cible » n'est pas activée : avec des merge commits, elle
  obligerait à refusionner `preprod` dans `dev` avant chaque PR.
- **DEP-19** — `preprod` n'accepte que des PR venant de `dev`, et `main` que des PR
  venant de `preprod` (vérifié par un check de CI).
- **DEP-20** — `dev` : push direct autorisé, force-push et suppression interdits.

### Sécurité et maintenance GitHub

- **DEP-21** — Dependabot est configuré pour npm, Docker et GitHub Actions, avec une
  vérification hebdomadaire, des mises à jour groupées (mineures et correctifs
  dans une seule PR) et des PR ciblant `dev`.
- **DEP-22** — CodeQL analyse le code JavaScript/TypeScript sur chaque PR et chaque
  semaine.
- **DEP-23** — Le secret scanning et la *push protection* sont activés.
- **DEP-24** — Les actions GitHub tierces sont épinglées par SHA de commit.

### Serveur

- **DEP-25** — Le VPS (Ubuntu LTS) n'accepte que les connexions SSH par clé, sans
  connexion root. Le pare-feu n'ouvre que les ports 22, 80 et 443. Les mises à jour
  de sécurité sont installées automatiquement.
- **DEP-26** — La procédure d'installation du serveur depuis zéro est documentée
  dans `docs/exploitation.md` et reproductible en moins d'une heure.

### Sauvegardes et surveillance

- **DEP-27** — Chaque nuit, une tâche sauvegarde la base SQLite de prod (copie
  cohérente via `sqlite3 .backup`), le dossier uploads et la base Umami, puis les
  envoie sur le Google Drive de l'association avec `rclone`. 30 jours de
  sauvegardes sont conservés.
- **DEP-28** — La tâche écrit son résultat (date, succès ou échec) dans un fichier
  lu par l'admin (spec 07, DSH-03).
- **DEP-29** — La procédure de restauration est documentée et testée au moins une
  fois avant la mise en ligne.
- **DEP-30** — UptimeRobot surveille `trail-besseges.fr` et
  `admin.trail-besseges.fr/api/health` toutes les 5 minutes et alerte le
  développeur par e-mail.

### Circulation du contenu entre environnements

Voir la spec 05 (CNT-28 à CNT-33) pour le principe : le code monte vers la prod,
le contenu descend de la prod.

- **DEP-31** — Avant chaque déploiement en production, le job de déploiement fait
  une sauvegarde de la base et des uploads de prod, nommée avec la version en
  cours. Le workflow « Rollback » (DEP-17) propose de restaurer cette sauvegarde
  en même temps que la version précédente.
- **DEP-32** — Avant chaque déploiement en préprod, le contenu de la préprod est
  remplacé par une copie du contenu de prod (base et uploads). Les migrations de
  la nouvelle version sont donc testées sur le vrai contenu avant d'arriver en
  prod.
- **DEP-33** — La copie vers la préprod retire les comptes et les sessions des
  éditeurs. La préprod garde ses propres comptes de test.
- **DEP-34** — Une commande `pnpm content:pull` récupère sur le poste du
  développeur une copie du contenu de prod (dernière sauvegarde de la nuit, ou
  copie à la demande par SSH), sans comptes ni sessions, et la charge dans
  l'environnement Docker local. Une commande `pnpm content:reset` revient au
  contenu de démonstration.
- **DEP-35** — Aucune commande ni aucun workflow n'envoie de contenu du poste
  local ou de la préprod vers la prod.

## Hors périmètre

- Déploiement de l'environnement dev sur un serveur.
- Haute disponibilité, équilibrage de charge, Kubernetes.
- CDN.
- Infrastructure as code (Terraform, Ansible) : la procédure documentée suffit pour
  un seul serveur.
- Environnements de prévisualisation par PR.
