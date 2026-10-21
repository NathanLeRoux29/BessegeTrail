# Spécifications

Specs fonctionnelles et techniques du site du Trail de Bessèges. Les décisions de
cadrage sont dans [`../cadrage.md`](../cadrage.md).

## Index

| # | Spec | Préfixe des critères |
|---|---|---|
| 01 | [Site public : socle (header, footer, SEO, accessibilité, pages légales)](01-site-socle.md) | `SOC` |
| 02 | [Site public : sections de la page d'accueil](02-site-accueil-sections.md) | `ACC` |
| 03 | [Site public : pages des épreuves](03-site-epreuves.md) | `EPR` |
| 04 | [Thème](04-theme.md) | `THM` |
| 05 | [Contenu : modèle, brouillon et publication, fichiers](05-contenu-publication.md) | `CNT` |
| 06 | [Back-office : éditeur de pages](06-back-office-editeur.md) | `EDI` |
| 07 | [Back-office : tableau de bord et statistiques](07-back-office-tableau-de-bord.md) | `DSH` |
| 08 | [Authentification et sécurité](08-authentification-securite.md) | `AUT` |
| 09 | [Déploiement, CI/CD et maintenance GitHub](09-deploiement-ci-cd.md) | `DEP` |
| 10 | [Site public : page Infos pratiques (infos sur place et FAQ)](10-site-infos-pratiques.md) | `INF` |

## Structure d'une spec

Chaque spec contient :

1. **Objectif** : pourquoi cette partie existe.
2. **User stories** : `En tant que <rôle>, je veux <action> afin de <bénéfice>.`
3. **Critères d'acceptation** : identifiants stables (`ACC-04`), rédigés pour être
   traduits directement en tests (format *Étant donné / Quand / Alors* quand c'est
   utile). Les issues GitHub référencent ces identifiants.
4. **Hors périmètre** : ce qui n'est volontairement pas fait.

## Priorités

| Priorité | Sens |
|---|---|
| **P1** | Indispensable à la mise en ligne du 1er janvier 2027 |
| **P2** | Utile, à faire après les P1 si le temps le permet |

Sans mention, un critère est P1.

## Rôles

| Rôle | Description |
|---|---|
| Visiteur | Coureur, accompagnant, partenaire, sur mobile ou ordinateur |
| Éditeur | Membre de l'association connecté au back-office (2 personnes) |
| Développeur | Mainteneur technique (déploiement, comptes, sauvegardes) |

## Glossaire

| Terme | Définition |
|---|---|
| Page | Accueil, infos pratiques, page d'épreuve, mentions légales ou confidentialité |
| Section | Bloc prédéfini d'une page (ex. « FAQ »), affichable ou masquable |
| Éléments communs | Header, footer et paramètres généraux, partagés par toutes les pages |
| Brouillon | Version modifiée non publiée, visible uniquement dans l'aperçu du back-office |
| Version publiée | Version visible par les visiteurs |
| Épreuve | Une des 5 courses ou marches (trails 40, 20, 13 km, randonnée, marche solidaire) |
