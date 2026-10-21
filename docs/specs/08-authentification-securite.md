# 08 — Authentification et sécurité

## Objectif

Réserver le back-office aux éditeurs autorisés et limiter la surface d'attaque,
avec des mécanismes simples adaptés à 2 ou 3 comptes.

## User stories

- En tant qu'éditeur, je veux me connecter avec mon e-mail et mon mot de passe
  afin d'accéder au back-office.
- En tant qu'éditeur, je veux rester connecté sur mon ordinateur pendant quelques
  jours afin de ne pas ressaisir mon mot de passe à chaque visite.
- En tant qu'éditeur, je veux changer mon mot de passe afin de le garder secret.
- En tant que développeur, je veux créer les comptes et réinitialiser un mot de
  passe en ligne de commande afin de ne pas maintenir d'écrans d'administration
  des comptes.

## Critères d'acceptation

### Comptes

- **AUT-01** — Il n'existe aucune page d'inscription. Les comptes sont créés par une
  commande exécutée dans le conteneur admin :
  `pnpm admin:user create --email … --name …`. Elle affiche un mot de passe
  temporaire.
- **AUT-02** — La même commande permet de réinitialiser un mot de passe
  (`reset-password`) et de désactiver un compte (`disable`).
- **AUT-03** — À la première connexion avec un mot de passe temporaire, l'éditeur
  doit choisir un nouveau mot de passe.
- **AUT-04** — Un mot de passe fait au moins 12 caractères. Il est stocké haché
  (scrypt via `nuxt-auth-utils`), jamais en clair ni dans les logs.

### Connexion et session

- **AUT-05** — La page de connexion demande l'e-mail et le mot de passe. En cas
  d'échec, le message est identique que l'e-mail existe ou non (« E-mail ou mot de
  passe incorrect »).
- **AUT-06** — Après 5 échecs en 15 minutes pour une même adresse IP ou un même
  e-mail, les tentatives sont bloquées 15 minutes.
- **AUT-07** — La session est stockée dans un cookie scellé, `HttpOnly`, `Secure`,
  `SameSite=Strict`, d'une durée de 7 jours, prolongée à chaque utilisation.
- **AUT-08** — « Se déconnecter » invalide la session et renvoie vers la page de
  connexion.
- **AUT-09** — Désactiver un compte ou changer son mot de passe invalide ses
  sessions en cours.
- **AUT-10** — Dans « Mon compte », l'éditeur peut modifier son prénom et son mot de
  passe (en saisissant l'ancien).

### Protection des routes

- **AUT-11** — Toutes les pages de l'admin, sauf la connexion, redirigent vers la
  page de connexion sans session valide.
- **AUT-12** — Toutes les routes d'API de l'admin, sauf la connexion et l'endpoint
  de santé, renvoient HTTP 401 sans session valide. Un test parcourt la liste des
  routes pour le vérifier.
- **AUT-13** — Les requêtes qui modifient des données (POST, PUT, PATCH, DELETE)
  sont refusées si l'en-tête `Origin` n'est pas celui de l'admin (protection CSRF,
  en complément de `SameSite=Strict`).

### En-têtes et durcissement

- **AUT-14** — Le site et l'admin envoient : `Strict-Transport-Security`,
  `X-Content-Type-Options: nosniff`, `Referrer-Policy:
  strict-origin-when-cross-origin`, et une `Content-Security-Policy` sans
  `unsafe-eval`.
- **AUT-15** — L'admin interdit son affichage dans un cadre externe
  (`frame-ancestors 'self'`, pour permettre uniquement sa propre iframe d'aperçu).
- **AUT-16** — L'admin envoie `X-Robots-Tag: noindex, nofollow`.
- **AUT-17** — Le site public n'expose aucune route d'écriture, d'envoi de fichier
  ou d'authentification. Un test vérifie qu'une requête POST sur le site renvoie
  HTTP 404 ou 405.
- **AUT-18** — Les secrets (mot de passe de session, jeton Umami, clés SSH) sont
  fournis par variables d'environnement. Aucun secret n'est versionné.
- **AUT-19** — Les conteneurs s'exécutent avec un utilisateur non root.

## Hors périmètre

- « Mot de passe oublié » par e-mail (V1 : réinitialisation par le développeur en
  ligne de commande ; envisageable plus tard via l'e-mail Google Workspace).
- Double authentification (2FA).
- Connexion via Google.
- Rôles et permissions différenciés.
- Journal d'audit au-delà de l'auteur et de la date des modifications (spec 05,
  CNT-12).
