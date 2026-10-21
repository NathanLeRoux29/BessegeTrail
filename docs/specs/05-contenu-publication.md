# 05 — Contenu : modèle, brouillon et publication, fichiers

## Objectif

Définir comment le contenu est structuré, validé, stocké et publié, de façon
partagée entre le site public (lecture seule) et le back-office (écriture).

## Modèle de contenu

Le contenu est découpé en **blocs**, chacun identifié par une clé et validé par un
schéma Zod défini dans `packages/shared`.

| Clé | Page dans le back-office | Contenu |
|---|---|---|
| `settings` | Éléments communs | Nom de l'événement, date et heure de départ, lieu, e-mail, réseaux sociaux, lien d'inscription général, SEO par défaut |
| `header` | Éléments communs | Logo, titre, éléments du menu, bouton d'action |
| `footer` | Éléments communs | Nom de l'association, texte libre |
| `home.hero` … `home.contact` | Accueil | Une clé par section (voir spec 02) |
| `infos.page`, `infos.pratiques`, `infos.faq` | Infos pratiques | En-tête de la page, infos sur place, FAQ (voir spec 10) |
| `race.trail-40` … `race.marche-solidaire` | Épreuves | Une clé par épreuve (voir spec 03) |
| `page.mentions-legales`, `page.confidentialite` | Pages légales | Titre, texte, SEO |

Chaque bloc stocke une **version publiée** et éventuellement un **brouillon**.

## User stories

- En tant qu'éditeur, je veux préparer mes modifications sans qu'elles soient
  visibles afin de les vérifier avant publication.
- En tant qu'éditeur, je veux publier toutes les modifications d'une page en une
  fois afin de ne pas mettre en ligne un état incohérent.
- En tant qu'éditeur, je veux pouvoir annuler mes modifications non publiées afin
  de revenir à ce qui est en ligne.
- En tant qu'éditeur, je veux pouvoir restaurer une ancienne version afin de
  réparer une erreur.
- En tant que développeur, je veux que le site démarre avec un contenu de démo
  complet afin de montrer un rendu réaliste dès la première installation.

## Critères d'acceptation

### Validation

- **CNT-01** — Chaque bloc a un schéma Zod unique, utilisé à la fois par le
  back-office (validation à l'enregistrement, côté serveur) et par le site
  (typage du rendu).
- **CNT-02** — Un enregistrement non conforme au schéma est refusé (HTTP 422) avec
  la liste des champs en erreur, en français.
- **CNT-03** — Les limites de longueur sont définies dans les schémas (ex. titre de
  section ≤ 80 caractères, meta description ≤ 160) et affichées dans les formulaires.
- **CNT-04** — Les URL externes (inscription, résultats, réseaux, partenaires) sont
  validées : seules `https://` et `mailto:` sont acceptées.

### Texte mis en forme

- **CNT-05** — Les textes mis en forme acceptent uniquement : paragraphes, titres de
  niveau 3, gras, italique, liens, listes à puces et numérotées.
- **CNT-06** — Le HTML est assaini côté serveur à l'enregistrement **et** au rendu
  (liste blanche de balises et d'attributs). Un test vérifie qu'un `<script>`, un
  attribut `onclick` ou un lien `javascript:` sont supprimés.

### Brouillon et publication

- **CNT-07** — Enregistrer un bloc crée ou remplace son brouillon. La version
  publiée n'est pas modifiée.
- **CNT-08** — Le site public lit uniquement les versions publiées.
- **CNT-09** — « Publier » s'applique à une page entière (Accueil, Infos
  pratiques, une épreuve, une page légale, ou les éléments communs) : tous les brouillons de la page deviennent
  la version publiée, en une seule transaction.
- **CNT-10** — « Annuler les modifications » supprime les brouillons de la page.
- **CNT-11** — Une publication est visible sur le site public en moins de
  10 secondes.
- **CNT-12** — Chaque brouillon et chaque publication enregistrent l'auteur et la
  date.
- **CNT-13** — Si un autre éditeur a enregistré le même bloc depuis son ouverture,
  l'enregistrement est refusé avec le message « Ce contenu a été modifié par
  <nom> à <heure>. Rechargez la page. » (verrouillage optimiste).

### Historique (P2)

- **CNT-14** (P2) — Les 10 dernières versions publiées de chaque page sont
  conservées.
- **CNT-15** (P2) — Un éditeur peut restaurer une version : elle devient le
  brouillon de la page, à vérifier puis publier.

### Contenu par défaut

- **CNT-16** — Au premier démarrage sur une base vide, tous les blocs sont créés
  avec un contenu de démonstration publié (textes, images libres de droits, un GPX
  d'exemple).
- **CNT-17** — Le contenu de démo est défini dans des fichiers versionnés du layer
  partagé et validé par les mêmes schémas (un test le vérifie).
- **CNT-18** — Le chargement du contenu de démo ne s'exécute jamais sur une base
  qui contient déjà du contenu.

### Fichiers

- **CNT-19** — Images acceptées : JPEG, PNG, WebP, ≤ 10 Mo. Elles sont converties
  en WebP en 3 largeurs (480, 960, 1600 px, sans agrandissement), sans métadonnées
  EXIF (dont la position GPS).
- **CNT-20** — Logos acceptés : PNG, WebP ou SVG. Les SVG sont assainis (aucun
  script ni lien externe).
- **CNT-21** — PDF accepté pour le règlement, ≤ 10 Mo.
- **CNT-22** — GPX accepté, ≤ 5 Mo, uniquement si le fichier est un XML valide dont
  la racine est `<gpx>`.
- **CNT-23** — Le type de fichier est vérifié sur son contenu réel, pas seulement
  sur son extension. Les noms de fichiers stockés sont générés (aucun nom fourni
  par l'utilisateur sur le disque).
- **CNT-24** — Chaque image porteuse d'information exige un texte alternatif à
  l'enregistrement.
- **CNT-25** (P2) — Les fichiers qui ne sont plus référencés par aucun bloc
  (publié, brouillon ou historique) sont supprimés par une tâche de nettoyage.

### Stockage

- **CNT-26** — Le contenu est stocké dans SQLite. Le schéma de base est géré par
  des migrations Drizzle versionnées, exécutées uniquement par l'admin au
  démarrage.
- **CNT-27** — Le site public ouvre la base en lecture seule. Un test vérifie
  qu'une tentative d'écriture depuis le site échoue.

### Contenu et code : deux circuits séparés

Le **code** (gabarits, composants, schémas) vit dans Git et monte
`local → dev → preprod → prod` par les PR. Le **contenu** (textes, images,
fichiers déposés dans le back-office) vit dans la base SQLite et le dossier
uploads du serveur de prod. Il n'est jamais dans Git, et il ne circule que dans
l'autre sens : `prod → préprod → poste local`.

```
          CODE (Git)                         CONTENU (base + uploads)
  local ─▶ dev ─▶ preprod ─▶ main          prod ─▶ préprod ─▶ local
          (PR + CI à chaque étape)          (copie, jamais l'inverse)
```

- **CNT-28** — Un déploiement remplace uniquement le code. La base et le dossier
  uploads sont des volumes Docker persistants : le contenu publié, les brouillons
  et l'historique sont conservés d'une version à l'autre.
- **CNT-29** — Seul le back-office de **production** sert à modifier le contenu
  réel. Le contenu modifié en préprod ou en local n'est jamais recopié en prod.
- **CNT-30** — Chaque schéma de bloc a une valeur par défaut pour tout nouveau
  champ, de sorte qu'un contenu existant reste valide après l'ajout d'un champ ou
  d'une section (la nouvelle section arrive avec son contenu de démo, masquée si
  elle est masquable).
- **CNT-31** — Un changement de structure qui modifie un contenu existant
  (renommage, déplacement, suppression d'un champ ou d'une section) est fait par
  une **migration de contenu** versionnée dans le code, exécutée par l'admin au
  démarrage, après les migrations Drizzle. Elle s'applique aux versions publiées,
  aux brouillons et à l'historique, et n'est exécutée qu'une fois.
- **CNT-32** — Chaque migration de contenu a un test qui part d'un exemple de
  contenu dans l'ancien format et vérifie le résultat dans le nouveau format.
- **CNT-33** — Si le contenu en base ne passe pas la validation après les
  migrations, l'admin refuse de démarrer et journalise les blocs en erreur : le
  déploiement échoue (DEP-15) et la version précédente reste en ligne.

## Hors périmètre

- Médiathèque centrale (chaque fichier est déposé dans le champ qui l'utilise).
- Recadrage ou retouche d'image dans le back-office.
- Publication programmée à une date future.
- Édition simultanée en temps réel.
