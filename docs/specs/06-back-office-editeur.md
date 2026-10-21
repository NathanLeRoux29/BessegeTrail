# 06 — Back-office : éditeur de pages

## Objectif

Permettre à un éditeur non technique de modifier le contenu de chaque page en
voyant immédiatement le rendu : l'aperçu du site à gauche, le formulaire à droite.

## Navigation du back-office

```
┌───────────────────────┬────────────────────────────────────────────┐
│ Trail de Bessèges     │                                            │
│                       │                                            │
│ Tableau de bord       │                                            │
│                       │                                            │
│ PAGES                 │                                            │
│   Accueil             │              Contenu de la page            │
│   Infos pratiques     │                                            │
│   Épreuves  ▸ (5)     │                                            │
│   Mentions légales    │                                            │
│   Confidentialité     │                                            │
│                       │                                            │
│ ÉLÉMENTS COMMUNS      │                                            │
│   Header              │                                            │
│   Footer              │                                            │
│   Paramètres généraux │                                            │
│                       │                                            │
│ Mon compte            │                                            │
│ Se déconnecter        │                                            │
└───────────────────────┴────────────────────────────────────────────┘
```

## Écran d'édition

```
┌────────────────────────────────────────────────────────────────────────┐
│ Accueil   ● Modifications non publiées    [Annuler] [Enregistrer] [Publier] │
├──────────────────────────────────────────┬─────────────────────────────┤
│ [🖥 Ordinateur] [📱 Mobile]               │ ▸ Bannière                  │
│ ┌──────────────────────────────────────┐ │ ▾ Présentation   [👁 Visible]│
│ │                                      │ │   Titre      [__________]   │
│ │        Aperçu de la page             │ │   Texte      [__________]   │
│ │   (section en cours surlignée)       │ │   Image      [Remplacer]    │
│ │                                      │ │ ▸ Les épreuves              │
│ │                                      │ │ ▸ Galerie                   │
│ └──────────────────────────────────────┘ │ ▸ …                         │
└──────────────────────────────────────────┴─────────────────────────────┘
```

## User stories

- En tant qu'éditeur, je veux voir le rendu de mes modifications pendant que je
  tape afin de savoir exactement ce que verront les visiteurs.
- En tant qu'éditeur, je veux vérifier le rendu sur mobile afin de m'assurer que
  la page reste lisible sur téléphone.
- En tant qu'éditeur, je veux masquer une section d'un clic afin de retirer une
  information sans la supprimer.
- En tant qu'éditeur, je veux remplacer une image facilement afin de mettre à jour
  les photos.
- En tant qu'éditeur, je veux être prévenu si je quitte la page sans enregistrer
  afin de ne pas perdre mon travail.

## Critères d'acceptation

### Mise en page de l'éditeur

- **EDI-01** — L'écran d'édition est divisé en deux : l'aperçu à gauche (environ
  60 % de la largeur), le formulaire à droite. Il est conçu pour un écran
  d'ordinateur d'au moins 1280 px de large.
- **EDI-02** — Le formulaire liste les sections de la page dans l'ordre d'affichage,
  sous forme de panneaux dépliables. Une seule section est dépliée à la fois.
- **EDI-03** — Les pages Header, Footer et Paramètres généraux utilisent le même
  écran, avec l'accueil comme aperçu.

### Aperçu

- **EDI-04** — L'aperçu affiche la page avec les **mêmes composants** que le site
  public, dans une iframe servie par l'admin, alimentée par le brouillon en cours.
- **EDI-05** — Toute saisie dans le formulaire met à jour l'aperçu en moins d'une
  seconde, sans enregistrer.
- **EDI-06** — Un sélecteur bascule l'aperçu entre la largeur ordinateur (1280 px,
  mise à l'échelle) et mobile (390 px).
- **EDI-07** — Déplier une section dans le formulaire fait défiler l'aperçu jusqu'à
  cette section et la met en évidence.
- **EDI-08** (P2) — Cliquer sur une section dans l'aperçu déplie son formulaire.
- **EDI-09** — Les liens de l'aperçu sont désactivés (aucune navigation hors de
  l'éditeur).

### Formulaires

- **EDI-10** — Chaque champ a un libellé en français clair, et un texte d'aide
  quand c'est utile (ex. « Lien vers la page d'inscription sur la plateforme
  externe »).
- **EDI-11** — Les erreurs de validation s'affichent sous le champ concerné, en
  français, et le bouton « Enregistrer » indique le nombre d'erreurs.
- **EDI-12** — Un interrupteur « Visible / Masquée » est disponible sur chaque
  section masquable et sur chaque épreuve.
- **EDI-13** — Les listes (FAQ, blocs d'infos pratiques, partenaires, galerie,
  menu) permettent d'ajouter, supprimer (avec confirmation) et réordonner des
  éléments avec des boutons « Monter » et « Descendre ».
- **EDI-14** — Un champ image affiche la miniature actuelle, un bouton
  « Remplacer », le champ texte alternatif, et une barre de progression pendant
  l'envoi.
- **EDI-15** — Les textes mis en forme utilisent un éditeur simple avec les seuls
  boutons autorisés (gras, italique, lien, listes, titre).
- **EDI-16** — Les champs URL affichent un lien « Tester le lien » qui ouvre l'URL
  dans un nouvel onglet.

### Enregistrement et publication

- **EDI-17** — Le bandeau du haut affiche l'état de la page : « Publié » ou
  « Modifications non publiées », avec la date et l'auteur de la dernière action.
- **EDI-18** — « Enregistrer » sauvegarde le brouillon (spec 05, CNT-07).
- **EDI-19** — « Publier » enregistre puis publie la page après une confirmation
  rappelant que les modifications seront visibles par tous.
- **EDI-20** — « Annuler les modifications » demande une confirmation puis supprime
  les brouillons de la page.
- **EDI-21** — Quitter la page (lien, fermeture de l'onglet) avec des saisies non
  enregistrées affiche une demande de confirmation.
- **EDI-22** — Un message de succès ou d'erreur s'affiche après chaque action.
- **EDI-23** — Un lien « Voir la page en ligne » ouvre la version publiée dans un
  nouvel onglet.

### Accessibilité du back-office

- **EDI-24** — Le back-office est utilisable au clavier et n'a aucune violation
  axe-core *serious* ou *critical*.

## Hors périmètre

- Édition directement dans l'aperçu (édition « en ligne »).
- Glisser-déposer.
- Utilisation du back-office sur mobile ou tablette.
- Annuler / rétablir (Ctrl+Z) au-delà de celui du navigateur dans les champs.
- Gestion des rôles (tous les éditeurs ont les mêmes droits).
