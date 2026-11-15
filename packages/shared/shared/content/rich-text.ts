import { FilterXSS, friendlyAttrValue, parseAttr } from 'xss'

// Assainisseur du texte mis en forme (CNT-05, CNT-06), appelé à l'enregistrement
// (schéma `richText()`) et au rendu (composant RichText). Liste blanche : toute
// balise ou tout attribut absent ci-dessous est retiré.

const allowedTags = new Set(['p', 'h3', 'strong', 'em', 'a', 'ul', 'ol', 'li', 'br'])

// HTML collé (traitement de texte, page web) : titres ramenés au niveau 3 (un
// seul h1 par page, SOC-17), équivalents de gras et d'italique.
const renamedTags: Record<string, string> = { h1: 'h3', h2: 'h3', h4: 'h3', h5: 'h3', h6: 'h3', b: 'strong', i: 'em' }

// Balises retirées avec leur contenu ; les autres le sont sans leur texte.
const removedWithContent = ['script', 'style', 'iframe', 'object', 'embed', 'svg', 'math', 'noscript', 'template', 'textarea', 'select']

const newTabHint = '<span class="visually-hidden"> (nouvel onglet)</span>'

// Liens gardés : https, mailto et liens internes (/…, #…). Comme pour les champs
// de lien (CNT-04), http et tout autre schéma (javascript:, data:…) sont refusés.
// `friendlyAttrValue` a déjà changé les caractères de contrôle en espaces.
function isAllowedHref(href: string): boolean {
  if (/[\s\\]/.test(href) || href.includes('\u007F')) return false
  return /^https:\/\/[^/]/i.test(href) || /^mailto:/i.test(href) || /^\/(?!\/)/.test(href) || href.startsWith('#')
}

function escapeAttribute(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

interface OpenTag {
  tag: string
  newTab: boolean
}

function filter(html: string, forDisplay: boolean): string {
  // Balises ouvertes, pour refermer celles qui ne le sont pas : un texte mal
  // formé ne doit pas déborder sur le reste de la page.
  const open: OpenTag[] = []
  const close = ({ tag, newTab }: OpenTag) => newTab ? `${newTabHint}</a>` : `</${tag}>`

  function openLink(rawHtml: string): string {
    let href = ''
    parseAttr(rawHtml.replace(/^<a/i, '').replace(/\/?>$/, ''), (name, value) => {
      // Entités décodées (&#x61; comme &amp;) avant de vérifier le schéma du lien.
      if (name === 'href') href = friendlyAttrValue(value).replace(/&amp;/gi, '&')
      return ''
    })
    if (!isAllowedHref(href)) {
      open.push({ tag: 'a', newTab: false })
      return '<a>'
    }
    // Au rendu, un lien externe s'ouvre dans un nouvel onglet, signalé aux
    // lecteurs d'écran.
    const newTab = forDisplay && href.toLowerCase().startsWith('https:')
    open.push({ tag: 'a', newTab })
    return `<a href="${escapeAttribute(href)}"${newTab ? ' target="_blank" rel="noopener"' : ''}>`
  }

  const xss = new FilterXSS({
    whiteList: {},
    stripIgnoreTag: true,
    stripIgnoreTagBody: removedWithContent,
    allowCommentTag: false,
    onTag(rawTag, rawHtml, { isClosing }) {
      const tag = renamedTags[rawTag] ?? rawTag
      // Balise non autorisée : retirée par xss.
      if (!allowedTags.has(tag)) return undefined
      if (tag === 'br') return '<br>'
      if (isClosing) {
        const index = open.findLastIndex(entry => entry.tag === tag)
        return index === -1 ? '' : open.splice(index).reverse().map(close).join('')
      }
      if (tag === 'a') return openLink(rawHtml)
      open.push({ tag, newTab: false })
      return `<${tag}>`
    },
  })

  const result = xss.process(html)
  return result + open.reverse().map(close).join('')
}

// Pour l'enregistrement : HTML réduit à la liste blanche.
export function sanitizeRichText(html: string): string {
  return filter(html, false)
}

// Pour l'affichage : même assainissement, liens externes dans un nouvel onglet.
export function renderRichText(html: string): string {
  return filter(html, true)
}
