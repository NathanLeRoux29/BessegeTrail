// Messages de commit : Conventional Commits, description en français (DEP-10).
// Vérifiés par le hook commit-msg (husky) et par le job lint de la CI.
export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'scope-enum': [2, 'always', ['site', 'admin', 'shared', 'contenu', 'auth', 'infra', 'ci', 'docs', 'deps', 'claude']],
    // Descriptions en français : les noms propres et sigles gardent leur casse.
    'subject-case': [0],
    // Les commits de Dependabot contiennent des lignes très longues.
    'body-max-line-length': [0],
    'footer-max-line-length': [0],
  },
}
