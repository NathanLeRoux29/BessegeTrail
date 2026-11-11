// Versions et releases GitHub (DEP-11), calculées à partir des messages de commit :
// dev → X.Y.Z-dev.N, preprod → X.Y.Z-rc.N, main → X.Y.Z. Lancé par le workflow release.
// Après une release sur main, fusionner main dans dev (voir CLAUDE.md).
export default {
  branches: [
    'main',
    { name: 'preprod', prerelease: 'rc', channel: 'rc' },
    { name: 'dev', prerelease: 'dev', channel: 'dev' },
  ],
  plugins: [
    ['@semantic-release/commit-analyzer', { preset: 'conventionalcommits' }],
    // Les notes de la release GitHub tiennent lieu de changelog : aucun commit
    // n'est poussé sur les branches protégées.
    ['@semantic-release/release-notes-generator', { preset: 'conventionalcommits' }],
    // Pas de commentaire ni de label sur les issues : une version par push sur dev
    // en créerait beaucoup.
    ['@semantic-release/github', { successComment: false, failComment: false, releasedLabels: false }],
  ],
}
