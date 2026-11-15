import { describe, expect, it } from 'vitest'
import { blockSchemas } from '../shared/content/blocks'
import { renderRichText, sanitizeRichText } from '../shared/content/rich-text'

describe('sanitizeRichText : balises autorisées (CNT-05)', () => {
  it('CNT-05 : conserve paragraphes, titres de niveau 3, gras, italique, liens, listes et sauts de ligne', () => {
    const html = '<h3>Accès</h3><p><strong>Gras</strong>, <em>italique</em>,<br><a href="https://exemple.fr">lien</a></p>'
      + '<ul><li>Un</li></ul><ol><li>Deux</li></ol>'

    expect(sanitizeRichText(html)).toBe(html)
  })

  it('CNT-05 : transforme h1, h2 et h4 en h3, b en strong et i en em', () => {
    expect(sanitizeRichText('<h1>Un</h1><h2>Deux</h2><h4>Quatre</h4><p><b>Gras</b> <i>italique</i></p>'))
      .toBe('<h3>Un</h3><h3>Deux</h3><h3>Quatre</h3><p><strong>Gras</strong> <em>italique</em></p>')
  })

  it('CNT-05 : retire les autres balises en gardant leur texte', () => {
    expect(sanitizeRichText('<div><span>Texte</span> <u>souligné</u> <table><tr><td>case</td></tr></table></div>'))
      .toBe('Texte souligné case')
  })

  it('CNT-05 : retire tous les attributs sauf href', () => {
    expect(sanitizeRichText('<p class="x" style="color: red" id="a"><a href="/infos-pratiques" title="t" target="_self">Infos</a></p>'))
      .toBe('<p><a href="/infos-pratiques">Infos</a></p>')
  })

  it.each([
    'https://exemple.fr/page?a=1&amp;b=2',
    'mailto:contact@trail-besseges.fr',
    '/epreuves/trail-40',
    '#faq',
  ])('CNT-05 : garde un lien vers %s', (href) => {
    expect(sanitizeRichText(`<a href="${href}">lien</a>`)).toBe(`<a href="${href}">lien</a>`)
  })

  it('CNT-05 : referme les balises laissées ouvertes et ignore les fermetures en trop', () => {
    expect(sanitizeRichText('<p><strong>gras</p></em><ul><li>un')).toBe('<p><strong>gras</strong></p><ul><li>un</li></ul>')
  })
})

describe('sanitizeRichText : injection de code (CNT-06)', () => {
  it('CNT-06 : supprime <script> et <style> avec leur contenu', () => {
    expect(sanitizeRichText('<p>a</p><script>alert(1)</script><style>p { display: none }</style><p>b</p>'))
      .toBe('<p>a</p><p>b</p>')
  })

  it('CNT-06 : supprime onclick et les balises qui exécutent du code', () => {
    const html = '<p onclick="alert(1)">a</p><img src="x" onerror="alert(1)"><svg onload="alert(1)"><circle /></svg>'
      + '<iframe src="https://exemple.fr"></iframe><object data="x"></object>'

    expect(sanitizeRichText(html)).toBe('<p>a</p>')
  })

  it.each([
    'javascript:alert(1)',
    'JaVaScRiPt:alert(1)',
    ' javascript:alert(1)',
    'jav&#x61;script:alert(1)',
    'jav&#97;script:alert(1)',
    'java\nscript:alert(1)',
    'java&#x09;script:alert(1)',
    'data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==',
    'vbscript:msgbox(1)',
    'http://exemple.fr',
    '//exemple.fr',
    '/\\exemple.fr',
  ])('CNT-06 : supprime le lien %j', (href) => {
    expect(sanitizeRichText(`<a href="${href}">lien</a>`)).toBe('<a>lien</a>')
  })

  it('CNT-06 : neutralise le HTML mal formé', () => {
    const result = sanitizeRichText('<<script>script>alert(1)<</script>/script><p>ok</p>')

    expect(result).not.toMatch(/<script|<\/script/i)
    expect(result).toContain('<p>ok</p>')
  })

  it('CNT-06 : échappe le texte qui ressemble à du HTML', () => {
    expect(sanitizeRichText('<p>1 < 2 et "guillemets"</p>')).toBe('<p>1 &lt; 2 et "guillemets"</p>')
  })

  it('CNT-06 : supprime les commentaires HTML', () => {
    expect(sanitizeRichText('<p>a<!-- <script>alert(1)</script> --></p>')).toBe('<p>a</p>')
  })

  it('assainir deux fois donne le même résultat', () => {
    const once = sanitizeRichText('<h1 class="x">T</h1><p onclick="x"><b>a</b><a href="javascript:x">b</a><a href="https://e.fr">c</a>')

    expect(sanitizeRichText(once)).toBe(once)
  })
})

describe('assainissement à l’enregistrement (CNT-06)', () => {
  it('CNT-06 : le schéma d’un bloc assainit le texte mis en forme qu’il valide', () => {
    const block = blockSchemas['home.presentation'].parse({ text: '<p onclick="alert(1)">Bienvenue</p><script>alert(1)</script>' })

    expect(block.text).toBe('<p>Bienvenue</p>')
  })

  it('CNT-06 : tous les textes mis en forme sont assainis (FAQ, épreuves, pages légales)', () => {
    const script = '<p>ok</p><script>alert(1)</script>'

    expect(blockSchemas['infos.faq'].parse({ items: [{ question: 'Q ?', answer: script }] }).items[0]?.answer).toBe('<p>ok</p>')
    expect(blockSchemas['race.trail-40'].parse({ description: script, extra: script })).toMatchObject({ description: '<p>ok</p>', extra: '<p>ok</p>' })
    expect(blockSchemas['page.mentions-legales'].parse({ text: script }).text).toBe('<p>ok</p>')
  })
})

describe('renderRichText : rendu des liens', () => {
  it('ouvre un lien https dans un nouvel onglet et le signale aux lecteurs d’écran', () => {
    expect(renderRichText('<p><a href="https://exemple.fr">Résultats</a></p>'))
      .toBe('<p><a href="https://exemple.fr" target="_blank" rel="noopener">Résultats<span class="visually-hidden"> (nouvel onglet)</span></a></p>')
  })

  it('laisse les liens internes et mailto: dans l’onglet courant', () => {
    const html = '<p><a href="/infos-pratiques">Infos</a> <a href="mailto:contact@trail-besseges.fr">Écrire</a></p>'

    expect(renderRichText(html)).toBe(html)
  })

  it('CNT-06 : assainit aussi au rendu', () => {
    expect(renderRichText('<p onclick="alert(1)"><a href="javascript:alert(1)" target="_blank">x</a></p><script>alert(1)</script>'))
      .toBe('<p><a>x</a></p>')
  })
})
