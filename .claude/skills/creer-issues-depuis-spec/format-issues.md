# Format des issues

Un formulaire GitHub (`.github/ISSUE_TEMPLATE/*.yml`) produit un corps Markdown :
un titre `### <label du champ>` par champ, suivi de la valeur. Une issue créée par
`gh issue create --body-file` doit reproduire **exactement** cette structure (mêmes
titres, même ordre) pour être identique à une issue créée depuis l'interface.

Si un template change, mettre ce fichier à jour dans la même PR.

## Fonctionnalité — `1-fonctionnalite.yml`

Labels : `type:feature`, `domaine:<x>`, `P1` ou `P2`.

```markdown
### Domaine

Site public

### Priorité

P1

### Spec

docs/specs/10-site-infos-pratiques.md

### Critères couverts

INF-10, INF-11

### User story

En tant que visiteur, je veux lire les réponses aux questions fréquentes afin de ne pas avoir à écrire aux organisateurs.

### Contexte

Maquette : `docs/maquettes/site/infos-pratiques.html`, section « Questions fréquentes ».

### Critères d'acceptation

- [ ] **INF-10** — La FAQ affiche une liste de questions dépliables (30 au maximum). Chaque réponse est un texte mis en forme.
- [ ] **INF-11** — Les questions utilisent `<details>`/`<summary>` (accessibles et fonctionnelles sans JavaScript).

### Plan de tests

- Unitaire : le composant rend une `<details>` par question et rien si la liste est vide.
- E2E : une question se déplie au clic et au clavier, JavaScript désactivé.
- Accessibilité : axe-core sans violation sérieuse ou critique.

### Dépendances

#12, #14

### Checklist TDD

- [ ] Tests du plan écrits et rouges avant le code
- [ ] Code minimal pour passer au vert
- [ ] Refactorisation avec les tests au vert
- [ ] Chaque critère couvert a au moins un test qui cite son identifiant

### Définition de « fini »

- [ ] Conforme à la maquette, sur mobile et ordinateur
- [ ] Aucune violation axe-core sérieuse ou critique
- [ ] Lint, types et tests au vert dans la CI
- [ ] Spec ou documentation mise à jour si le comportement a changé
```

## Tâche technique — `3-tache-technique.yml`

Labels : `type:tech`, `domaine:<x>`, `P1` ou `P2`.

```markdown
### Domaine

Infra et CI/CD

### Priorité

P1

### Spec

docs/specs/09-deploiement-ci-cd.md

### Critères couverts

DEP-06, DEP-07

### Objectif

<pourquoi, ce que ça débloque>

### Travail à faire

- [ ] <étape>

### Critères d'acceptation

- [ ] **DEP-06** — <texte du critère, recopié de la spec>

### Vérification

- Check CI : <…>

### Impacts

Aucun

### Dépendances

Aucune

### Checklist TDD

- [ ] Test ou vérification automatisée écrit avant la mise en place (sinon, justification dans l'issue)
- [ ] Vérification au vert
- [ ] Refactorisation avec la vérification au vert

### Définition de « fini »

- [ ] Lint, types et tests au vert dans la CI
- [ ] Documentation à jour (README, docs/exploitation.md ou CLAUDE.md)
- [ ] Aucun secret dans le code ni dans les logs
```

## Bug — `2-bug.yml`

Rarement créé depuis une spec. Champs dans l'ordre : Domaine, Environnement,
Gravité, Version, Appareil et navigateur, Étapes pour reproduire, Résultat attendu,
Résultat obtenu, Dépendances, Checklist TDD (test de non-régression rouge avant le
correctif ; correctif minimal, test au vert ; cause identifiée et expliquée dans la
PR), Définition de « fini » (CI au vert ; vérifié en préprod). Labels : `type:bug`,
`domaine:<x>`.

## Valeurs autorisées

**Domaine** (texte du champ → label → préfixe du titre) :

| Champ « Domaine » | Label | Préfixe du titre |
|---|---|---|
| Site public | `domaine:site` | `[site]` |
| Back-office | `domaine:admin` | `[admin]` |
| Contenu | `domaine:contenu` | `[contenu]` |
| Authentification et sécurité | `domaine:auth` | `[auth]` |
| Thème | `domaine:theme` | `[theme]` |
| Infra et CI/CD | `domaine:infra` | `[infra]` |

**Milestones** (ordre de réalisation) :

| Milestone | Contenu |
|---|---|
| `M1 Socle` | Monorepo, Docker, CI, protections GitHub, thème, schémas de contenu |
| `M2 Site public` | Pages et sections du site avec le contenu de démo |
| `M3 Back-office` | Authentification, éditeur, publication, tableau de bord |
| `M4 Mise en ligne` | Serveur, déploiement, sauvegardes, surveillance, contenu réel |

## Créer les labels et milestones manquants

À lancer uniquement après accord de l'utilisateur, et seulement pour ceux que
`gh label list` / `gh api repos/{owner}/{repo}/milestones` ne renvoient pas.

```bash
gh label create "type:feature" --color 1D76DB --description "Fonctionnalité"
gh label create "type:bug" --color D73A4A --description "Bug"
gh label create "type:tech" --color 5319E7 --description "Tâche technique"
gh label create "domaine:site" --color F5700F
gh label create "domaine:admin" --color 052D1F
gh label create "domaine:contenu" --color C2B280
gh label create "domaine:auth" --color B60205
gh label create "domaine:theme" --color FBCA04
gh label create "domaine:infra" --color 0E8A16
gh label create "P1" --color B60205 --description "Indispensable à la mise en ligne"
gh label create "P2" --color C5DEF5 --description "Si le temps le permet"
gh api repos/{owner}/{repo}/milestones -f title="M1 Socle"
```
