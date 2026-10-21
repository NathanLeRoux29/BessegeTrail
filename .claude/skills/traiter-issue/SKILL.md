---
name: traiter-issue
description: Use when the user asks to work on, implement, fix or start a GitHub issue of this project (« traite l'issue #12 », « go #4 », « attaque la suivante », « on fait la #7 »).
---

# Traiter une issue

## Principe

Comprendre avant de coder, faire valider l'approche **une fois**, puis livrer en
TDD une issue vérifiée, sans toucher à git ni à GitHub. L'utilisateur valide, lance
les commandes git et ferme l'issue par son commit.

**REQUIRED SUB-SKILL :** test-driven-development pour les étapes 6 à 8.

## Étapes

1. **Lire** : `gh issue view N --json title,body,labels,milestone,state`
   (sans `--json`, la commande échoue sur ce dépôt). Lire la spec et la maquette
   citées, et `CLAUDE.md`.
2. **Vérifier le point de départ** :
   - chaque issue de « Dépendances » est fermée (`gh issue view D --json state`) ;
   - `git status --short` est vide et `HEAD` est sur `dev`, égal à `origin/dev`.
   Sinon : s'arrêter et dire à l'utilisateur quoi faire (commit, pull…).
3. **Analyser** : reformuler en 3 à 5 lignes ce que l'issue demande vraiment.
   Lister les flous, les contradictions avec la spec, les actions qui reviennent
   à l'utilisateur. Issue trop grosse pour une journée : proposer un découpage.
4. **Explorer le code** concerné : fichiers existants, conventions, tests voisins.
5. **Proposer et attendre** (seul point d'arrêt) :
   - pour chaque vrai choix : 2 ou 3 options, avantages, inconvénients, une
     recommandation (s'il n'y a pas de vrai choix, le dire) ;
   - le plan de tests : **cas de réussite et cas d'échec** (entrée invalide, liste
     vide, élément masqué, service indisponible…), chacun nommé avec l'identifiant
     du critère (`ACC-15 : …`) ;
   - le déroulé.
   Ne rien écrire avant le « go » de l'utilisateur.
6. **RED** : écrire les tests, les lancer, montrer qu'ils échouent **pour la
   bonne raison** (fonctionnalité absente, pas une faute de frappe).
7. **GREEN** : code minimal, tests au vert.
8. **REFACTOR** : nettoyer, tests toujours au vert.
9. **Vérifier** : `pnpm lint && pnpm typecheck && pnpm test`, plus les commandes
   de la section « Vérification » de l'issue. Arrêter tout serveur, conteneur ou
   processus lancé pour vérifier (`pgrep -af nuxt`, `docker ps`).
10. **Documenter** : `CLAUDE.md` (commandes, conventions), README, spec si le
    comportement a dû s'écarter.
11. **Rendre compte** :
    - ce qui a été fait, la preuve rouge puis verte, les écarts et leur raison ;
    - les actions restantes de l'utilisateur ;
    - la commande complète :
      `git add … && git commit -m "<type>(<portée>): …" -m "<détails>" -m "Closes #N"`.

## Interdits

| Interdit | À la place |
|---|---|
| Coder avant le « go » | Présenter l'étape 5 et attendre |
| Une commande git qui écrit (add, commit, checkout, merge, pull, push) | La donner à l'utilisateur |
| Modifier l'issue sur GitHub (cases, texte, fermeture) | Le proposer ; `Closes #N` la ferme |
| Faire le travail d'une autre issue | Le noter pour l'issue concernée |
| Un test qui passe du premier coup | Le corriger jusqu'à le voir échouer |
| Laisser tourner un serveur ou un conteneur | Vérifier puis arrêter avant de rendre la main |
