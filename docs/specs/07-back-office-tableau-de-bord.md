# 07 — Back-office : tableau de bord et statistiques

## Objectif

Offrir une page d'accueil du back-office qui répond en un coup d'œil à trois
questions : *Le site fonctionne-t-il ?* *Est-il consulté ?* *Qu'est-ce qui reste à
publier ?* Elle donne aussi un accès rapide à chaque page.

## Maquette de principe

```
┌──────────────────────────────────────────────────────────────────────┐
│ Bonjour <prénom> 👋                           Départ dans 180 jours  │
├──────────────────────────────────────────────────────────────────────┤
│ ÉTAT DU SITE                                                         │
│ ● Site en ligne   ● Dernière sauvegarde : cette nuit 03:00   v1.4.0  │
├──────────────────────────────────────────────────────────────────────┤
│ FRÉQUENTATION (30 derniers jours)            [7 j] [30 j] [Tout]     │
│ Visiteurs 1 240  │  Pages vues 3 980  │  Clics « S'inscrire » 312    │
│ ▁▂▂▃▅▄▆▇▆▅  (courbe des visiteurs par jour)                          │
│ Pages les plus vues        │ Clics inscription par épreuve           │
│ Provenance (Google, Facebook…)  │ Appareils (mobile / ordinateur)    │
├──────────────────────────────────────────────────────────────────────┤
│ À FAIRE                                                              │
│ ⚠ Accueil : modifications non publiées (Léa, hier 18:42)  [Ouvrir]  │
│ ⚠ Trail 13 km : lien d'inscription manquant               [Ouvrir]  │
├──────────────────────────────────────────────────────────────────────┤
│ PAGES                                                                │
│ [Accueil ● Publié] [Trail 40 km ● Publié] [Trail 20 km ⚠ Brouillon]  │
│ [Header] [Footer] [Paramètres] …                                     │
└──────────────────────────────────────────────────────────────────────┘
```

## User stories

- En tant qu'éditeur, je veux savoir si le site est en ligne et sauvegardé afin
  d'être rassuré sans demander au développeur.
- En tant qu'organisateur, je veux connaître le nombre de visiteurs et de clics
  sur « S'inscrire » afin de mesurer l'effet de notre communication.
- En tant qu'éditeur, je veux voir ce qui n'est pas encore publié ou ce qui manque
  afin de ne rien oublier avant l'événement.
- En tant qu'éditeur, je veux accéder à chaque page en un clic afin de la modifier
  rapidement.

## Critères d'acceptation

### En-tête

- **DSH-01** — Le tableau de bord est la page affichée après la connexion. Il salue
  l'éditeur par son prénom et affiche le nombre de jours avant le départ.

### État du site

- **DSH-02** — Un indicateur « Site en ligne » est vert si l'endpoint de santé du
  site public répond correctement, rouge sinon (vérifié au chargement du tableau
  de bord, délai maximal 5 secondes).
- **DSH-03** — La date et le résultat de la dernière sauvegarde sont affichés. Si
  la dernière sauvegarde réussie date de plus de 48 heures, l'indicateur passe au
  rouge avec le message « Prévenir le développeur ».
- **DSH-04** — La version déployée (ex. `v1.4.0`) est affichée.
- **DSH-05** (P2) — L'espace disque restant sur le serveur est affiché, avec une
  alerte en dessous de 20 %.

### Fréquentation (données Umami)

- **DSH-06** — Le tableau de bord affiche, pour une période choisie (7 jours,
  30 jours, depuis le début) : visiteurs uniques, pages vues, clics sur les
  boutons d'inscription.
- **DSH-07** — Une courbe affiche le nombre de visiteurs par jour sur la période.
- **DSH-08** — Le tableau de bord affiche les 5 pages les plus vues, les clics
  d'inscription par épreuve, les 5 principales provenances et la répartition par
  type d'appareil.
- **DSH-09** — Les données sont récupérées côté serveur par l'admin via l'API
  d'Umami (le jeton d'API n'est jamais envoyé au navigateur). Elles sont mises en
  cache 5 minutes.
- **DSH-10** — Si Umami ne répond pas, le bloc affiche « Statistiques
  indisponibles pour le moment » et le reste du tableau de bord fonctionne.

### À faire

- **DSH-11** — La liste « À faire » affiche chaque page ayant des modifications
  non publiées, avec l'auteur, la date et un bouton « Ouvrir ».
- **DSH-12** — La liste « À faire » signale les contenus incomplets : épreuve
  visible sans lien d'inscription, image sans texte alternatif, date de départ
  non renseignée.
- **DSH-13** — Si tout est en ordre, le bloc affiche « Rien à faire, tout est
  publié ✔ ».

### Accès aux pages

- **DSH-14** — Le tableau de bord affiche une tuile par page éditable (accueil,
  infos pratiques, 5 épreuves, éléments communs, 2 pages légales) avec son état
  (« Publié », « Brouillon », « Masquée » pour une épreuve).

## Hors périmètre

- Graphiques de charge serveur (CPU, mémoire) : la surveillance technique se fait
  via UptimeRobot et les alertes e-mail au développeur.
- Statistiques détaillées par visiteur ou en temps réel.
- Export des statistiques (l'interface Umami reste accessible au développeur sur
  `stats.trail-besseges.fr`).
- Notifications ou e-mails envoyés aux éditeurs.
- Vérification automatique que les liens externes fonctionnent (envisageable plus
  tard ; en V1, le bouton « Tester le lien » de l'éditeur suffit).
