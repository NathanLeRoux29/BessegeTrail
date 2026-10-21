---
name: creer-issues-depuis-spec
description: Use when the user asks to create, generate, prepare or split GitHub issues from a spec in docs/specs/ (« crée les issues de la spec 02 », « génère le backlog », « découpe la spec en issues »), or to fill a milestone with issues.
---

# Créer des issues depuis une spec

## Principe

Chaque critère d'acceptation P1 et P2 de la spec est couvert par **exactement une**
issue. Chaque issue a le même corps que si elle avait été remplie avec le
formulaire GitHub, et ses dépendances pointent vers de **vrais numéros d'issues**.
Rien n'est créé sur GitHub sans l'accord explicite de l'utilisateur.

Le format exact des corps, les labels, les milestones et les commandes de création
sont dans `format-issues.md` (même dossier). Le lire avant de rédiger.

## Étapes

1. **Lire** la spec, `docs/specs/README.md`, les specs qu'elle cite et la maquette
   concernée dans `docs/maquettes/`.
2. **Inventorier GitHub** (lecture seule) :
   `gh issue list --state all --limit 500 --json number,title,body,milestone`,
   `gh label list`, `gh api repos/{owner}/{repo}/milestones`.
   Un critère déjà cité dans le champ « Critères couverts » d'une issue existante
   n'est pas repris.
3. **Découper** (voir règles ci-dessous) et choisir le milestone de chaque issue.
4. **Résoudre les dépendances** :
   - dans la spec : par l'ordre de création (étape 7) ;
   - vers une autre spec : chercher l'identifiant du critère requis (ex. `CNT-06`)
     dans les issues existantes et écrire son numéro (`#8`) ;
   - si aucune issue ne le couvre encore : écrire `CNT-06 (spec 05), pas encore
     d'issue` et le signaler à l'utilisateur.
   « Aucune » seulement s'il n'y a réellement aucun prérequis.
5. **Rédiger** chaque corps dans un fichier du scratchpad, au format de
   `format-issues.md`. Le texte des critères est recopié mot pour mot de la spec.
   Chaque ligne du plan de tests cite l'identifiant du critère qu'elle vérifie.
6. **Présenter et attendre** : tableau (ordre, titre, type, labels, milestone,
   critères, dépendances), tableau de couverture (chaque critère → une issue),
   labels et milestones à créer, dépendances non résolues, chemin des fichiers de
   corps. Ne rien créer avant un « oui » explicite.
7. **Créer**, après accord : labels et milestones manquants, puis les issues dans
   l'ordre des dépendances. Avant chaque `gh issue create`, remplacer les
   références aux issues du lot par les numéros déjà obtenus. Ne pas corriger
   après coup avec `gh issue edit`.
8. **Rendre compte** : numéro, titre et URL de chaque issue, critères non couverts
   (il ne doit y en avoir aucun), dépendances non résolues.

## Règles de découpage

| Règle | Détail |
|---|---|
| Taille | Un livrable testable, environ une journée de travail. |
| Regroupement | Critères d'un même composant ou d'une même section ensemble. |
| Priorité | Ne pas mélanger P1 et P2 dans une issue. |
| Type | Fonctionnalité si un utilisateur voit le résultat, tâche technique sinon. |
| Socle d'abord | Schéma de contenu, route ou composant de base avant les détails. |
| Titre | `[domaine] Libellé court`, 70 caractères maximum, en français. |

## Erreurs fréquentes

- Dépendance en texte libre (« le header de la spec 01 ») : chercher l'issue.
- Numéros provisoires (« Issue 1 ») puis `gh issue edit` : créer dans l'ordre.
- Issue sans milestone : toujours en choisir un (`format-issues.md`).
- Plan de tests sans identifiants : chaque test cite son critère.
- Labels créés sans demander : ils font partie de ce qui est présenté à l'étape 6.
